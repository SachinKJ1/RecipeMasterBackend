const mongoose = require("mongoose");
// validator library to check email addresses
const Bookmark = require("./bookmarksModel");
const Recipe = require("./recipeModel");

const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Tell Us Your Name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email!"],
      unique: true,
      lowercase: true,
      validators: [validator.isEmail, "Please provide a valid email"],
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please provide a valid password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please Confirm Your Password"],
      validate: {
        // vaidation will only run for create() and save()
        validator: function (val) {
          return val === this.password;
        },
        message: "Password Do Not Match",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
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

userSchema.virtual("bookmarks", {
  ref: "Bookmark",
  foreignField: "user",
  localField: "_id",
});

userSchema.virtual("recipe", {
  ref: "Recipe",
  foreignField: "createdBy",
  localField: "_id",
});

// for password encryption and removing password confirmation fields
userSchema.pre("save", async function (next) {
  // only runs if password was modified
  if (!this.isModified("password")) return next();

  // hash and salting the password
  this.password = await bcrypt.hash(this.password, 12);

  // Delete password confirm fields
  this.passwordConfirm = undefined;

  next();
});

// mongoose middleware for setting passwordChangedAt property
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// remove deleted account user from query
userSchema.pre(/^find/, function (next) {
  // this points to current query
  this.find({ active: { $ne: false } });
  next();
});

// for login checking if userprovided password is correct
userSchema.methods.correctPassword = async function (
  clientPassword,
  databasePassword
) {
  // returns boolean after comparison
  return await bcrypt.compare(clientPassword, databasePassword);
};

// Instance methods to check if user changed password after token issued
userSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    // parseInt(this.passwordChangedAt.getTime() / 1000,10); done to convert date to timestamp in seconds. which is the format stored in jsonwebtoken
    const ChangedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // compares the timestamp form jsonwebtoken and password ChangedTimeStamp
    return jwtTimeStamp < ChangedTimeStamp;
  }
  // default false means user never changed password
  return false;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
