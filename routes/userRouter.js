const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const router = express.Router();

router.get("/", userController.getAllUsers);

router.post("/signUp", authController.signUp);
router.post("/login", authController.login);

router.post(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);
router.patch(
  "/updateCurrentUser",
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.get(
  "/currentUser",
  authController.protect,
  authController.getCurrentUser
);

router.delete("/deleteMe", authController.protect, authController.deleteMe);

// router.post("/checkEmail", authController.checkEmail);
router.route("/checkEmail").post(authController.checkEmail);

router.route("/user/:id").get(userController.getOneUser);
module.exports = router;
