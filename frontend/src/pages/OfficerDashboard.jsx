import { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  MapPin,
  Building2,
  RefreshCw,
  Upload,
  Send,
  X,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import StatCard from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/Badge";
import Button from "../components/ui/Button";

export default function OfficerDashboard() {
  const { user } = useAuth();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startingId, setStartingId] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [remarks, setRemarks] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchIssues = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/officer/issues");
      setIssues(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch officer issues:", err);
      setError(
        err.response?.data?.detail || "Unable to load assigned issues."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleStartIssue = async (issueId) => {
    setStartingId(issueId);
    setError("");
    setSuccess("");

    try {
      await api.post(`/api/officer/issues/${issueId}/start`);
      setSuccess("Issue status updated to In Progress.");
      await fetchIssues();
    } catch (err) {
      console.error("Failed to start issue:", err);
      setError(err.response?.data?.detail || "Unable to start this issue.");
    } finally {
      setStartingId(null);
    }
  };

  const openResolveForm = (issue) => {
    setSelectedIssue(issue);
    setAfterImage(null);
    setRemarks("");
    setError("");
    setSuccess("");
  };

  const closeResolveForm = () => {
    setSelectedIssue(null);
    setAfterImage(null);
    setRemarks("");
  };

  const handleResolveIssue = async (e) => {
    e.preventDefault();

    if (!selectedIssue) return;

    if (!afterImage) {
      setError("Please upload an after-resolution photo.");
      return;
    }

    setResolvingId(selectedIssue.id);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("after_image", afterImage);
      formData.append("remarks", remarks);

      await api.post(
        `/api/officer/issues/${selectedIssue.id}/resolve`,
        formData
      );

      setSuccess(
        "Issue marked as resolved and submitted for citizen verification."
      );
      closeResolveForm();
      await fetchIssues();
    } catch (err) {
      console.error("Failed to resolve issue:", err);
      setError(err.response?.data?.detail || "Unable to resolve this issue.");
    } finally {
      setResolvingId(null);
    }
  };

  const inProgressCount = issues.filter(
    (issue) => issue.status === "IN_PROGRESS"
  ).length;

  const awaitingCount = issues.filter(
    (issue) => issue.status === "AWAITING_VERIFICATION"
  ).length;

  const closedCount = issues.filter(
    (issue) => issue.status === "CLOSED"
  ).length;

  return (
    <div className="dashboard-page">
      <Navbar roleTitle="Field Officer" />

      <main className="dashboard-content">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">OFFICER OPERATIONS</p>
            <h1>Hello, {user?.name?.split(" ")[0]} 👋</h1>
            <p>
              Manage assigned community repairs, log field work progress, and
              submit photo verification proofs.
            </p>
          </div>

          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchIssues}
            disabled={loading}
          >
            Refresh Queue
          </Button>
        </section>

        {error && (
          <div className="auth-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <section className="stats-grid">
          <StatCard
            icon={ClipboardList}
            label="Total Assigned"
            value={issues.length}
          />
          <StatCard
            icon={Clock}
            label="In Progress"
            value={inProgressCount}
          />
          <StatCard
            icon={AlertCircle}
            label="Awaiting Verification"
            value={awaitingCount}
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed & Closed"
            value={closedCount}
          />
        </section>

        <section className="issues-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">WORK QUEUE</p>
              <h2>Assigned Civic Tasks</h2>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <RefreshCw className="btn-spinner" size={32} />
              <h3>Loading assigned issues...</h3>
            </div>
          ) : issues.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={38} strokeWidth={1.8} />
              <h3>No issues assigned</h3>
              <p>New civic issues routed to your department will appear here.</p>
            </div>
          ) : (
            <div className="issues-list">
              {issues.map((issue) => (
                <div className="issue-card" key={issue.id}>
                  <div className="issue-main">
                    <span className="issue-category">
                      {issue.category?.replaceAll("_", " ")}
                    </span>

                    <h3>{issue.title}</h3>
                    <p>{issue.description}</p>

                    <div className="issue-meta">
                      {issue.location && (
                        <span>
                          <MapPin size={15} />
                          {issue.location}
                        </span>
                      )}

                      {issue.department_name && (
                        <span>
                          <Building2 size={15} />
                          {issue.department_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="issue-status">
                    <StatusBadge status={issue.status} />

                    {(issue.status === "REPORTED" ||
                      issue.status === "ASSIGNED" ||
                      issue.status === "REOPENED") && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Play}
                        onClick={() => handleStartIssue(issue.id)}
                        loading={startingId === issue.id}
                      >
                        {startingId === issue.id ? "Starting..." : "Start Work"}
                      </Button>
                    )}

                    {issue.status === "IN_PROGRESS" && (
                      <Button
                        variant="fin"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => openResolveForm(issue)}
                      >
                        Resolve Issue
                      </Button>
                    )}

                    {issue.status === "AWAITING_VERIFICATION" && (
                      <div className="issue-action-note">
                        Waiting for citizen verification
                      </div>
                    )}

                    {issue.status === "CLOSED" && (
                      <div className="issue-action-note">
                        Resolution verified & closed
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedIssue && (
        <div className="modal-overlay" onClick={closeResolveForm}>
          <div
            className="resolve-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="resolve-modal-header">
              <div>
                <p className="eyebrow">RESOLUTION PROOF</p>
                <h2>Submit Resolution</h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeResolveForm}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="resolve-issue-summary">
              <span className="issue-category">
                {selectedIssue.category?.replaceAll("_", " ")}
              </span>
              <h3>{selectedIssue.title}</h3>
              <p>{selectedIssue.description}</p>

              {selectedIssue.location && (
                <div className="issue-meta" style={{ marginTop: "6px" }}>
                  <span>
                    <MapPin size={14} />
                    {selectedIssue.location}
                  </span>
                </div>
              )}
            </div>

            <form className="resolve-form" onSubmit={handleResolveIssue}>
              <div className="form-group">
                <label>Completed Work Photo *</label>

                <div className="upload-box">
                  <Upload size={28} />
                  <strong>
                    {afterImage
                      ? afterImage.name
                      : "Upload photo of the completed repair"}
                  </strong>
                  <span>
                    This photo will be shown to the citizen for sign-off.
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => {
                      setAfterImage(e.target.files?.[0] || null);
                    }}
                  />

                  {afterImage && (
                    <div className="selected-file">
                      <CheckCircle2 size={15} />
                      <span>{afterImage.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Officer Field Remarks</label>
                <textarea
                  placeholder="Describe the actions taken (materials used, repairs done, safety measures, etc.)..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={4}
                />
              </div>

              {error && (
                <div className="auth-error">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="resolve-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeResolveForm}
                  disabled={resolvingId === selectedIssue.id}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="fin"
                  icon={Send}
                  loading={resolvingId === selectedIssue.id}
                >
                  {resolvingId === selectedIssue.id
                    ? "Submitting..."
                    : "Confirm Resolution"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}