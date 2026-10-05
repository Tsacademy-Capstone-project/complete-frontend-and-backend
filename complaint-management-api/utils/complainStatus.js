const allowedTransitions = {
  PENDING: ["ASSIGNED", "REJECTED"],

  ASSIGNED: ["IN_PROGRESS"],

  IN_PROGRESS: ["RESOLVED"],

  RESOLVED: ["CLOSED"],

  REJECTED: [],

  CLOSED: [],
};

const canTransition = (currentStatus, newStatus) => {
  return allowedTransitions[currentStatus]?.includes(newStatus);
};

module.exports = {
  allowedTransitions,
  canTransition,
};
