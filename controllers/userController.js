const catchAsync = require("../utils/catchAsync");

const AppError = require("./../utils/appError");

const User = require("./../models/userModel");

// for image upload we use multer. we installed it first
const multer = require("multer");
// to resize images
const sharp = require("sharp");
// image stored in buffer so we can take it and process it before storing it permanently
const multerStorage = multer.memoryStorage();

// check if the uploaded file is image or not
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! please upload only images", 400), false);
  }
};
// multer configuration
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// works for single file image upload
exports.uploadUserPhoto = upload.single("photo");

// to resize and format image
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  // check if user uploaded an image
  if (!req.file) return next();
  // setting name to user image. we use jpeg bcs we are converting all images into jpef in the processing secton
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // image processing after taking photo from buffer
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().populate("recipe").populate("bookmarks");
  if (!users) {
    next(new AppError("Something went wrong", 404));
  }

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getOneUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id)
    .populate({
      path: "recipe",
      select: "title image_url -createdBy",
    })
    .select("-role -email -__v");
  if (!user) {
    next(new AppError("The user no longer exists", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  let updateBody = { name: req.body.name };

  if (req.file?.filename) {
    updateBody.photo = req.file.filename;
  }
  const user = await User.findByIdAndUpdate(req.user.id, updateBody, {
    new: true,
  });

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

// exports.uploadUserPhoto = catchAsync(async (req, res, next) => {
//   const user = await User.findByIdAndUpdate(
//     req.user.id,
//     { photo },
//     {
//       new: true,
//     }
//   );

//   if (!user) {
//     return next(new AppError("User not Found", 401));
//   }

//   user.photo = `${req.protocol}://${req.get("host")}/img/users/${user.photo}`;
//   res.status(200).json({
//     status: "success",
//     data: {
//       user,
//     },
//   });
// });
