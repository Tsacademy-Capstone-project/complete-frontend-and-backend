const express = require("express");
const {
  createComplaint,
  getMyComplaints,
  getComplaint,
  closeComplaint,
} = require("../controllers/complaint.controller.js");

const protect = require("../middleware/auth.middleware.js");

const authorize = require("../middleware/role.middleware.js");

const router = express.Router();

router.post("/", protect, authorize("USER"), createComplaint);

router.get("/my", protect, authorize("USER"), getMyComplaints);

router.patch("/:id/close", protect, authorize("USER"), closeComplaint);

router.get("/:id", protect, authorize("USER"), getComplaint);

module.exports = router;
