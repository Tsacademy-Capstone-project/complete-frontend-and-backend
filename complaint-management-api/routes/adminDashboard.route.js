const express = require("express");

const {
  getDashboardStats,
} = require("../controllers/admin-Dashboard.controller.js");

const protect = require("../middleware/auth.middleware.js");
const authorize = require("../middleware/role.middleware.js");

const router = express.Router();

router.get("/", protect, authorize("ADMIN"), getDashboardStats);

module.exports = router;
