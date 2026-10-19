import React from "react";
import { Award, X, Layers, FileCheck, Bookmark, ExternalLink } from "lucide-react";

export default function SchemeDetailModal({
  scheme,
  onClose,
  checkedDocs,
  setCheckedDocs,
  onSaveScheme
}) {
  if (!scheme) return null;

  return (
    <div className="scheme-modal-overlay" onClick={onClose}>
      <div className="scheme-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="scheme-modal-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.2)", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                <Award size={12} /> {scheme.category}
              </div>
              <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 0.35rem" }}>
                {scheme.name}
              </h2>
              <div style={{ fontSize: "0.82rem", opacity: 0.9 }}>
                🏛️ {scheme.implementing_agency}
              </div>
            </div>
            <button
              type="button"
              className="btn-close-reg-modal"
              onClick={onClose}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="scheme-modal-body">
          {/* Full Description & Benefit */}
          <div className="scheme-benefit-highlight">
            <div style={{ fontWeight: 800, color: "#15803d", marginBottom: "0.3rem", fontSize: "1.05rem" }}>
              🎁 Financial Subsidy & Support
            </div>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#166534", lineHeight: 1.5 }}>
              {scheme.benefit_summary}
            </p>
          </div>

          {/* Step-by-Step Application Procedure */}
          <div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.45rem" }}>
              <Layers size={18} color="#15803d" /> Step-by-Step Application Process
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {(scheme.application_steps || []).map((step, idx) => (
                <div key={idx} className="scheme-step-item">
                  <div className="scheme-step-num">{idx + 1}</div>
                  <div style={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.5 }}>{step}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Required Documents Interactive Checklist */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <FileCheck size={18} color="#15803d" /> Mandatory Documents Checklist
              </h4>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                {Object.values(checkedDocs).filter(Boolean).length} of {(scheme.required_documents || []).length} prepared
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem" }}>
              {(scheme.required_documents || []).map((doc, idx) => {
                const isChecked = !!checkedDocs[doc];
                return (
                  <div
                    key={idx}
                    className={`scheme-doc-interactive-item ${isChecked ? "checked" : ""}`}
                    onClick={() => setCheckedDocs((prev) => ({ ...prev, [doc]: !prev[doc] }))}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      style={{ accentColor: "#15803d", width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "0.88rem", fontWeight: isChecked ? 700 : 500, color: isChecked ? "#15803d" : "#334155" }}>
                      {doc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Helpline & Action */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid #e2e8f0", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
              📞 Toll-Free Helpline: <strong>{scheme.helpline_number}</strong>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                className="btn-refresh-location"
                onClick={() => onSaveScheme(scheme)}
              >
                <Bookmark size={15} />
                <span>Save to Profile</span>
              </button>
              <a
                href={scheme.official_portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-scheme-apply"
                style={{ padding: "0.65rem 1.25rem", fontSize: "0.85rem" }}
              >
                <span>Open Official Portal</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
