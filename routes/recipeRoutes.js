const express = require("express");
const recipeController = require("./../controllers/recipeController");
const authController = require("./../controllers/authController");
const router = express.Router();

router
  .route("/")
  .get(recipeController.getAllRecipes)
  .post(authController.protect, recipeController.createRecipe);

router.get(
  "/userRecipes",
  authController.protect,
  recipeController.getUserRecipes
);

router.get("/recipeQueryTest", recipeController.recipeQueryTest);

router.route("/:id").get(authController.protect, recipeController.getOneRecipe);
router
  .route("/:id")
  .patch(authController.protect, recipeController.updateRecipe)
  .delete(authController.protect, recipeController.deleteRecipe);

// authController.restrictTo("admin"),

module.exports = router;
