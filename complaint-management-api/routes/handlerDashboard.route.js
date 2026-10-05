const express = require("express");

const {
  getHandlerDashboard,
} = require("../controllers/handlerDashboard.controller.js");

const protect = require("../middleware/auth.middleware.js");

const authorize = require("../middleware/role.middleware.js");

const router = express.Router();

router.get("/", protect, authorize("HANDLER"), getHandlerDashboard);

module.exports = router;
