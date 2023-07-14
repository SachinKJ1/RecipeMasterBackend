const mongoose = require("mongoose");
const Recipe = require("./../models/recipeModel");
const User = require("./../models/userModel");

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A Bookmark should belong to a User"],
    },
    recipe: {
      type: mongoose.Schema.ObjectId,
      ref: "Recipe",
      required: [true, "A Bookmark should belong to a Recipe"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
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
// used to set the unique property on these fields. doesn't work if put directly into schema.
bookmarkSchema.index({ user: 1, recipe: 1 }, { unique: true });

bookmarkSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name",
  }).populate({
    path: "recipe",
    select: "title image_url cooking_time",
  });
  next();
});

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
module.exports = Bookmark;
