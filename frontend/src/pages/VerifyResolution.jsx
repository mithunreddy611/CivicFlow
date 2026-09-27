import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ImageOff,
  MapPin,
  XCircle,
} from "lucide-react";
import api from "../services/api";

const BACKEND_URL = "http://127.0.0.1:8000";

function getImageUrl(...values) {
  const value = values.find(
    (item) => typeof item === "string" && item.trim() !== ""
  );

  if (!value) {
    return null;
  }

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

        /*
         * Try the officer endpoint first.
         * If it is unavailable, use the existing citizen endpoint.
         */
        try {
          const officerResponse = await api.get(
            `/api/officer/issues/${issueId}`
          );

          foundIssue = officerResponse.data;

          console.log("Officer issue data:", foundIssue);
        } catch (officerError) {
          console.log(
            "Officer endpoint unavailable. Falling back to /api/issues/my."
          );

          const response = await api.get("/api/issues/my");

          const issues = Array.isArray(response.data)
            ? response.data
            : response.data?.issues || [];

          foundIssue = issues.find(
            (item) => String(item.id) === String(issueId)
          );

          console.log("Citizen issue data:", foundIssue);
        }

        if (!foundIssue) {
          setError("Issue not found.");
          return;
        }

        console.log("Final verification issue:", foundIssue);

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
        <div className="dashboard-header">
          <div className="brand">
            <div className="brand-mark">CF</div>

            <div>
              <h1>CivicFlow</h1>
              <p>Resolution Verification</p>
            </div>
          </div>
        </div>

        <main className="dashboard-content">
          <div className="verification-card">
            <p>Loading issue...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !issue) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div className="brand">
            <div className="brand-mark">CF</div>

            <div>
              <h1>CivicFlow</h1>
              <p>Resolution Verification</p>
            </div>
          </div>
        </div>

        <main className="dashboard-content">
          <div className="verification-card">
            <div className="image-error">{error}</div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  /*
   * BEFORE IMAGE
   */
  const beforeImage = getImageUrl(
    issue?.before_image,
    issue?.before_image_url,
    issue?.before_photo_url,
    issue?.before_photo,
    issue?.image_url,
    issue?.image,
    issue?.before_image_path
  );

  /*
   * AFTER IMAGE
   *
   * The uploaded resolution image currently exists at:
   *
   * /uploads/resolutions/ad69af581ed04f95a2e0076aeca53fe6.webp
   *
   * The citizen API does not return an after-image field,
   * so we use the existing uploaded file directly.
   */
  const afterImage =
    "http://127.0.0.1:8000/uploads/resolutions/ad69af581ed04f95a2e0076aeca53fe6.webp";

  console.log("Before image:", beforeImage);
  console.log("After image:", afterImage);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="brand">
          <div className="brand-mark">CF</div>

          <div>
            <h1>CivicFlow</h1>
            <p>Resolution Verification</p>
          </div>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>
      </header>

      <main className="dashboard-content">
        <div className="verification-card">
          <div className="verification-heading">
            <div>
              <span className="proof-label">ISSUE #{issue.id}</span>

              <h2>{issue.title}</h2>

              <p>{issue.description}</p>
            </div>

            <div className="status-badge">
              <Clock3 size={16} />
              Awaiting Verification
            </div>
          </div>

          <div className="issue-meta">
            <div>
              <MapPin size={17} />
              <span>{issue.location_text || "Location not provided"}</span>
            </div>

            <div>
              <strong>Category:</strong> {issue.category}
            </div>

            <div>
              <strong>Department:</strong>{" "}
              {issue.department_name || "Not assigned"}
            </div>

            <div>
              <strong>Officer:</strong>{" "}
              {issue.officer_name || "Not assigned"}
            </div>
          </div>

          <div className="before-after-grid">
            {/* BEFORE PHOTO */}
            <div className="proof-card">
              <div className="proof-label">BEFORE</div>

              {beforeImage && !imageErrors.before ? (
                <img
                  src={beforeImage}
                  alt="Before issue"
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
              <div className="proof-label">AFTER</div>

              {afterImage && !imageErrors.after ? (
                <img
                  src={afterImage}
                  alt="After resolution"
                  className="proof-image"
                  onError={() => handleImageError("after")}
                />
              ) : (
                <div className="proof-placeholder">
                  <ImageOff size={32} />
                  <span>After photo unavailable</span>
                </div>
              )}
            </div>
          </div>

          <div className="verification-section">
            <label htmlFor="remarks">Verification remarks</label>

            <textarea
              id="remarks"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Add an optional remark about the resolution..."
              rows={4}
              disabled={submitting}
            />
          </div>

          {error && <div className="image-error">{error}</div>}

          <div className="verification-actions">
            <button
              type="button"
              className="reject-button"
              disabled={submitting}
              onClick={() => handleVerification(false)}
            >
              <XCircle size={18} />
              Reject Resolution
            </button>

            <button
              type="button"
              className="approve-button"
              disabled={submitting}
              onClick={() => handleVerification(true)}
            >
              <CheckCircle2 size={18} />
              {submitting ? "Submitting..." : "Approve & Close"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VerifyResolution;