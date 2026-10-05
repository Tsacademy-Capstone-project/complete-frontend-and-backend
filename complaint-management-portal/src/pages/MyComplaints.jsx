import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import ComplaintCard from "../components/ComplaintCard";
import StatusBadge from "../components/StatusBadge";

const statuses = [
  "All",
  "Pending",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
  "Rejected",
];

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(status) {
  return status
    ?.replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function MyComplaints({
  complaints = [],
  loading = false,
  error = "",
  onViewComplaint,
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const userComplaints = complaints;

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();

    return userComplaints.filter((complaint) => {
      const matchesStatus =
        status === "All" || formatStatus(complaint.status) === status;

      const matchesSearch =
        !query ||
        complaint.title?.toLowerCase().includes(query) ||
        (complaint.ticketNumber || complaint.complaintId)
          ?.toLowerCase()
          .includes(query) ||
        complaint.category?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [userComplaints, search, status]);

  return (
    <section className="complaints-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">History</p>
          <h1>My Complaints</h1>
          <p>
            View and track all complaints submitted from your account.
          </p>
        </div>
      </div>

      <div className="complaints-toolbar">
        <div className="search-wrapper">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search complaints..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="status-filter">
          <SlidersHorizontal size={17} />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="form-alert" role="alert">{error}</div>
      ) : loading ? (
        <div className="empty-state">Loading your complaints...</div>
      ) : filteredComplaints.length === 0 ? (
        <div className="empty-state">
          <h2>
            {loading
              ? "Loading complaints..."
              : userComplaints.length === 0
              ? "No complaints yet"
              : "No matching complaints"}
          </h2>

          <p>
            {error ||
              (userComplaints.length === 0
              ? "Your submitted complaints will appear here."
              : "Try changing your search or status filter.")}
          </p>
        </div>
      ) : (
        <>
          <div className="complaint-card-list">
            {filteredComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint._id}
                complaint={complaint}
                onView={onViewComplaint}
              />
            ))}
          </div>

          <div className="complaints-desktop-table">
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
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint._id}>
                      <td>
                        <span className="ticket-number">
                          {complaint.complaintId || complaint._id}
                        </span>
                      </td>

                      <td>
                        <span className="complaint-subject">
                          {complaint.title}
                        </span>
                      </td>

                      <td>{complaint.category || "—"}</td>

                      <td
                        className={`priority-${complaint.priority?.toLowerCase()}`}
                      >
                        {complaint.priority || "—"}
                      </td>

                      <td>
                        <StatusBadge status={complaint.status} />
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
                          onClick={() => onViewComplaint?.(complaint)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
