const express = require("express");
const cors = require("cors");
const recipeRoutes = require("./routes/recipeRoutes");
const userRoutes = require("./routes/userRouter");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const globalErrorHandler = require("./controllers/errorController");
// core path module so we dont need '/' to seperate paths
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.json());

app.use("/api/v1/recipes", recipeRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/bookmarks", bookmarkRoutes);

// using the global Error Handling middleware
app.use(globalErrorHandler);

module.exports = app;
