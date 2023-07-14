const User = require("../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
//  to make a sync function async user promisify. used for token verification.
const { promisify } = require("util");
// import jwt library
const jwt = require("jsonwebtoken");
// token generator function
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statuscode, res) => {
  const token = signToken(user._id);
  res.status(statuscode).json({
    status: "success",
    token: token,
    data: {
      user: user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  // send token and response
  createAndSendToken(newUser, 201, res);
});

// for the aync validator in the reactive forms module
exports.checkEmail = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(200).json({
      available: true,
    });
  }
  return next(new AppError("Email Already Exists! Use A New Email", 401));
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // check if email and password is in the body
  if (!email || !password) {
    // using appError class to send a better error message
    return next(new AppError("Please provide a valid email and password", 400));
  }

  // check if password is correct. select("+password") is used so that it is returned from database bcs we made it not to for other requests
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrent Email Or Password", 401));
  }
  createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // console.log(token);

  if (!token) {
    return next(
      new AppError("You Must Be Logged In To Access This Route", 401)
    );
  }

  // verifying Token
  // token verification takes time so it should run asynchronously. thats why it is promisified so now it is as async function.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // checking if token holder is a valid user
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("User Accessing This Route No Longer Exists", 401)
    );
  }

  // now check if user changed password after this token was issued.
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed Password. Please log in again", 401)
    );
  }
  // Grant access to protected route
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You Does not Have Permission To Perform This Action", 401)
      );
    }
    next();
  };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user form database
  const user = await User.findById(req.user.id).select("+password");

  // checking if passord provided is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("The Password You Provided Is Incorrect", 401));
  }

  // if correct new password is set
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createAndSendToken(user, 200, res);
});

exports.getCurrentUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: "recipe",
      select: "title image_url -createdBy",
    })
    .populate({
      path: "bookmarks",
      select: "-user -__v",
    })
    .select("-role -__v");

  if (!user) {
    return next(new AppError("User not Found", 401));
  }

  user.photo = `${req.protocol}://${req.get("host")}/img/users/${user.photo}`;
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: "success",
    data: null,
  });
});
