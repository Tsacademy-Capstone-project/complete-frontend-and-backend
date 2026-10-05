import { useMemo, useState } from "react";
import { Plus, ArrowRight } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

const STATUSES = [
  "Pending",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
  "Rejected",
];

const priorityClasses = {
  HIGH: "priority-high",
  MEDIUM: "priority-medium",
  LOW: "priority-low",
  URGENT: "priority-high",
};

function formatStatus(status) {
  return status
    ?.replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function UserDashboard({
  complaints = [],
  loading = false,
  error = "",
  onNewComplaint,
  onViewComplaint,
}) {
  const [filter, setFilter] = useState("All");

  const myComplaints = complaints;

  const visibleComplaints = useMemo(() => {
    if (filter === "All") {
      return myComplaints;
    }

    return myComplaints.filter(
      (complaint) => formatStatus(complaint.status) === filter
    );
  }, [myComplaints, filter]);

  const counts = useMemo(() => {
    const result = {
      All: myComplaints.length,
    };

    STATUSES.forEach((status) => {
      result[status] = myComplaints.filter(
        (complaint) => formatStatus(complaint.status) === status
      ).length;
    });

    return result;
  }, [myComplaints]);

  const statistics = [
    {
      label: "Total",
      value: counts.All,
      filter: "All",
    },
    ...STATUSES.map((status) => ({
      label: status,
      value: counts[status],
      filter: status,
    })),
  ];

  return (
    <section className="dashboard-page">
      {/* Page Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div>
            <h1>My Complaints</h1>

            <p>
              Track and manage all your submitted complaints.
            </p>
          </div>

          <button
            type="button"
            className="new-complaint-button"
            onClick={onNewComplaint}
          >
            <Plus size={17} strokeWidth={2.5} />
            <span>New Complaint</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="form-alert" role="alert">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="dashboard-stats">
        {statistics.map((stat) => {
          const active = filter === stat.filter;

          return (
            <button
              key={stat.filter}
              type="button"
              className={`stat-card ${active ? "active" : ""}`}
              onClick={() => setFilter(stat.filter)}
            >
              <span className="stat-value">
                {loading ? "—" : stat.value}
              </span>

              <span className="stat-label">
                {stat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Complaints */}
      <div className="dashboard-table-section">
        <div className="complaints-table-card">
          <div className="table-wrapper">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="empty-table-cell">
                      Loading your complaints...
                    </td>
                  </tr>
                ) : visibleComplaints.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="empty-table-cell"
                    >
                      {filter === "All" ? (
                        <>
                          <div className="empty-state-icon">
                            <ClipboardIcon />
                          </div>

                          <h3>No complaints yet</h3>

                          <p>
                            You haven't submitted any complaints.
                            Once you submit one, it will appear here.
                          </p>

                          <button
                            type="button"
                            className="empty-state-button"
                            onClick={onNewComplaint}
                          >
                            <Plus size={16} />
                            Submit a complaint
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="empty-state-icon">
                            <ClipboardIcon />
                          </div>

                          <h3>No matching complaints</h3>

                          <p>
                            You don't have any complaints with the{" "}
                            <strong>{filter}</strong> status.
                          </p>
                        </>
                      )}
                    </td>
                  </tr>
                ) : (
                  visibleComplaints.map((complaint) => (
                    <tr
                      key={complaint._id || complaint.complaintId}
                      className="complaint-row"
                      onClick={() =>
                        onViewComplaint?.(complaint)
                      }
                    >
                      <td>
                        <span className="ticket-number">
                          {complaint.complaintId || complaint._id}
                        </span>
                      </td>

                      <td>
                        <span className="complaint-subject">
                          {complaint.title || complaint.subject}
                        </span>
                      </td>

                      <td>
                        <span className="table-text">
                          {complaint.category}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`priority-badge ${
                            priorityClasses[complaint.priority] || ""
                          }`}
                        >
                          {complaint.priority}
                        </span>
                      </td>

                      <td>
                        <StatusBadge
                          status={formatStatus(complaint.status)}
                        />
                      </td>

                      <td>
                        <span className="submitted-date">
                          {formatDate(complaint.createdAt)}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="view-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onViewComplaint?.(complaint);
                          }}
                        >
                          View
                          <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClipboardIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5" />
      <path d="M9 10h6" />
      <path d="M9 14h6" />
      <path d="M9 18h3" />
    </svg>
  );
}
