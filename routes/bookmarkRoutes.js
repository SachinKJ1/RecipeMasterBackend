const express = require("express");
const bookmarkController = require("../controllers/bookmarkController");
const authController = require("./../controllers/authController");

const router = express.Router();

router
  .route("/")
  .post(authController.protect, bookmarkController.createBookmark);

router.get(
  "/userBookmarks",
  authController.protect,
  bookmarkController.getUserBookmarks
);
router
  .route("/:id")
  .get(bookmarkController.getBookmark)
  .delete(authController.protect, bookmarkController.deleteBookmark);

module.exports = router;
