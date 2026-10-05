const Complaint = require("../models/complaint.model.js");
const { changeComplaintStatus } = require("../services/complaintService.js");
const { canTransition } = require("../utils/complainStatus.js");
const AppError = require("../utils/app-error.js");

const getHandlerComplaints = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, priority, category } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);

    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    const skip = (pageNumber - 1) * limitNumber;

    const filter = {
      assignedTo: req.user._id,
    };

    if (status) {
      filter.status = status.toUpperCase();
    }

    if (priority) {
      filter.priority = priority.toUpperCase();
    }

    if (category) {
      filter.category = category.toUpperCase();
    }

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate("submittedBy", "firstName lastName email")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber),

      Complaint.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    return res.status(200).json({
      complaints,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getHandlerComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.id,
      assignedTo: req.user._id,
    })
      .populate("submittedBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email role")
      .populate("statusHistory.changedBy", "firstName lastName role");

    if (!complaint) {
      throw new AppError("Complaint not found", 404);
    }

    return res.status(200).json({
      complaint,
    });
  } catch (error) {
    return next(error);
  }
};

const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      throw new AppError("Status is required", 400);
    }

    const newStatus = status.toUpperCase();

    if (newStatus !== "IN_PROGRESS") {
      throw new AppError("Handler can only change status to IN_PROGRESS", 400);
    }

    const complaint = await Complaint.findOne({
      complaintId: req.params.id,
      assignedTo: req.user._id,
    });

    if (!complaint) {
      throw new AppError("Complaint not found", 404);
    }

    if (!canTransition(complaint.status, "IN_PROGRESS")) {
      throw new AppError(
        `Cannot change complaint status from ${complaint.status} to IN_PROGRESS`,
        400,
      );
    }

    complaint.startedAt = new Date();

    await changeComplaintStatus(
      complaint,
      "IN_PROGRESS",
      req.user._id,
      "Handler started working on the complaint",
    );

    return res.status(200).json({
      message: "Complaint status updated successfully",
      complaint,
    });
  } catch (error) {
    return next(error);
  }
};

const resolveComplaint = async (req, res, next) => {
  try {
    const { resolution } = req.body;

    if (!resolution || !resolution.trim()) {
      throw new AppError("Resolution is required", 400);
    }

    const complaint = await Complaint.findOne({
      complaintId: req.params.id,
      assignedTo: req.user._id,
    });

    if (!complaint) {
      throw new AppError("Complaint not found", 404);
    }

    if (complaint.status !== "IN_PROGRESS") {
      throw new AppError("Only complaints in progress can be resolved", 400);
    }

    if (!canTransition(complaint.status, "RESOLVED")) {
      throw new AppError(
        `Cannot change complaint status from ${complaint.status} to RESOLVED`,
        400,
      );
    }

    complaint.resolution = resolution.trim();
    complaint.resolvedAt = new Date();

    await changeComplaintStatus(
      complaint,
      "RESOLVED",
      req.user._id,
      resolution.trim(),
    );

    return res.status(200).json({
      message: "Complaint resolved successfully",
      complaint,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getHandlerComplaints,
  getHandlerComplaint,
  updateComplaintStatus,
  resolveComplaint,
};
