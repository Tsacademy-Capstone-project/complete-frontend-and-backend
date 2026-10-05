const AppError = require("../utils/app-error");

const errorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    return res.status(400).json({ errors });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });
  }

  if (err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json({ message: "incorrect token || token expired" });
  }
  if (err.name === "CastError") {
    return res
      .status(400)
      .json({ message: `Invalid ${err.path}:${err.value}` });
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Token not found, Access denied" });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || err.keyvalue || {})[0];
    const messages = {
      email: "Email already Exist",
      phoneNumber: "Phone Number Already exist",
      username: "Username Already exist",
    };
    return res
      .status(409)
      .json({ message: messages[field] || `${field} Already exist` });
  }
  console.error(err.message);
  res.status(500).json({ message: "Internal Server Error" });
};

module.exports = errorHandler;
