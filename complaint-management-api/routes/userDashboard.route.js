const express = require("express");

const {
  getUserDashboard,
} = require("../controllers/userDashboard.controller.js");

const protect = require("../middleware/auth.middleware.js");

const authorize = require("../middleware/role.middleware.js");

const router = express.Router();

router.get("/", protect, authorize("USER"), getUserDashboard);

module.exports = router;