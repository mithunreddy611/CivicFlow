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
        err.response?.data?.detail ||
          "Unable to load assigned issues."
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

      setSuccess("Issue marked as in progress.");

      await fetchIssues();
    } catch (err) {
      console.error("Failed to start issue:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to start this issue."
      );
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

    if (!selectedIssue) {
      return;
    }

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
        "Issue resolved successfully and sent for citizen verification."
      );

      closeResolveForm();

      await fetchIssues();
    } catch (err) {
      console.error("Failed to resolve issue:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to resolve this issue."
      );
    } finally {
      setResolvingId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "CLOSED":
        return "status-closed";

      case "AWAITING_VERIFICATION":
        return "status-verification";

      case "IN_PROGRESS":
        return "status-progress";

      case "REOPENED":
        return "status-reopened";

      case "ASSIGNED":
        return "status-assigned";

      default:
        return "status-reported";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "CLOSED":
        return <CheckCircle2 size={16} />;

      case "AWAITING_VERIFICATION":
        return <AlertCircle size={16} />;

      case "IN_PROGRESS":
        return <Clock size={16} />;

      default:
        return <ClipboardList size={16} />;
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <div className="brand">
            <div className="brand-icon">C</div>
            <span>CivicFlow</span>
          </div>
        </div>

        <div className="user-section">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{user?.name}</strong>
            <span>Officer</span>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">OFFICER DASHBOARD</p>

            <h1>
              Hello, {user?.name?.split(" ")[0]} 👋
            </h1>

            <p>
              Manage assigned civic issues and track them through
              resolution.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={fetchIssues}
            disabled={loading}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
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
          <div className="stat-card">
            <div className="stat-icon">
              <ClipboardList size={22} />
            </div>

            <div>
              <span>Total Assigned</span>
              <strong>{issues.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={22} />
            </div>

            <div>
              <span>In Progress</span>

              <strong>
                {
                  issues.filter(
                    (issue) => issue.status === "IN_PROGRESS"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <AlertCircle size={22} />
            </div>

            <div>
              <span>Awaiting Verification</span>

              <strong>
                {
                  issues.filter(
                    (issue) =>
                      issue.status === "AWAITING_VERIFICATION"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Completed</span>

              <strong>
                {
                  issues.filter(
                    (issue) => issue.status === "CLOSED"
                  ).length
                }
              </strong>
            </div>
          </div>
        </section>

        <section className="issues-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">WORK QUEUE</p>
              <h2>Assigned Issues</h2>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <RefreshCw size={32} />

              <h3>Loading assigned issues...</h3>
            </div>
          ) : issues.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={40} />

              <h3>No issues assigned</h3>

              <p>
                New issues routed to your department will appear here.
              </p>
            </div>
          ) : (
            <div className="issues-list">
              {issues.map((issue) => (
                <div className="issue-card" key={issue.id}>
                  <div className="issue-main">
                    <div className="issue-category">
                      {issue.category?.replaceAll("_", " ")}
                    </div>

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
                    <span
                      className={`status-badge ${getStatusClass(
                        issue.status
                      )}`}
                    >
                      {getStatusIcon(issue.status)}

                      {issue.status?.replaceAll("_", " ")}
                    </span>

                    {(issue.status === "REPORTED" ||
                      issue.status === "ASSIGNED" ||
                      issue.status === "REOPENED") && (
                      <button
                        className="primary-button"
                        onClick={() =>
                          handleStartIssue(issue.id)
                        }
                        disabled={startingId === issue.id}
                      >
                        <Play size={17} />

                        {startingId === issue.id
                          ? "Starting..."
                          : "Start Work"}
                      </button>
                    )}

                    {issue.status === "IN_PROGRESS" && (
                      <button
                        className="primary-button"
                        onClick={() =>
                          openResolveForm(issue)
                        }
                      >
                        <CheckCircle2 size={17} />
                        Resolve Issue
                      </button>
                    )}

                    {issue.status ===
                      "AWAITING_VERIFICATION" && (
                      <div className="issue-action-note">
                        Waiting for citizen verification.
                      </div>
                    )}

                    {issue.status === "CLOSED" && (
                      <div className="issue-action-note">
                        Resolution verified and closed.
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
        <div className="modal-overlay">
          <div className="resolve-modal">
            <div className="resolve-modal-header">
              <div>
                <p className="eyebrow">RESOLUTION PROOF</p>

                <h2>Resolve Issue</h2>
              </div>

              <button
                className="modal-close"
                onClick={closeResolveForm}
              >
                <X size={22} />
              </button>
            </div>

            <div className="resolve-issue-summary">
              <span className="issue-category">
                {selectedIssue.category?.replaceAll("_", " ")}
              </span>

              <h3>{selectedIssue.title}</h3>

              <p>{selectedIssue.description}</p>

              {selectedIssue.location && (
                <div className="issue-meta">
                  <span>
                    <MapPin size={15} />
                    {selectedIssue.location}
                  </span>
                </div>
              )}
            </div>

            <form
              className="resolve-form"
              onSubmit={handleResolveIssue}
            >
              <div className="form-group">
                <label>After Resolution Photo *</label>

                <div className="upload-box">
                  <Upload size={28} />

                  <strong>
                    Upload a photo showing the completed work
                  </strong>

                  <span>
                    This will be shown to the citizen as proof of
                    resolution.
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => {
                      setAfterImage(
                        e.target.files?.[0] || null
                      );
                    }}
                  />

                  {afterImage && (
                    <div className="selected-file">
                      <CheckCircle2 size={16} />

                      {afterImage.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Resolution Remarks</label>

                <textarea
                  placeholder="Describe what was fixed..."
                  value={remarks}
                  onChange={(e) =>
                    setRemarks(e.target.value)
                  }
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
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeResolveForm}
                  disabled={resolvingId === selectedIssue.id}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={resolvingId === selectedIssue.id}
                >
                  <Send size={17} />

                  {resolvingId === selectedIssue.id
                    ? "Submitting..."
                    : "Submit Resolution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}