import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/Button";
import Input from "../components/Input";
import api from "../services/api";

const categoryOptions = [
  { value: "SERVICE", label: "Service" },
  { value: "PAYMENT", label: "Payment / Billing" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "ACCOUNT", label: "Account" },
  { value: "OTHER", label: "Other" },
];

const priorityOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

export default function SubmitComplaint() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "",
    priority: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a subject.");
      return;
    }

    if (!form.priority) {
      setError("Please select a priority.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please describe your complaint.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.createComplaint({
        title: form.title.trim(),
        category: form.category,
        priority: form.priority,
        description: form.description.trim(),
      });

      const createdComplaint = response?.complaint ?? response;

      if (createdComplaint?.complaintId) {
        navigate(
          `/complaints/${encodeURIComponent(
            createdComplaint.complaintId
          )}`
        );
      } else {
        navigate("/dashboard");
      }
    } catch (submitError) {
      console.error("COMPLAINT SUBMISSION ERROR:", submitError);

      setError(
        submitError.message ||
          "Unable to submit your complaint. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="form-page">
      <button
        type="button"
        className="back-link"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={17} />
        Back
      </button>

      <div className="form-page-header">
        <p className="eyebrow">New complaint</p>

        <h1>Submit a complaint</h1>

        <p>
          Tell us what happened. Provide enough detail to help the
          appropriate team understand and investigate the issue.
        </p>
      </div>

      <form
        className="complaint-form"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="form-alert" role="alert">
            {error}
          </div>
        )}

        <Input
          label="Subject"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Briefly describe the issue"
          required
        />

        <div className="form-grid">
          <Input
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            options={categoryOptions}
            placeholder="Select category"
            required
          />

          <Input
            label="Priority"
            name="priority"
            value={form.priority}
            onChange={handleChange}
            options={priorityOptions}
            placeholder="Select priority"
            required
          />
        </div>

        <Input
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the issue in detail..."
          textarea
          rows={8}
          required
          helperText="Include relevant details, dates, or actions that may help us investigate."
        />

        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={loading}
          >
            <Send size={17} />
            Submit complaint
          </Button>
        </div>
      </form>
    </section>
  );
}
