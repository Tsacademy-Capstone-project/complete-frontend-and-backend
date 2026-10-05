const statusClasses = {
  Pending: "status-pending",
  Assigned: "status-assigned",
  "In Progress": "status-progress",
  Resolved: "status-resolved",
  Closed: "status-closed",
  Rejected: "status-rejected",
};

export default function StatusBadge({ status }) {
  const displayStatus = status
    ?.replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <span className={`status-badge ${statusClasses[displayStatus] || ""}`}>
      <span className="status-dot" />
      {displayStatus || status}
    </span>
  );
}
