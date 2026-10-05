const generateComplaintId = async () => {
  const Complaint = require("../models/complaint.model.js");

  const year = new Date().getFullYear();

  const lastComplaint = await Complaint.findOne({
    complaintId: new RegExp(`^CMP-${year}-`),
  }).sort({
    createdAt: -1,
  });

  let nextNumber = 1;

  if (lastComplaint) {
    const lastNumber = parseInt(lastComplaint.complaintId.split("-")[2], 10);

    nextNumber = lastNumber + 1;
  }

  return `CMP-${year}-${String(nextNumber).padStart(5, "0")}`;
};

module.exports = generateComplaintId;
