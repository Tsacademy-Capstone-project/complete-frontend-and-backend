const Complaint = require("../models/complaint.model.js");
const generateComplaintId = require("../utils/generateComplaintId.js");
const { changeComplaintStatus } = require("../services/complaintService.js");
const User = require("../models/user.model.js");
const AppError = require("../utils/app-error.js");

const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description || !category) {
      throw new AppError("Title, description and category are required", 400);
    }

    const complaintId = await generateComplaintId();

    const complaint = await Complaint.create({
      complaintId,
      title,
      description,
      category: category.toUpperCase(),
      priority: priority.toUpperCase(),
      submittedBy: req.user._id,
      status: "PENDING",
      statusHistory: [
        {
          status: "PENDING",
          changedBy: req.user._id,
          note: "Complaint submitted",
        },
      ],
    });

    return res.status(201).json({
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    return next(error);
  }
};

const getMyComplaints = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, category, priority } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);

    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    const skip = (pageNumber - 1) * limitNumber;

    const filter = {
      submittedBy: req.user._id,
    };

    if (status) {
      filter.status = status.toUpperCase();
    }

    if (category) {
      filter.category = category.toUpperCase();
    }

    if (priority) {
      filter.priority = priority.toUpperCase();
    }

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate("assignedTo", "firstName lastName email")
        .sort({ createdAt: -1 })
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

const getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.id,
      submittedBy: req.user._id,
    })
      .populate("submittedBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email")
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

const closeComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.id,
      submittedBy: req.user._id,
    });

    if (!complaint) {
      throw new AppError("Complaint not found", 404);
    }

    if (complaint.status !== "RESOLVED") {
      throw new AppError("Only resolved complaints can be closed", 400);
    }

    complaint.closedAt = new Date();

    await changeComplaintStatus(
      complaint,
      "CLOSED",
      req.user._id,
      "Complaint closed by the complainant",
    );

    return res.status(200).json({
      message: "Complaint closed successfully",
      complaint,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaint,
  closeComplaint,
};
