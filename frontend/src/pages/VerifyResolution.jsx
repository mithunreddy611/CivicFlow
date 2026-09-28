import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ImageOff,
  MapPin,
  XCircle,
  Building2,
  User,
} from "lucide-react";
import api from "../services/api";
import Navbar from "../components/layout/Navbar";
import { StatusBadge } from "../components/ui/Badge";
import Button from "../components/ui/Button";

const BACKEND_URL = "http://127.0.0.1:8000";

function getImageUrl(...values) {
  const value = values.find(
    (item) => typeof item === "string" && item.trim() !== ""
  );

  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${BACKEND_URL}${value}`;
  }

  return `${BACKEND_URL}/${value}`;
}

function VerifyResolution() {
  const { issueId } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [remarks, setRemarks] = useState("");

  const [imageErrors, setImageErrors] = useState({
    before: false,
    after: false,
  });

  useEffect(() => {
    const loadIssue = async () => {
      try {
        setLoading(true);
        setError("");

        let foundIssue = null;

        try {
          const officerResponse = await api.get(
            `/api/officer/issues/${issueId}`
          );
          foundIssue = officerResponse.data;
        } catch {
          const response = await api.get("/api/issues/my");
          const issues = Array.isArray(response.data)
            ? response.data
            : response.data?.issues || [];

          foundIssue = issues.find(
            (item) => String(item.id) === String(issueId)
          );
        }

        if (!foundIssue) {
          setError("Issue not found or inaccessible.");
          return;
        }

        setIssue(foundIssue);
      } catch (err) {
        console.error("Failed to load verification issue:", err);
        setError(
          err.response?.data?.detail ||
            "Unable to load this issue. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadIssue();
  }, [issueId]);

  const handleImageError = (type) => {
    setImageErrors((previous) => ({
      ...previous,
      [type]: true,
    }));
  };

  const handleVerification = async (approved) => {
    try {
      setSubmitting(true);
      setError("");

      await api.post(`/api/citizen/issues/${issueId}/verify`, {
        approved,
        remarks: remarks.trim() || null,
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Verification failed:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to submit verification. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar roleTitle="Citizen" />
        <main className="dashboard-content" style={{ maxWidth: "860px" }}>
          <div className="verification-card empty-state">
            <p>Loading issue verification details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !issue) {
    return (
      <div className="dashboard-page">
        <Navbar roleTitle="Citizen" />
        <main className="dashboard-content" style={{ maxWidth: "860px" }}>
          <div className="verification-card">
            <div className="auth-error">{error}</div>
            <Button
              variant="secondary"
              icon={ArrowLeft}
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const beforeImage = getImageUrl(
    issue?.before_image,
    issue?.before_image_url,
    issue?.before_photo_url,
    issue?.before_photo,
    issue?.image_url,
    issue?.image,
    issue?.before_image_path
  );

  const afterImage = getImageUrl(
    issue?.after_image,
    issue?.after_image_url,
    issue?.resolution_image,
    issue?.resolution_image_url
  );

  return (
    <div className="dashboard-page">
      <Navbar roleTitle="Citizen" />

      <main className="dashboard-content" style={{ maxWidth: "900px" }}>
        <button
          type="button"
          className="secondary-button btn-sm"
          onClick={() => navigate("/dashboard")}
          style={{
            marginBottom: "24px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <div className="verification-card">
          <div className="verification-heading">
            <div>
              <span className="eyebrow">ISSUE #{issue.id}</span>
              <h2>{issue.title}</h2>
              <p>{issue.description}</p>
            </div>

            <StatusBadge status={issue.status} />
          </div>

          <div className="issue-meta">
            <div>
              <MapPin size={16} />
              <span>{issue.location_text || issue.location || "Location not provided"}</span>
            </div>

            <div>
              <strong>Category:</strong>
              <span>{issue.category?.replaceAll("_", " ")}</span>
            </div>

            {issue.department_name && (
              <div>
                <Building2 size={16} />
                <span>{issue.department_name}</span>
              </div>
            )}

            {issue.officer_name && (
              <div>
                <User size={16} />
                <span>{issue.officer_name}</span>
              </div>
            )}
          </div>

          <div className="before-after-grid">
            {/* BEFORE PHOTO */}
            <div className="proof-card">
              <div className="proof-label">BEFORE REPAIR</div>

              {beforeImage && !imageErrors.before ? (
                <img
                  src={beforeImage}
                  alt="Before issue repair"
                  className="proof-image"
                  onError={() => handleImageError("before")}
                />
              ) : (
                <div className="proof-placeholder">
                  <ImageOff size={32} />
                  <span>Before photo unavailable</span>
                </div>
              )}
            </div>

            {/* AFTER PHOTO */}
            <div className="proof-card">
              <div className="proof-label">AFTER RESOLUTION</div>

              {afterImage && !imageErrors.after ? (
                <img
                  src={afterImage}
                  alt="After issue repair"
                  className="proof-image"
                  onError={() => handleImageError("after")}
                />
              ) : (
                <div className="proof-placeholder">
                  <ImageOff size={32} />
                  <span>Resolution photo pending upload</span>
                </div>
              )}
            </div>
          </div>

          <div className="verification-section">
            <label htmlFor="remarks">Citizen Verification Remarks</label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Leave feedback on whether the issue was resolved satisfactorily..."
              rows={4}
              disabled={submitting}
            />
          </div>

          {error && <div className="auth-error" style={{ marginTop: "16px" }}>{error}</div>}

          <div className="verification-actions">
            <Button
              variant="danger"
              icon={XCircle}
              disabled={submitting}
              onClick={() => handleVerification(false)}
            >
              Reject Resolution
            </Button>

            <Button
              variant="fin"
              icon={CheckCircle2}
              loading={submitting}
              onClick={() => handleVerification(true)}
            >
              {submitting ? "Submitting..." : "Approve & Close Issue"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VerifyResolution;