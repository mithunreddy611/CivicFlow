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
import Navbar from "../components/layout/Navbar";
import StatCard from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/Badge";
import Button from "../components/ui/Button";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [issues, setIssues] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingPriority, setUpdatingPriority] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardResponse, issuesResponse] = await Promise.all([
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
        err.response?.data?.detail || "Unable to load admin dashboard."
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
        err.response?.data?.detail || "Unable to update issue priority."
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

  const totalIssues = getNumber("total_issues", "total", "totalIssues");
  const reportedIssues = getNumber("reported", "reported_issues", "reportedIssues");
  const assignedIssues = getNumber("assigned", "assigned_issues", "assignedIssues");
  const inProgressIssues = getNumber("in_progress", "in_progress_issues", "inProgressIssues");
  const awaitingIssues = getNumber("awaiting_verification", "awaiting_verification_issues", "awaitingVerification");
  const closedIssues = getNumber("closed", "closed_issues", "closedIssues", "resolved");

  const formatValue = (value) => {
    if (value === undefined || value === null || value === "") {
      return "—";
    }
    return String(value).replaceAll("_", " ");
  };

  return (
    <div className="dashboard-page">
      <Navbar roleTitle="Administrator" />

      <main className="dashboard-content">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">ADMINISTRATION</p>
            <h1>CivicFlow Control Center</h1>
            <p>
              Monitor community complaints, department assignments, field
              officer capacity, and SLAs in real time.
            </p>
          </div>

          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchAdminData}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </section>

        {error && (
          <div className="auth-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <section className="stats-grid">
          <StatCard
            icon={ClipboardList}
            label="Total Reported"
            value={loading ? "..." : totalIssues}
          />
          <StatCard
            icon={AlertCircle}
            label="Pending Review"
            value={loading ? "..." : reportedIssues}
          />
          <StatCard
            icon={Clock}
            label="In Progress"
            value={loading ? "..." : inProgressIssues}
          />
          <StatCard
            icon={CheckCircle2}
            label="Closed & Resolved"
            value={loading ? "..." : closedIssues}
          />
        </section>

        <section className="stats-grid" style={{ marginBottom: "40px" }}>
          <StatCard
            icon={ClipboardList}
            label="Assigned to Field"
            value={loading ? "..." : assignedIssues}
          />
          <StatCard
            icon={AlertCircle}
            label="Awaiting Citizen Sign-off"
            value={loading ? "..." : awaitingIssues}
          />
        </section>

        <section className="issues-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SYSTEM MONITORING</p>
              <h2>All Civic Incidents</h2>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <RefreshCw className="btn-spinner" size={32} />
              <h3>Loading civic incident data...</h3>
            </div>
          ) : issues.length === 0 ? (
            <div className="empty-state">
              <ShieldCheck size={38} strokeWidth={1.8} />
              <h3>No incidents recorded</h3>
              <p>Reports filed by citizens across districts will appear here.</p>
            </div>
          ) : (
            <div className="issues-list">
              {issues.map((issue) => (
                <div className="issue-card" key={issue.id}>
                  <div className="issue-main">
                    <span className="issue-category">
                      {formatValue(issue.category)}
                    </span>

                    <h3>{issue.title || "Untitled Issue"}</h3>
                    <p>{issue.description || "No description provided."}</p>

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
                    <StatusBadge status={issue.status} />

                    <div className="priority-control">
                      <label htmlFor={`priority-${issue.id}`}>Priority:</label>

                      <select
                        id={`priority-${issue.id}`}
                        value={issue.priority || "MEDIUM"}
                        disabled={updatingPriority === issue.id}
                        onChange={(e) =>
                          updatePriority(issue.id, e.target.value)
                        }
                      >
                        {PRIORITIES.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>

                      {updatingPriority === issue.id && (
                        <span className="priority-saving">Saving...</span>
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