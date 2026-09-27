import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await api.get("/api/issues/my");
        setIssues(response.data);
      } catch (error) {
        console.error("Failed to fetch issues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

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
    if (status === "CLOSED") {
      return <CheckCircle2 size={16} />;
    }

    if (status === "AWAITING_VERIFICATION") {
      return <AlertCircle size={16} />;
    }

    if (status === "IN_PROGRESS") {
      return <Clock size={16} />;
    }

    return <ClipboardList size={16} />;
  };

  const closedCount = issues.filter(
    (issue) => issue.status === "CLOSED"
  ).length;

  const activeCount = issues.filter(
    (issue) => issue.status !== "CLOSED"
  ).length;

  const verificationCount = issues.filter(
    (issue) => issue.status === "AWAITING_VERIFICATION"
  ).length;

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
            <span>Citizen</span>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">CITIZEN DASHBOARD</p>

            <h1>
              Hello, {user?.name?.split(" ")[0]} 👋
            </h1>

            <p>
              Report local issues and track them until they're resolved.
            </p>
          </div>

          <Link to="/report" className="primary-button">
            <Plus size={20} />
            Report an Issue
          </Link>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <ClipboardList size={22} />
            </div>

            <div>
              <span>Total Issues</span>
              <strong>{issues.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={22} />
            </div>

            <div>
              <span>Active</span>
              <strong>{activeCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <AlertCircle size={22} />
            </div>

            <div>
              <span>Awaiting Verification</span>
              <strong>{verificationCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Resolved</span>
              <strong>{closedCount}</strong>
            </div>
          </div>
        </section>

        <section className="issues-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR REPORTS</p>
              <h2>My Issues</h2>
            </div>

            <Link to="/issues" className="view-all">
              View all
              <ArrowRight size={17} />
            </Link>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading your issues...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={40} />

              <h3>No issues reported yet</h3>

              <p>
                Found a pothole, broken streetlight, garbage problem,
                or water leakage?
              </p>

              <Link to="/report" className="secondary-button">
                Report your first issue
              </Link>
            </div>
          ) : (
            <div className="issues-list">
              {issues.slice(0, 5).map((issue) => (
                <div className="issue-card" key={issue.id}>
                  <div className="issue-main">
                    <div className="issue-category">
                      {issue.category.replaceAll("_", " ")}
                    </div>

                    <h3>{issue.title}</h3>

                    <p>{issue.description}</p>

                    <span className="issue-department">
                      {issue.department_name || "Department assigned"}
                    </span>
                  </div>

                  <div className="issue-status">
                    <span
                      className={`status-badge ${getStatusClass(
                        issue.status
                      )}`}
                    >
                      {getStatusIcon(issue.status)}
                      {issue.status.replaceAll("_", " ")}
                    </span>

                    {issue.status === "AWAITING_VERIFICATION" && (
                      <Link
                        to={`/issues/${issue.id}/verify`}
                        className="verify-link"
                      >
                        Verify Resolution
                      </Link>
                    )}
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