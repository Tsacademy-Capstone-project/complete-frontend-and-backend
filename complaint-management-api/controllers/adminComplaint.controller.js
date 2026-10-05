const Complaint = require("../models/complaint.model.js");
const User = require("../models/user.model.js");
const { changeComplaintStatus } = require("../services/complaintService.js");
const AppError = require("../utils/app-error.js");

const getAllComplaints = async (req, res, next) => {
  try {
    let {
      page = 1,
      limit = 10,
      search,
      status,
      priority,
      category,
      assignedTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    page = Number(page);
    limit = Number(limit);
    if (Number.isNaN(page) || page < 1) {
      page = 1;
    }

    if (Number.isNaN(limit) || limit < 1) {
      limit = 10;
    }

    if (page < 1) {
      page = 1;
    }

    if (limit < 1) {
      limit = 10;
    }

    if (limit > 100) {
      limit = 100;
    }

    const skip = (page - 1) * limit;

    const filter = {};

    if (status) {
      filter.status = status.toUpperCase();
    }

    if (priority) {
      filter.priority = priority.toUpperCase();
    }

    if (category) {
      filter.category = category.toUpperCase();
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (search) {
      filter.$or = [
        {
          complaintId: {
            $regex: search,
            $options: "i",
          },
        },
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    let sort;
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    if (sortBy === "priority") {
      sort = {
        priority: sortDirection,
      };
    } else {
      sort = {
        [sortBy]: sortDirection,
      };
    }

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate("submittedBy", "firstName lastName email")
        .populate("assignedTo", "firstName lastName email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Complaint.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,

      data: complaints,

      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.id,
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

const assignComplaint = async (req, res, next) => {
  try {
    const { handlerId } = req.body;

    if (!handlerId) {
      throw new AppError("handlerId is required", 400);
    }

    const handler = await User.findById(handlerId);

    if (!handler) {
      throw new AppError("Handler not found", 404);
    }

    if (handler.role !== "HANDLER") {
      throw new AppError("Complaint can only be assigned to a HANDLER", 400);
    }

    const complaint = await Complaint.findOne({
      complaintId: req.params.id,
    });

    if (!complaint) {
      throw new AppError("Complaint not found", 404);
    }

    if (complaint.status !== "PENDING") {
      throw new AppError("Only pending complaints can be assigned", 400);
    }

    const oldStatus = complaint.status;

    complaint.assignedTo = handler._id;
    complaint.assignedAt = new Date();

    await changeComplaintStatus(
      complaint,
      "ASSIGNED",
      req.user._id,
      `Complaint assigned to ${handler.firstName} ${handler.lastName}`,
    );

    await complaint.save();

    await complaint.populate("assignedTo", "firstName lastName email role");

    return res.status(200).json({
      message: "Complaint assigned successfully",
      complaint,
    });
  } catch (error) {
    return next(error);
  }
};

const rejectComplaint = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      throw new AppError("Rejection reason is required", 400);
    }

    const complaint = await Complaint.findOne({
      complaintId: req.params.id,
    });

    if (!complaint) {
      throw new AppError("Complaint not found", 404);
    }

    if (complaint.status !== "PENDING") {
      throw new AppError("Only pending complaints can be rejected", 400);
    }

    const oldStatus = complaint.status;

    complaint.rejectionReason = reason.trim();

    await changeComplaintStatus(
      complaint,
      "REJECTED",
      req.user._id,
      reason.trim(),
    );

    return res.status(200).json({
      message: "Complaint rejected successfully",
      complaint,
    });
  } catch (error) {
    return next(error);
  }
};

const resolveAdminComplaint = async (req, res, next) => {
  try {
    const { resolution } = req.body || {};
    if (typeof resolution !== "string" || !resolution.trim()) {
      throw new AppError("Resolution is required", 400);
    }

    // Admins may resolve any active complaint. The status filter prevents
    // overwriting a resolution or changing a closed/rejected complaint.
    const resolvedAt = new Date();
    const complaint = await Complaint.findOneAndUpdate(
      {
        complaintId: req.params.id,
        status: { $in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] },
      },
      {
        $set: { status: "RESOLVED", resolution: resolution.trim(), resolvedAt },
        $push: {
          statusHistory: {
            status: "RESOLVED",
            changedBy: req.user._id,
            note: resolution.trim(),
            createdAt: resolvedAt,
            updatedAt: resolvedAt,
          },
        },
      },
      { new: true, runValidators: true },
    )
      .populate("submittedBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email");

    if (!complaint) {
      const exists = await Complaint.exists({ complaintId: req.params.id });
      throw new AppError(
        exists ? "Only pending, assigned or in-progress complaints can be resolved" : "Complaint not found",
        exists ? 400 : 404,
      );
    }

    return res.status(200).json({ message: "Complaint resolved successfully", complaint });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllComplaints,
  getAdminComplaint,
  assignComplaint,
  rejectComplaint,
  resolveAdminComplaint,
};
