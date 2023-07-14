const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const Recipe = require("./../models/recipeModel");
const { json } = require("express");

exports.getAllRecipes = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Recipe.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const allRecipes = await features.query;

  const counting = new ApiFeatures(Recipe.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const count = await Recipe.count(counting.query);
  res.status(200).json({
    status: "success",
    results: count,
    data: allRecipes,
  });
});

exports.getOneRecipe = catchAsync(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id).populate({
    path: "bookmarks",
    select: "-recipe -__v",
  });
  if (!recipe) {
    return next(new AppError("No Recipe Found", 404));
  }
  res.status(200).json({
    status: "success",
    data: recipe,
  });
});

exports.createRecipe = catchAsync(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  req.body.servings = 4;

  const recipe = await Recipe.create(req.body);

  res.status(200).json({
    status: "success",
    data: recipe,
  });
});

exports.updateRecipe = catchAsync(async (req, res, next) => {
  const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!recipe) {
    return next(new AppError("No Recipe found", 404));
  }
  res.status(200).json({
    status: "success",
    data: { data: recipe },
  });
});

exports.deleteRecipe = catchAsync(async (req, res, next) => {
  const recipe = await Recipe.findByIdAndDelete(req.params.id);

  if (!recipe) {
    return next(new AppError("No Recipe found", 404));
  }
  this.getUserRecipes(req,res,next);
});

exports.getUserRecipes = catchAsync(async (req, res, next) => {
  const recipe = await Recipe.find({ createdBy: req.user._id });

  if (!recipe) {
    return next(new AppError("No Recipe found", 404));
  }
  res.status(200).json({
    status: "success",
    results: recipe.length,
    data: { recipe },
  });
});

exports.recipeQueryTest = catchAsync(async (req, res, next) => {
  let query = JSON.stringify(req.query);
  query = query.replace(/\b(regex|options)\b/g, (match) => `$${match}`); // to put $ in front of gte, lte etc
  const recipe = await Recipe.find().find(JSON.parse(query));

  if (!recipe) {
    return next(new AppError("No Recipe found", 404));
  }
  res.status(200).json({
    status: "success",
    results: recipe.length,
    data: { recipe },
  });
});
