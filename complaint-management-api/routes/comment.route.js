const express = require("express");

const {
  createComment,
  getComplaintComments,
} = require("../controllers/comment.controller.js");

const protect = require("../middleware/auth.middleware.js");

const router = express.Router();

router.get("/complaints/:id/comments", protect, getComplaintComments);

router.post("/complaints/:id/comments", protect, createComment);

module.exports = router;
