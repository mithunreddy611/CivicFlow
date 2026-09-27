import { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building2,
  User,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [issues, setIssues] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingPriority, setUpdatingPriority] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardResponse, issuesResponse] =
        await Promise.all([
          api.get("/api/admin/dashboard"),
          api.get("/api/admin/issues"),
        ]);

      setDashboard(dashboardResponse.data);

      const issueData = issuesResponse.data;

      if (Array.isArray(issueData)) {
        setIssues(issueData);
      } else if (Array.isArray(issueData?.issues)) {
        setIssues(issueData.issues);
      } else {
        setIssues([]);
      }
    } catch (err) {
      console.error("Admin dashboard error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const updatePriority = async (issueId, newPriority) => {
    setUpdatingPriority(issueId);
    setError("");

    try {
      await api.patch(
        `/api/admin/issues/${issueId}/priority`,
        null,
        {
          params: {
            priority: newPriority,
          },
        }
      );

      setIssues((currentIssues) =>
        currentIssues.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                priority: newPriority,
              }
            : issue
        )
      );
    } catch (err) {
      console.error("Failed to update priority:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to update issue priority."
      );
    } finally {
      setUpdatingPriority(null);
    }
  };

  const getNumber = (...keys) => {
    for (const key of keys) {
      if (
        dashboard &&
        dashboard[key] !== undefined &&
        dashboard[key] !== null
      ) {
        return dashboard[key];
      }
    }

    return 0;
  };

  const totalIssues = getNumber(
    "total_issues",
    "total",
    "totalIssues"
  );

  const reportedIssues = getNumber(
    "reported",
    "reported_issues",
    "reportedIssues"
  );

  const assignedIssues = getNumber(
    "assigned",
    "assigned_issues",
    "assignedIssues"
  );

  const inProgressIssues = getNumber(
    "in_progress",
    "in_progress_issues",
    "inProgressIssues"
  );

  const awaitingIssues = getNumber(
    "awaiting_verification",
    "awaiting_verification_issues",
    "awaitingVerification"
  );

  const closedIssues = getNumber(
    "closed",
    "closed_issues",
    "closedIssues",
    "resolved"
  );

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

  const formatValue = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "—";
    }

    return String(value).replaceAll("_", " ");
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
    <span>Administrator</span>
  </div>

  <button
    type="button"
    className="logout-button"
    onClick={logout}
  >
    Logout
  </button>
</div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">ADMINISTRATION</p>

            <h1>CivicFlow Control Center</h1>

            <p>
              Monitor civic issues, departments, officers and
              resolution progress.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={fetchAdminData}
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

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <ClipboardList size={22} />
            </div>

            <div>
              <span>Total Issues</span>
              <strong>
                {loading ? "..." : totalIssues}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <AlertCircle size={22} />
            </div>

            <div>
              <span>Reported</span>
              <strong>
                {loading ? "..." : reportedIssues}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={22} />
            </div>

            <div>
              <span>In Progress</span>
              <strong>
                {loading ? "..." : inProgressIssues}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Closed</span>
              <strong>
                {loading ? "..." : closedIssues}
              </strong>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <ClipboardList size={22} />
            </div>

            <div>
              <span>Assigned</span>
              <strong>
                {loading ? "..." : assignedIssues}
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
                {loading ? "..." : awaitingIssues}
              </strong>
            </div>
          </div>
        </section>

        <section className="issues-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SYSTEM MONITORING</p>

              <h2>All Civic Issues</h2>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <RefreshCw size={32} />

              <h3>Loading admin data...</h3>
            </div>
          ) : issues.length === 0 ? (
            <div className="empty-state">
              <ShieldCheck size={40} />

              <h3>No issues found</h3>

              <p>
                Issues reported by citizens will appear here.
              </p>
            </div>
          ) : (
            <div className="issues-list">
              {issues.map((issue) => (
                <div
                  className="issue-card"
                  key={issue.id}
                >
                  <div className="issue-main">
                    <div className="issue-category">
                      {formatValue(issue.category)}
                    </div>

                    <h3>
                      {issue.title || "Untitled issue"}
                    </h3>

                    <p>
                      {issue.description ||
                        "No description available."}
                    </p>

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

                      {issue.officer_name && (
                        <span>
                          <User size={15} />
                          {issue.officer_name}
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

                      {formatValue(issue.status)}
                    </span>

                    <div className="priority-control">
                      <label htmlFor={`priority-${issue.id}`}>
                        Priority
                      </label>

                      <select
                        id={`priority-${issue.id}`}
                        value={issue.priority || "MEDIUM"}
                        disabled={
                          updatingPriority === issue.id
                        }
                        onChange={(e) =>
                          updatePriority(
                            issue.id,
                            e.target.value
                          )
                        }
                      >
                        {PRIORITIES.map((priority) => (
                          <option
                            key={priority}
                            value={priority}
                          >
                            {priority}
                          </option>
                        ))}
                      </select>

                      {updatingPriority === issue.id && (
                        <span className="priority-saving">
                          Saving...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}