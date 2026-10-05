const express = require("express");

const {
  getAllComplaints,
  getAdminComplaint,
  assignComplaint,
  rejectComplaint,
  resolveAdminComplaint,
} = require("../controllers/adminComplaint.controller.js");

const protect = require("../middleware/auth.middleware.js");
const authorize = require("../middleware/role.middleware.js");

const router = express.Router();

router.get("/complaints", protect, authorize("ADMIN"), getAllComplaints);

router.get("/complaints/:id", protect, authorize("ADMIN"), getAdminComplaint);

router.patch(
  "/complaints/:id/assign",
  protect,
  authorize("ADMIN"),
  assignComplaint,
);

router.patch(
  "/complaints/:id/resolve",
  protect,
  authorize("ADMIN"),
  resolveAdminComplaint,
);

router.patch(
  "/complaints/:id/reject",
  protect,
  authorize("ADMIN"),
  rejectComplaint,
);

module.exports = router;
