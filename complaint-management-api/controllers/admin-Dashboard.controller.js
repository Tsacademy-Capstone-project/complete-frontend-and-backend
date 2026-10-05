const Complaint = require("../models/complaint.model.js");
const User = require("../models/user.model.js");

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      total,
      pending,
      assigned,
      inProgress,
      resolved,
      rejected,
      closed,

      complaintsByCategory,
      complaintsByPriority,
      handlerWorkload,
      recentComplaints,
    ] = await Promise.all([
      Complaint.countDocuments(),

      Complaint.countDocuments({
        status: "PENDING",
      }),

      Complaint.countDocuments({
        status: "ASSIGNED",
      }),

      Complaint.countDocuments({
        status: "IN_PROGRESS",
      }),

      Complaint.countDocuments({
        status: "RESOLVED",
      }),

      Complaint.countDocuments({
        status: "REJECTED",
      }),

      Complaint.countDocuments({
        status: "CLOSED",
      }),

      Complaint.aggregate([
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
      ]),

      Complaint.aggregate([
        {
          $group: {
            _id: "$priority",
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
      ]),

      Complaint.aggregate([
        {
          $match: {
            assignedTo: {
              $ne: null,
            },
            status: {
              $in: ["ASSIGNED", "IN_PROGRESS"],
            },
          },
        },
        {
          $group: {
            _id: "$assignedTo",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "handler",
          },
        },
        {
          $unwind: "$handler",
        },
        {
          $project: {
            _id: 0,
            handlerId: "$handler._id",
            name: {
              $concat: ["$handler.firstName", " ", "$handler.lastName"],
            },
            email: "$handler.email",
            activeComplaints: "$count",
          },
        },
        {
          $sort: {
            activeComplaints: -1,
          },
        },
      ]),

      Complaint.find()
        .populate("submittedBy", "firstName lastName email")
        .populate("assignedTo", "firstName lastName email")
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean(),
    ]);

    const overdueComplaints = await Complaint.find({
      $or: [
        {
          status: {
            $in: ["PENDING", "ASSIGNED"],
          },
          createdAt: {
            $lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },

        {
          status: "IN_PROGRESS",
          updatedAt: {
            $lt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          },
        },
      ],
    })
      .populate("submittedBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email")
      .sort({
        createdAt: 1,
      })
      .limit(20)
      .lean();

    return res.status(200).json({
      statistics: {
        total,
        pending,
        assigned,
        inProgress,
        resolved,
        rejected,
        closed,
      },
      overdueComplaints,

      complaintsByCategory,

      complaintsByPriority,

      handlerWorkload,

      recentComplaints,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardStats,
};
