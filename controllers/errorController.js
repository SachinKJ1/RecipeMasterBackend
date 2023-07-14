const AppError = require("./../utils/appError");

handleDuplicateFieldError = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate fields value : ${value} Please use another value instead`;
  return new AppError(message, 404);
};
// Global Error Handling middleware
module.exports = (err, req, res, next) => {
  // error handling  in development
  err.statuscode = err.statuscode || 500;
  err.status = err.status || "Internal Server Error";

  // to handle duplicate fields errors
  if (err.code === 11000) {
    err.message = "Duplicate field";
    err.statuscode = 400;
    err.status = "Failure";
  }

  res.status(err.statuscode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
  const error = Object.values(err.errors).map((el) => el.message);
  console.log(`Invalid input data ${error.join(". ")}`);
};
