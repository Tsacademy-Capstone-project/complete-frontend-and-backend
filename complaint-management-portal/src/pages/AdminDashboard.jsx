import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, RefreshCw, Search } from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import Modal from "../components/Modal";

const ACTIVE_STATUSES = ["PENDING", "ASSIGNED", "IN_PROGRESS"];
const STATUSES = ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED", "CLOSED"];
const PAGE_SIZE = 10;

function label(value) {
  return value?.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase()) || "—";
}

function nameOf(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "—";
}

function dateOf(value) {
  return value ? new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    api.getComplaints()
      .then((data) => {
        if (active) { setComplaints(data); setError(""); }
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to load complaints.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reloadKey]);

  function refresh() {
    setLoading(true);
    setError("");
    setReloadKey((previous) => previous + 1);
  }

  function openComplaint(complaint) {
    setSelectedComplaint(complaint);
    setResolution(complaint.resolution || "");
    setActionError("");
  }

  const closeComplaint = useCallback(() => {
    if (resolving) return;
    setSelectedComplaint(null);
    setResolution("");
    setActionError("");
  }, [resolving]);

  async function handleResolve(event) {
    event.preventDefault();
    if (!selectedComplaint || resolving) return;
    if (!resolution.trim()) {
      setActionError("Please describe how this complaint was resolved.");
      return;
    }
    try {
      setResolving(true);
      setActionError("");
      const updated = await api.resolveComplaint(selectedComplaint.complaintId, resolution);
      setComplaints((previous) => previous.map((complaint) =>
        complaint.complaintId === updated.complaintId ? updated : complaint
      ));
      setSelectedComplaint(updated);
      setNotice(`${updated.complaintId} has been resolved. The user can view your response.`);
    } catch (err) {
      setActionError(err.message || "Unable to resolve complaint.");
    } finally {
      setResolving(false);
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return complaints.filter((complaint) =>
      (status === "ALL" || complaint.status === status) &&
      (!query || [complaint.complaintId, complaint.title, complaint.category,
        nameOf(complaint.submittedBy), complaint.submittedBy?.email]
        .some((value) => value?.toLowerCase().includes(query)))
    );
  }, [complaints, search, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const statistics = [
    { label: "Total complaints", value: complaints.length },
    { label: "Pending review", value: complaints.filter((item) => item.status === "PENDING").length },
    { label: "Being handled", value: complaints.filter((item) => ["ASSIGNED", "IN_PROGRESS"].includes(item.status)).length },
    { label: "Resolved", value: complaints.filter((item) => item.status === "RESOLVED").length },
  ];

  return (
    <section className="admin-page admin-dashboard">
      <header className="page-header admin-page-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Admin Dashboard</h1>
          <p>Review complaints from every user and record their resolution.</p>
        </div>
        <Button variant="secondary" onClick={refresh} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </Button>
      </header>

      {error && <div className="form-alert" role="alert">{error}</div>}
      {notice && <div className="admin-success" role="status"><CheckCircle2 size={18} />{notice}</div>}

      <div className="admin-stats">
        {statistics.map((stat) => (
          <div className="admin-stat" key={stat.label}>
            <span>{stat.label}</span><strong>{loading ? "—" : stat.value}</strong>
          </div>
        ))}
      </div>

      <section className="admin-complaints-panel" aria-labelledby="all-complaints-title">
        <div className="admin-panel-heading">
          <div><h2 id="all-complaints-title">All complaints</h2><p>Submitted concerns across all user accounts.</p></div>
          <span className="admin-result-count">{filtered.length} complaints</span>
        </div>
        <div className="admin-toolbar">
          <div className="search-wrapper">
            <Search size={18} aria-hidden="true" />
            <input type="search" aria-label="Search complaints" placeholder="Search ticket, title or user…"
              value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
          </div>
          <select aria-label="Filter by status" value={status}
            onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <option value="ALL">All statuses</option>
            {STATUSES.map((item) => <option key={item} value={item}>{label(item)}</option>)}
          </select>
        </div>

        {loading ? <div className="admin-empty" role="status">Loading complaints…</div> :
          error && complaints.length === 0 ? (
            <div className="admin-empty"><h3>Unable to load complaints</h3><p>Try refreshing to retrieve the complaint list.</p></div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty"><h3>{complaints.length ? "No matching complaints" : "No complaints yet"}</h3>
              <p>{complaints.length ? "Try another search or status filter." : "Complaints submitted by users will appear here."}</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="complaints-table">
                <thead><tr><th>Ticket / Subject</th><th>Submitted by</th><th>Category</th><th>Priority</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead>
                <tbody>{visible.map((complaint) => (
                  <tr key={complaint._id || complaint.complaintId}>
                    <td><span className="ticket-number">{complaint.complaintId}</span><strong className="admin-ticket-title">{complaint.title}</strong></td>
                    <td><strong>{nameOf(complaint.submittedBy)}</strong><span className="admin-user-email">{complaint.submittedBy?.email}</span></td>
                    <td>{label(complaint.category)}</td>
                    <td><span className={`priority-badge priority-${complaint.priority?.toLowerCase()}`}>{label(complaint.priority)}</span></td>
                    <td><StatusBadge status={complaint.status} /></td>
                    <td>{dateOf(complaint.createdAt)}</td>
                    <td><Button size="small" variant="secondary" onClick={() => openComplaint(complaint)}>View</Button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        {!loading && filtered.length > 0 && (
          <div className="admin-pagination">
            <span>Page {currentPage} of {totalPages}</span>
            <div><Button size="small" variant="secondary" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</Button>
              <Button size="small" variant="secondary" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next</Button></div>
          </div>
        )}
      </section>

      {selectedComplaint && (
        <Modal titleId="admin-complaint-title" onClose={closeComplaint} dismissible={!resolving}>
          <div className="modal-header">
            <div><span className="modal-ticket">{selectedComplaint.complaintId}</span><h2 id="admin-complaint-title">{selectedComplaint.title}</h2></div>
            <button type="button" className="modal-close" onClick={closeComplaint} disabled={resolving} aria-label="Close complaint">×</button>
          </div>
          <div className="complaint-meta">
            <div><span>Submitted by</span><strong>{nameOf(selectedComplaint.submittedBy)}</strong></div>
            <div><span>Category</span><strong>{label(selectedComplaint.category)}</strong></div>
            <div><span>Priority</span><strong>{label(selectedComplaint.priority)}</strong></div>
            <div><span>Status</span><StatusBadge status={selectedComplaint.status} /></div>
          </div>
          <div className="complaint-description"><h3>Description</h3><p>{selectedComplaint.description}</p></div>
          <div className="complaint-date">Submitted {dateOf(selectedComplaint.createdAt)}</div>
          {actionError && <div className="form-alert" role="alert">{actionError}</div>}
          {ACTIVE_STATUSES.includes(selectedComplaint.status) ? (
            <form className="feedback-section" onSubmit={handleResolve}>
              <label htmlFor="admin-resolution">Resolution for the user</label>
              <textarea id="admin-resolution" value={resolution} onChange={(event) => setResolution(event.target.value)}
                placeholder="Explain what was done to resolve this complaint…" rows={5} required disabled={resolving} />
              <Button type="submit" loading={resolving} disabled={!resolution.trim()}><CheckCircle2 size={17} />Resolve complaint</Button>
            </form>
          ) : selectedComplaint.resolution ? (
            <div className="resolved-feedback"><h3>Resolution</h3><p>{selectedComplaint.resolution}</p><span>Resolved {dateOf(selectedComplaint.resolvedAt)}</span></div>
          ) : selectedComplaint.rejectionReason ? (
            <div className="resolved-feedback"><h3>Rejection reason</h3><p>{selectedComplaint.rejectionReason}</p></div>
          ) : null}
        </Modal>
      )}
    </section>
  );
}
