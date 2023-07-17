const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

mongoose
  .connect(process.env.DATABASE, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("DB connection established");
  })
  .catch((err) => {
    console.log("A problem occurred while connecting to database" + err);
  });

const app = require("./app");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, (req, res) => {
  console.log("server listening on port " + PORT);
});
