const bcrypt = require("bcryptjs");
const { createHash, timingSafeEqual } = require("node:crypto");

const User = require("../models/user.model.js");
const generateToken = require("../utils/generateToken.js");
const AppError = require("../utils/app-error.js");

const toPublicUser = (user) => {
  const publicUser = user.toObject();
  delete publicUser.password;
  return publicUser;
};

const createRegisteredUser = async (body, role) => {
  const { firstName, lastName, userName, email, password } = body || {};
  const fields = [firstName, lastName, userName, email];

  if (fields.some((field) => typeof field !== "string" || !field.trim())) {
    throw new AppError("First name, last name, username and email are required", 400);
  }

  const minPasswordLength = role === "ADMIN" ? 8 : 6;
  if (
    typeof password !== "string" ||
    password.length < minPasswordLength ||
    password.length > 20
  ) {
    throw new AppError(
      `Password must be between ${minPasswordLength} and 20 characters`,
      400,
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUserName = userName.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new AppError("A valid email address is required", 400);
  }
  if (normalizedUserName.length < 2 || normalizedUserName.length > 20) {
    throw new AppError("Username must be between 2 and 20 characters", 400);
  }

  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { userName: normalizedUserName }],
  });
  if (existingUser) {
    throw new AppError("User with this email or username already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    userName: normalizedUserName,
    email: normalizedEmail,
    password: hashedPassword,
    role,
  });
};

const register = async (req, res, next) => {
  try {
    const user = await createRegisteredUser(req.body, "USER");
    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const registerAdmin = async (req, res, next) => {
  try {
    const expectedCode = process.env.ADMIN_SIGNUP_CODE?.trim();
    if (!expectedCode) {
      throw new AppError("Admin signup is not configured. Contact the system administrator.", 503);
    }

    const signupCode = req.body?.signupCode;
    const hashCode = (code) => createHash("sha256").update(code).digest();
    if (
      typeof signupCode !== "string" ||
      !signupCode.trim() ||
      !timingSafeEqual(hashCode(signupCode.trim()), hashCode(expectedCode))
    ) {
      throw new AppError("A valid admin signup code is required", 403);
    }

    const user = await createRegisteredUser(req.body, "ADMIN");
    return res.status(201).json({
      message: "Admin registration successful",
      token: generateToken(user._id),
      user: toPublicUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, userName, password } = req.body;
    const loginIdentifier = email || userName;

    if (!loginIdentifier || !password) {
      throw new AppError("Email or username and password are required", 400);
    }

    const normalizedIdentifier = loginIdentifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { userName: normalizedIdentifier }],
    }).select("+password");

    if (!user) {
      throw new AppError("User not found, Please Register", 404);
    }

    if (!user.isActive) {
      throw new AppError("Your account has been deactivated", 403);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  registerAdmin,
  login,
};
