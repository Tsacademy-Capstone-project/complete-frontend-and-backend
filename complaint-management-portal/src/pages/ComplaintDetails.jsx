import {
  ArrowLeft,
  CalendarDays,
  MessageSquare,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadedId, setLoadedId] = useState(null);
  const [closing, setClosing] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadComplaint() {
      try {
        const response = await api.getComplaint(id);
        if (active) { setComplaint(response.complaint); setError(""); }
      } catch (requestError) {
        console.error("GET COMPLAINT ERROR:", requestError);

        if (active) setError(
          requestError.message ||
            "Unable to load this complaint. Please try again."
        );
      } finally {
        if (active) { setLoading(false); setLoadedId(id); }
      }
    }

    if (id) {
      loadComplaint();
    }
    return () => { active = false; };
  }, [id]);

  async function handleClose() {
    try {
      setClosing(true);
      setActionError("");
      const response = await api.closeComplaint(id);
      setComplaint((previous) => ({
        ...response.complaint,
        submittedBy: previous.submittedBy,
        assignedTo: previous.assignedTo,
      }));
    } catch (err) {
      setActionError(err.message || "Unable to close complaint.");
    } finally {
      setClosing(false);
    }
  }

  if (id && (loading || loadedId !== id)) {
    return (
      <section className="details-page">
        <button
          type="button"
          className="back-link"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="not-found-card">
          <h1>Loading complaint...</h1>
          <p>Please wait while we retrieve the complaint.</p>
        </div>
      </section>
    );
  }

  if (!id || error || !complaint) {
    return (
      <section className="details-page">
        <button
          type="button"
          className="back-link"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="not-found-card">
          <h1>Complaint not found</h1>

          <p>
            {(!id ? "Complaint ID is missing." : error) ||
              "The complaint may have been removed or is not available to your account."}
          </p>

          <Button onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="details-page">
      <button
        type="button"
        className="back-link"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={17} />
        Back
      </button>

      <div className="details-header">
        <div>
          <span className="ticket-number">
            {complaint.complaintId}
          </span>

          <h1>{complaint.title}</h1>

          <p>
            Submitted {formatDate(complaint.createdAt)}
          </p>
        </div>

        <StatusBadge status={complaint.status} />
      </div>

      <div className="details-layout">
        <main className="details-main">
          <section className="details-card">
            <div className="details-card-header">
              <MessageSquare size={19} />
              <h2>Complaint description</h2>
            </div>

            <p className="details-description">
              {complaint.description}
            </p>
          </section>

          {complaint.resolution && (
            <section className="details-card">
              <div className="details-card-header">
                <MessageSquare size={19} />
                <h2>Resolution</h2>
              </div>

              <p className="details-description">
                {complaint.resolution}
              </p>
            </section>
          )}
          {complaint.rejectionReason && (
            <section className="details-card">
              <h2>Rejection reason</h2><p className="details-description">{complaint.rejectionReason}</p>
            </section>
          )}
          {actionError && <div className="form-alert" role="alert">{actionError}</div>}
          {complaint.status === "RESOLVED" && (
            <section className="details-card">
              <h2>Confirm resolution</h2>
              <p>If your concern has been addressed, you can close this complaint.</p>
              <Button onClick={handleClose} loading={closing}>Close complaint</Button>
            </section>
          )}
        </main>

        <aside className="details-sidebar">
          <section className="details-card">
            <h2>Complaint information</h2>

            <div className="details-info-list">
              <div>
                <span>Category</span>
                <strong>{complaint.category || "—"}</strong>
              </div>

              <div>
                <span>Priority</span>
                <strong>{complaint.priority || "—"}</strong>
              </div>

              <div>
                <span>Status</span>
                <StatusBadge status={complaint.status} />
              </div>

              <div>
                <span>
                  <User size={15} />
                  Submitted By
                </span>

                <strong>
                  {complaint.submittedBy?.firstName &&
                  complaint.submittedBy?.lastName
                    ? `${complaint.submittedBy.firstName} ${complaint.submittedBy.lastName}`
                    : complaint.submittedBy?.email || "—"}
                </strong>
              </div>

              <div>
                <span>
                  <CalendarDays size={15} />
                  Submitted
                </span>

                <strong>
                  {formatDate(complaint.createdAt)}
                </strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
