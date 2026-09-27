import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  MapPin,
  Send,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";

export default function ReportIssue() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!image) {
      setError("Please upload a photo of the issue.");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("location", location);
    formData.append("before_image", image);

    setLoading(true);

    try {
      await api.post("/api/issues", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(
        "Issue reported successfully. The system will automatically route it to the appropriate department."
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Failed to report issue:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to submit the issue. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="brand">
          <div className="brand-icon">C</div>
          <span>CivicFlow</span>
        </div>
      </header>

      <main className="dashboard-content">
        <button
          className="secondary-button"
          onClick={() => navigate("/dashboard")}
          style={{
            marginBottom: "24px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <section className="welcome-section">
          <div>
            <p className="eyebrow">CIVIC ISSUE REPORTER</p>

            <h1>Report an Issue</h1>

            <p>
              Tell us about the problem and CivicFlow will route it to
              the appropriate department.
            </p>
          </div>
        </section>

        <section className="issues-section">
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-group">
              <label>Issue Title</label>

              <input
                type="text"
                placeholder="Example: Large pothole near main road"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select issue category</option>
                <option value="POTHOLE">Pothole</option>
                <option value="ROAD_DAMAGE">Road Damage</option>
                <option value="STREETLIGHT">Streetlight</option>
                <option value="GARBAGE">Garbage</option>
                <option value="WATER_LEAKAGE">Water Leakage</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <MapPin size={17} style={{ verticalAlign: "middle" }} />{" "}
                Location
              </label>

              <input
                type="text"
                placeholder="Example: Near SRM Main Gate, Kattankulathur"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Before Photo</label>

              <div className="upload-box">
                <Upload size={28} />

                <p>
                  {image
                    ? image.name
                    : "Upload a photo showing the issue"}
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="auth-success">
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
              style={{
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              <Send size={18} />

              {loading ? "Submitting..." : "Submit Issue"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}