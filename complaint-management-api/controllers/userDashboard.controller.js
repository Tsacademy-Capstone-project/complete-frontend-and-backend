const Complaint = require("../models/complaint.model.js");

const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      total,
      pending,
      assigned,
      inProgress,
      resolved,
      rejected,
      closed,
      complaintsByCategory,
      recentComplaints,
    ] = await Promise.all([
      Complaint.countDocuments({
        submittedBy: userId,
      }),

      Complaint.countDocuments({
        submittedBy: userId,
        status: "PENDING",
      }),

      Complaint.countDocuments({
        submittedBy: userId,
        status: "ASSIGNED",
      }),

      Complaint.countDocuments({
        submittedBy: userId,
        status: "IN_PROGRESS",
      }),

      Complaint.countDocuments({
        submittedBy: userId,
        status: "RESOLVED",
      }),

      Complaint.countDocuments({
        submittedBy: userId,
        status: "REJECTED",
      }),

      Complaint.countDocuments({
        submittedBy: userId,
        status: "CLOSED",
      }),

      Complaint.find({
        submittedBy: userId,
      })
        .populate("assignedTo", "firstName lastName email")
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean(),
    ]);
    Complaint.aggregate([
      {
        $match: {
          submittedBy: userId,
        },
      },
      {
        $group: {
          _id: "$category",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,

      statistics: {
        total,
        pending,
        assigned,
        inProgress,
        resolved,
        rejected,
        closed,
      },
      complaintsByCategory,
      recentComplaints,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUserDashboard,
};
