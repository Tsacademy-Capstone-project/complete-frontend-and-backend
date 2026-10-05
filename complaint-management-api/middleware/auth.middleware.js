const jwt = require("jsonwebtoken");

const User = require("../models/user.model.js");
const AppError = require("../utils/app-error.js");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    if (!user.isActive) {
      throw new AppError("Your account has been deactivated", 403);
    }

    req.user = user;

    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = protect;
