const Bookmark = require("../models/bookmarksModel");
const User = require("../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.createBookmark = catchAsync(async (req, res, next) => {
  // checking if user is bookmarking his own recipe
  const user = await User.findById(req.user.id).populate({
    path: "recipe",
    select: "createdBy",
  });
  let userRecipe = false;
  user.recipe.forEach((val) => {
    if (val.id === req.body.recipe) {
      userRecipe = true;
    }
  });
  if (userRecipe) {
    return next(new AppError("You Can't Bookmark your own Recipes", 401));
  }

  const bookmark = await Bookmark.create({
    user: req.user._id,
    recipe: req.body.recipe,
  });
  if (!bookmark) {
    return next(new AppError("You have already bookmarked this item", 400));
  }
  res.status(201).json({
    status: "success",
    data: {
      bookmark,
    },
  });
});

exports.deleteBookmark = catchAsync(async (req, res, next) => {
  const bookmark = await Bookmark.findByIdAndDelete(req.params.id);
  if (!bookmark) {
    return next(new AppError("No Bookmark found for this Recipe", 404));
  }
  this.getUserBookmarks(req, res, next);
  // res.status(200).json({
  //   status: "success",
  //   data: null,
  // });
});

exports.getBookmark = catchAsync(async (req, res, next) => {
  const bookmark = await Bookmark.findById(req.params.id);
  if (!bookmark) {
    next(new AppError("Bookmark not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      bookmark,
    },
  });
});

exports.getUserBookmarks = catchAsync(async (req, res, next) => {
  const bookmarks = await Bookmark.find({ user: req.user._id });
  if (!bookmarks) {
    return next(new AppError("No Bookmarked Recipes Yet", 404));
  }
  res.status(200).json({
    status: "success",
    results: bookmarks.length,
    data: {
      bookmarks,
    },
  });
});
