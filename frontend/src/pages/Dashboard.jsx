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
import Navbar from "../components/layout/Navbar";
import StatCard from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/Badge";

export default function Dashboard() {
  const { user } = useAuth();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await api.get("/api/issues/my");
        setIssues(response.data || []);
      } catch (error) {
        console.error("Failed to fetch issues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

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
      <Navbar roleTitle="Citizen" />

      <main className="dashboard-content">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">CITIZEN DASHBOARD</p>
            <h1>Hello, {user?.name?.split(" ")[0] || "Neighbor"} 👋</h1>
            <p>
              Report local civic issues, monitor community resolutions, and
              verify fixes directly with field teams.
            </p>
          </div>

          <Link to="/report" className="primary-button btn-fin">
            <Plus size={19} strokeWidth={2.4} />
            <span>Report an Issue</span>
          </Link>
        </section>

        <section className="stats-grid">
          <StatCard
            icon={ClipboardList}
            label="Total Reported"
            value={issues.length}
          />
          <StatCard
            icon={Clock}
            label="Active Issues"
            value={activeCount}
          />
          <StatCard
            icon={AlertCircle}
            label="Awaiting Verification"
            value={verificationCount}
          />
          <StatCard
            icon={CheckCircle2}
            label="Resolved & Closed"
            value={closedCount}
          />
        </section>

        <section className="issues-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR REPORTS</p>
              <h2>My Civic Issues</h2>
            </div>

            <Link to="/report" className="view-all">
              <span>File new report</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading your reported issues...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={38} strokeWidth={1.8} />
              <h3>No issues reported yet</h3>
              <p>
                Found a pothole, broken streetlight, garbage overflow, or water
                leakage in your neighborhood?
              </p>
              <Link to="/report" className="primary-button btn-fin">
                <Plus size={18} />
                <span>Report your first issue</span>
              </Link>
            </div>
          ) : (
            <div className="issues-list">
              {issues.slice(0, 10).map((issue) => (
                <div className="issue-card" key={issue.id}>
                  <div className="issue-main">
                    <span className="issue-category">
                      {issue.category?.replaceAll("_", " ")}
                    </span>

                    <h3>{issue.title}</h3>
                    <p>{issue.description}</p>

                    <div className="issue-meta">
                      <span className="issue-department">
                        {issue.department_name || "Department assigned"}
                      </span>
                    </div>
                  </div>

                  <div className="issue-status">
                    <StatusBadge status={issue.status} />

                    {issue.status === "AWAITING_VERIFICATION" && (
                      <Link
                        to={`/issues/${issue.id}/verify`}
                        className="verify-link"
                      >
                        Verify Resolution →
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