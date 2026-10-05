const allowedTransitions = {
  PENDING: ["ASSIGNED", "REJECTED"],
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CLOSED"],
  REJECTED: [],
  CLOSED: [],
};

const AppError = require("../utils/app-error.js");

const changeComplaintStatus = async (complaint, newStatus, changedBy, note) => {
  const currentStatus = complaint.status;

  const allowedNextStatuses = allowedTransitions[currentStatus] || [];

  if (!allowedNextStatuses.includes(newStatus)) {
    throw new AppError(
      `Cannot change complaint status from ${currentStatus} to ${newStatus}`,
      400,
    );
  }

  complaint.status = newStatus;

  complaint.statusHistory.push({
    status: newStatus,
    changedBy,
    note,
  });

  await complaint.save();

  return complaint;
};

module.exports = {
  allowedTransitions,
  changeComplaintStatus,
};
