import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  MapPin,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";

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
        "Issue reported successfully. CivicFlow has routed it to the appropriate department."
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
      <Navbar roleTitle="Citizen" />

      <main className="dashboard-content" style={{ maxWidth: "780px" }}>
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

        <section className="welcome-section" style={{ marginBottom: "28px" }}>
          <div>
            <p className="eyebrow">CIVIC ISSUE REPORTER</p>
            <h1>Report a Civic Problem</h1>
            <p>
              Describe the issue and upload a clear photo. CivicFlow's system
              will assign the responsible department and alert field teams.
            </p>
          </div>
        </section>

        <section>
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-group">
              <label>Issue Title *</label>
              <input
                type="text"
                placeholder="Example: Deep pothole near main traffic junction"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select issue category</option>
                <option value="POTHOLE">Pothole</option>
                <option value="ROAD_DAMAGE">Road Damage</option>
                <option value="STREETLIGHT">Streetlight</option>
                <option value="GARBAGE">Garbage & Waste</option>
                <option value="WATER_LEAKAGE">Water Leakage</option>
              </select>
            </div>

            <div className="form-group">
              <label>Detailed Description *</label>
              <textarea
                placeholder="Explain the issue, severity, or any hazards to commuters..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={15} />
                <span>Location Address / Landmark *</span>
              </label>
              <input
                type="text"
                placeholder="Example: Near SRM Main Gate, GST Road, Kattankulathur"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Evidence Photo (Before) *</label>
              <div className="upload-box">
                <Upload size={28} />
                <strong>
                  {image ? image.name : "Click or drag to upload issue photo"}
                </strong>
                <span>Supports JPG, PNG or WEBP (Max 10MB)</span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  required
                />

                {image && (
                  <div className="selected-file">
                    <CheckCircle2 size={15} />
                    <span>File selected: {image.name}</span>
                  </div>
                )}
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
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="fin"
              size="lg"
              loading={loading}
              icon={Send}
              style={{ width: "100%", marginTop: "12px" }}
            >
              {loading ? "Submitting Report..." : "Submit Civic Issue"}
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
}