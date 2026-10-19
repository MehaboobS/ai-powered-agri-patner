import React, { useState, useRef } from "react";
import {
  Sparkles,
  UserPlus,
  Leaf,
  AlertTriangle,
  UploadCloud,
  X,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  ShieldAlert,
  Sprout,
  FlaskConical,
  RotateCcw,
  CloudRain,
  Info
} from "lucide-react";
import { CROPS, LANGUAGES } from "../constants";
import { diagnoseCrop } from "../services/api";

export default function DiagnosticsPage({
  onOpenRegisterModal,
  language,
  setLanguage,
  diagnosis,
  setDiagnosis,
  weather,
  farmerLocation,
  navigateTab,
  searchMandiRates,
  setMandiQuery
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cropType, setCropType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }
    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadSampleImage = async () => {
    try {
      const response = await fetch("/sample_crop_leaf.jpg");
      const blob = await response.blob();
      const file = new File([blob], "sample_crop_leaf.jpg", { type: "image/jpeg" });
      handleFileChange(file);
      setCropType("Tomato");
    } catch {
      setError("Could not load sample image.");
    }
  };

  const handleDiagnose = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please upload a crop leaf image first.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (cropType && cropType !== "Select Crop (or Auto-detect)") {
      formData.append("crop_type", cropType);
    }
    formData.append("language", language);

    try {
      const data = await diagnoseCrop(formData);
      setDiagnosis(data);
    } catch (err) {
      setError(err.message || "Failed to connect to FastAPI backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="app-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", textAlign: "left", marginBottom: "2rem" }}>
        <div>
          <div className="badge-tag">
            <Sparkles size={14} /> AI Plant Pathology • Multi-lingual Advisory
          </div>
          <h1 className="app-title" style={{ fontSize: "2rem" }}>AI Crop Health Diagnostics</h1>
          <p className="app-subtitle" style={{ margin: "0" }}>
            Upload an affected leaf photo for instant disease detection, regenerative bio-controls, and targeted chemical remedies.
          </p>
        </div>
        <button
          type="button"
          className="btn-register-header"
          onClick={onOpenRegisterModal}
          title="Register a new farmer profile in the registry"
        >
          <UserPlus size={15} />
          <span>Register as New User</span>
        </button>
      </header>

      {/* Main Diagnostics Grid */}
      <div className="main-grid">
        {/* Left Column: Upload & Context */}
        <section className="glass-card">
          <h2 className="card-title">
            <Leaf size={22} color="#15803d" /> Crop Image & Context
          </h2>

          {error && (
            <div className="alert-error">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleDiagnose}>
            {/* Upload Zone */}
            <div className="form-group">
              <label className="form-label">Upload Affected Leaf / Plant Photo</label>

              {!previewUrl ? (
                <div
                  className={`dropzone ${dragOver ? "dragover" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="dropzone-content">
                    <UploadCloud className="dropzone-icon" />
                    <div className="dropzone-text">
                      <strong>Click to upload</strong> or drag and drop
                      <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
                        JPG, PNG, or WEBP (Max 10MB)
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="preview-container">
                  <img src={previewUrl} alt="Crop preview" className="preview-img" />
                  <button
                    type="button"
                    className="btn-remove-img"
                    onClick={clearImage}
                    title="Remove image"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
              />

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="sample-leaf-btn"
                  onClick={loadSampleImage}
                >
                  <Sparkles size={14} color="#15803d" /> Load Sample Leaf Image
                </button>
              </div>
            </div>

            {/* Crop selector */}
            <div className="form-group">
              <label className="form-label" htmlFor="crop-select">Crop Type (Optional)</label>
              <select
                id="crop-select"
                className="form-select"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
              >
                {CROPS.map((c) => (
                  <option key={c} value={c === "Select Crop (or Auto-detect)" ? "" : c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div className="form-group">
              <label className="form-label" htmlFor="lang-select">Advisory Language</label>
              <select
                id="lang-select"
                className="form-select"
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setLanguage(newLang);
                }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !selectedFile}
            >
              {loading ? (
                <>
                  <div className="spinner" /> Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Run AI Diagnostic
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right Column: Diagnostic Report */}
        <section className="glass-card">
          <h2 className="card-title">
            <CheckCircle2 size={22} color="#15803d" /> Diagnostic Report
          </h2>

          {!diagnosis ? (
            <div className="empty-placeholder">
              <Sprout className="empty-icon" />
              <p>Upload a leaf image and click <strong>"Run AI Diagnostic"</strong> to see diagnosis and regenerative treatments.</p>
            </div>
          ) : (
            <div>
              {/* Header result */}
              <div className="result-header">
                <div>
                  <h3 className="disease-name">{diagnosis.condition}</h3>
                  <div className="crop-tag">Crop: {diagnosis.crop_detected}</div>
                </div>
                <span className={`severity-pill severity-${diagnosis.severity}`}>
                  {diagnosis.severity} Severity
                </span>
              </div>

              {/* Stats overview */}
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-label">Health Status</div>
                  <div className="stat-value" style={{ color: diagnosis.is_healthy ? "#16a34a" : "#dc2626" }}>
                    {diagnosis.is_healthy ? "Healthy Plant" : "Infected / Stress"}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Confidence</div>
                  <div className="stat-value">
                    {(diagnosis.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Quick Mandi check shortcut */}
              <div
                style={{
                  margin: "1rem 0",
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: "0.75rem",
                  padding: "0.75rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer"
                }}
                onClick={() => {
                  navigateTab("mandi");
                  if (setMandiQuery) setMandiQuery(diagnosis.crop_detected);
                  if (searchMandiRates) {
                    searchMandiRates(diagnosis.crop_detected, language, farmerLocation.latitude, farmerLocation.longitude);
                  }
                }}
                title="Check nearest mandi market selling rate for this crop"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <TrendingUp size={18} color="#15803d" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#166534" }}>
                    Check Nearest Mandi Rate for {diagnosis.crop_detected}
                  </span>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#15803d", display: "flex", alignItems: "center" }}>
                  View Nearest Rates <ChevronRight size={14} />
                </span>
              </div>

              {/* Symptoms */}
              {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
                <div>
                  <div className="section-title">
                    <ShieldAlert size={16} color="#d97706" /> Observed Symptoms
                  </div>
                  <ul className="symptoms-list">
                    {diagnosis.symptoms.map((symptom, idx) => (
                      <li key={idx}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Remedies */}
              {diagnosis.remedies && (
                <div>
                  <div className="section-title">
                    <Sprout size={16} color="#15803d" /> Recommended Treatments
                  </div>

                  {/* Organic / Regenerative */}
                  <div className="remedy-card remedy-organic">
                    <div className="remedy-head">
                      <Sprout size={16} /> Organic & Regenerative Solution
                    </div>
                    <div className="remedy-body">{diagnosis.remedies.organic}</div>
                  </div>

                  {/* Chemical Alternative */}
                  <div className="remedy-card remedy-chemical">
                    <div className="remedy-head">
                      <FlaskConical size={16} /> Chemical Intervention (Targeted)
                    </div>
                    <div className="remedy-body">{diagnosis.remedies.chemical}</div>
                  </div>

                  {/* Preventative Measures */}
                  <div className="remedy-card remedy-preventative">
                    <div className="remedy-head">
                      <RotateCcw size={16} /> Preventative & Cultural Practices
                    </div>
                    <div className="remedy-body">{diagnosis.remedies.preventative}</div>
                  </div>
                </div>
              )}

              {/* Weather spray notice banner linking to weather tab */}
              {weather && (
                <div
                  style={{
                    marginTop: "1.25rem",
                    background: weather.spray_advisory.status === "AVOID" ? "#fef2f2" : "#f0fdf4",
                    border: `1px solid ${weather.spray_advisory.status === "AVOID" ? "#fca5a5" : "#bbf7d0"}`,
                    borderRadius: "0.75rem",
                    padding: "0.85rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                    cursor: "pointer"
                  }}
                  onClick={() => navigateTab("weather")}
                  title="Click to view weather advisory"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CloudRain size={18} color={weather.spray_advisory.status === "AVOID" ? "#dc2626" : "#15803d"} />
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                        {weather.spray_advisory.headline}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {weather.spray_advisory.recommended_window}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#15803d", display: "flex", alignItems: "center" }}>
                    Check Weather <ChevronRight size={14} />
                  </span>
                </div>
              )}

              {/* Advisory notes */}
              {diagnosis.advisory_notes && (
                <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#64748b", display: "flex", gap: "0.4rem" }}>
                  <Info size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>{diagnosis.advisory_notes}</span>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
