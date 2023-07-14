class AppError extends Error {
  constructor(message, statuscode) {
    super(message);
    this.statuscode = statuscode;
    this.isOperational = true;
    this.status = `${statuscode}`.startsWith("4") ? "Failure" : "Error";

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
