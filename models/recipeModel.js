const mongoose = require("mongoose");
const Bookmark = require("./../models/bookmarksModel");
const User = require("./../models/userModel");
const recipeSchema = new mongoose.Schema(
  {
    ingredients: [
      {
        quantity: {
          type: Number,
          default: null,
        },
        unit: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          required: [true, "A Ingredient must have a description"],
        },
      },
    ],
    source_url: {
      type: String,
    },
    image_url: {
      type: String,
      required: [true, "A Recipe must have a Image."],
    },
    title: {
      type: String,
      required: [true, "A Recipe must specify the Name of a recipe."],
      unique: [
        true,
        "Title of this recipe matches with another recipe in the collection. Please provide a different name.",
      ],
    },
    servings: {
      type: Number,
      required: [
        true,
        "A Recipe must specify the number of servings the recipe is for.",
      ],
    },
    cooking_time: {
      type: Number,
      required: [true, "A Recipe must specify the Cooking time of a recipe."],
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A recipe must be created by a user"],
    },
    createdAt: {
      type: Date,
      default: new Date(Date.now()),
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

recipeSchema.virtual("ingredientsNum").get(function () {
  if (this.ingredients) return this.ingredients.length;
});

recipeSchema.virtual("bookmarks", {
  ref: "Bookmark",
  foreignField: "recipe",
  localField: "_id",
});
// to populate the created by field which is form another document
recipeSchema.pre(/^find/, function (next) {
  this.populate({
    path: "createdBy",
    select: "name",
  });
  next();
});

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;
