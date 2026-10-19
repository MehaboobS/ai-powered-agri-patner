import React, { useState } from "react";
import {
  Award,
  RefreshCw,
  UserPlus,
  CheckCircle2,
  X,
  Calculator,
  Sparkles,
  CircleDollarSign,
  BadgePercent,
  Landmark,
  Search,
  Check,
  Bookmark,
  FileCheck,
  VolumeX,
  Volume2,
  FileText,
  ExternalLink
} from "lucide-react";
import { CROPS, INDIAN_STATES, SCHEME_CATEGORIES } from "../constants";
import SchemeDetailModal from "../components/schemes/SchemeDetailModal";

export default function SchemesPage({
  schemesList,
  schemesLoading,
  schemeLandArea,
  setSchemeLandArea,
  schemeAreaUnit,
  setSchemeAreaUnit,
  schemeCrop,
  setSchemeCrop,
  schemeState,
  setSchemeState,
  eligibilityResult,
  eligibilityLoading,
  handleCheckEligibility,
  fetchSchemesList,
  onOpenRegisterModal,
  savedSchemeIds,
  handleSaveScheme,
  speakingSchemeCode,
  handleSpeakScheme,
  schemeToast,
  setSchemeToast,
  language
}) {
  const [schemeCategoryFilter, setSchemeCategoryFilter] = useState("ALL");
  const [schemeSearch, setSchemeSearch] = useState("");
  const [activeSchemeDetail, setActiveSchemeDetail] = useState(null);
  const [checkedDocs, setCheckedDocs] = useState({});

  return (
    <div className="schemes-view-container">
      {/* Schemes Header */}
      <div className="schemes-header">
        <div className="schemes-title-group">
          <div className="badge-tag" style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" }}>
            <Award size={14} /> Direct Benefit Transfer (DBT) • Ministry of Agriculture & Farmers Welfare
          </div>
          <h1>🏛️ Government Schemes & Subsidy Eligibility Finder</h1>
          <p>
            Personalized eligibility evaluator for Indian agricultural subsidies, ₹6,000/yr direct income support, 55% micro-irrigation grants, and comprehensive PMFBY crop insurance.
          </p>
        </div>

        <div className="schemes-header-actions">
          <div className="schemes-live-pill">
            <span className="schemes-live-dot" />
            <span>{eligibilityLoading ? "⚡ Recalculating Live Schemes..." : "⚡ Real-Time Auto Sync Active"}</span>
          </div>
          <button
            type="button"
            className="schemes-refresh-btn"
            onClick={() => {
              fetchSchemesList();
              handleCheckEligibility();
            }}
            disabled={schemesLoading || eligibilityLoading}
            title="Force re-fetch schemes from Central Agricultural Database"
          >
            <RefreshCw size={15} className={schemesLoading || eligibilityLoading ? "spinning" : ""} />
            <span>{schemesLoading || eligibilityLoading ? "Syncing..." : "Refresh Directory"}</span>
          </button>
          <button
            type="button"
            className="btn-register-header"
            onClick={onOpenRegisterModal}
            title="Register a new farmer profile in the registry"
          >
            <UserPlus size={15} />
            <span>Register as New User</span>
          </button>
        </div>
      </div>

      {/* Notification Toast for Saved Schemes */}
      {schemeToast && (
        <div className="reg-toast-banner" style={{ background: "linear-gradient(135deg, #15803d 0%, #166534 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 size={18} />
            <span>{schemeToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSchemeToast(null)}
            style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Interactive Farm Profile & Eligibility Calculator Card */}
      <div className="schemes-calc-card">
        <div className="schemes-calc-header">
          <div className="schemes-calc-title">
            <Calculator size={20} color="#15803d" />
            <span>Interactive Farm Eligibility Matcher</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            {eligibilityLoading ? (
              <div className="schemes-tier-badge" style={{ background: "#fef3c7", borderColor: "#fde68a", color: "#b45309" }}>
                <RefreshCw size={13} className="spinning" />
                <span>⚡ Recalculating...</span>
              </div>
            ) : eligibilityResult ? (
              <div className="schemes-tier-badge">
                <CheckCircle2 size={14} />
                <span>{eligibilityResult.farmer_tier}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="schemes-calc-grid">
          {/* 1. Land Holding Size */}
          <div className="schemes-input-group">
            <label className="schemes-field-label">
              <span>Landholding Size</span>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                ({schemeAreaUnit === "Guntas" ? `${(Number(schemeLandArea) / 40).toFixed(2)} Acres` : `${schemeLandArea} ${schemeAreaUnit}`})
              </span>
            </label>
            <div className="schemes-area-controls">
              <input
                type="number"
                step="0.25"
                min="0.1"
                className="schemes-area-input"
                value={schemeLandArea}
                onChange={(e) => setSchemeLandArea(e.target.value)}
              />
              <select
                className="schemes-unit-select"
                value={schemeAreaUnit}
                onChange={(e) => setSchemeAreaUnit(e.target.value)}
              >
                <option value="Acres">Acres</option>
                <option value="Guntas">Guntas (40=1 Ac)</option>
                <option value="Hectares">Hectares</option>
                <option value="Bighas">Bighas</option>
              </select>
            </div>
          </div>

          {/* 2. Primary Cultivated Crop */}
          <div className="schemes-input-group">
            <label className="schemes-field-label">Primary Cultivated Crop</label>
            <select
              className="schemes-dropdown"
              value={schemeCrop}
              onChange={(e) => setSchemeCrop(e.target.value)}
            >
              <option value="All Crops">All Crops (General Agriculture)</option>
              {CROPS.filter(c => !c.includes("Select")).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 3. State / Region */}
          <div className="schemes-input-group">
            <label className="schemes-field-label">State / Union Territory</label>
            <select
              className="schemes-dropdown"
              value={schemeState}
              onChange={(e) => setSchemeState(e.target.value)}
            >
              {INDIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 4. Check Action Button */}
          <div className="schemes-input-group" style={{ width: "auto" }}>
            <label className="schemes-field-label schemes-label-placeholder" aria-hidden="true">&nbsp;</label>
            <button
              type="button"
              className="btn-check-eligibility"
              onClick={() => handleCheckEligibility()}
              disabled={eligibilityLoading}
            >
              {eligibilityLoading ? (
                <>
                  <RefreshCw size={16} className="spinning" />
                  <span>Recalculating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Evaluate Eligibility</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1-Tap Quick Acreage Chips Bar */}
        <div className="schemes-quick-chips-bar">
          <span className="schemes-quick-chips-label">
            <Sparkles size={13} color="#15803d" /> Quick Land Size:
          </span>
          {[
            { label: "0.5 Ac", val: 0.5, unit: "Acres" },
            { label: "1 Ac", val: 1.0, unit: "Acres" },
            { label: "2 Ac", val: 2.0, unit: "Acres" },
            { label: "5 Ac", val: 5.0, unit: "Acres" },
            { label: "10 Ac", val: 10.0, unit: "Acres" },
            { label: "2 Guntas", val: 2, unit: "Guntas" },
            { label: "10 Guntas", val: 10, unit: "Guntas" },
            { label: "1 Hectare", val: 1, unit: "Hectares" },
            { label: "2 Hectares", val: 2, unit: "Hectares" },
          ].map((chip) => {
            const isAct = Number(schemeLandArea) === chip.val && schemeAreaUnit === chip.unit;
            return (
              <button
                key={chip.label}
                type="button"
                className={`schemes-quick-chip ${isAct ? "active" : ""}`}
                onClick={() => {
                  setSchemeAreaUnit(chip.unit);
                  setSchemeLandArea(chip.val);
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Summary Cards */}
      {eligibilityResult && (
        <div className="schemes-metrics-strip">
          <div className="schemes-metric-card benefit">
            <div className="schemes-metric-icon" style={{ background: "#dcfce7", color: "#15803d" }}>
              <CircleDollarSign size={26} />
            </div>
            <div className="schemes-metric-content">
              <span className="schemes-metric-value" style={{ color: "#15803d" }}>
                ₹{eligibilityResult.total_estimated_benefit_inr.toLocaleString("en-IN")}
              </span>
              <span className="schemes-metric-label">Estimated Potential Financial Benefit</span>
            </div>
          </div>

          <div className="schemes-metric-card schemes">
            <div className="schemes-metric-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
              <CheckCircle2 size={26} />
            </div>
            <div className="schemes-metric-content">
              <span className="schemes-metric-value" style={{ color: "#1d4ed8" }}>
                {eligibilityResult.eligible_schemes_count} of {eligibilityResult.total_schemes_evaluated}
              </span>
              <span className="schemes-metric-label">Qualifying Welfare Schemes</span>
            </div>
          </div>

          <div className="schemes-metric-card subsidy">
            <div className="schemes-metric-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
              <BadgePercent size={26} />
            </div>
            <div className="schemes-metric-content">
              <span className="schemes-metric-value" style={{ color: "#b45309" }}>
                Up to 55%
              </span>
              <span className="schemes-metric-label">Max Government Capital Subsidy Tier</span>
            </div>
          </div>

          <div className="schemes-metric-card cash">
            <div className="schemes-metric-icon" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
              <Landmark size={26} />
            </div>
            <div className="schemes-metric-content">
              <span className="schemes-metric-value" style={{ color: "#6d28d9" }}>
                ₹6,000 / yr
              </span>
              <span className="schemes-metric-label">Direct Cash Benefit (PM-KISAN DBT)</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="schemes-filter-bar">
        <div className="schemes-chips-scroll">
          {SCHEME_CATEGORIES.map(cat => {
            const count = cat === "ALL"
              ? (schemesList.length || 8)
              : schemesList.filter(s => s.category === cat).length;
            const label = cat === "ALL" ? `All Schemes (${count})` : `${cat} (${count})`;
            return (
              <button
                key={cat}
                type="button"
                className={`scheme-filter-chip ${schemeCategoryFilter === cat ? "active" : ""}`}
                onClick={() => setSchemeCategoryFilter(cat)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="schemes-search-box">
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search scheme (e.g. Drip, KCC, Solar, Insurance)..."
            value={schemeSearch}
            onChange={(e) => setSchemeSearch(e.target.value)}
          />
          {schemeSearch && (
            <button
              type="button"
              onClick={() => setSchemeSearch("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Schemes Cards Grid */}
      {schemesLoading ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
          <RefreshCw size={36} className="spinning" style={{ margin: "0 auto 1rem", color: "#15803d" }} />
          <div style={{ fontWeight: 700 }}>Connecting to Central Agricultural Database...</div>
        </div>
      ) : (
        <div className="schemes-cards-grid">
          {(eligibilityResult ? eligibilityResult.results : schemesList.map(s => ({ scheme: s, is_eligible: true, match_score: 95, match_reasons: [], estimated_financial_benefit: s.financial_benefit_max, subsidy_text: `${s.subsidy_percentage || 50}% Subsidy` })))
            .filter(({ scheme }) => {
              const matchesCategory = schemeCategoryFilter === "ALL" || scheme.category === schemeCategoryFilter;
              const matchesSearch = !schemeSearch ||
                scheme.name.toLowerCase().includes(schemeSearch.toLowerCase()) ||
                scheme.short_name.toLowerCase().includes(schemeSearch.toLowerCase()) ||
                scheme.benefit_summary.toLowerCase().includes(schemeSearch.toLowerCase());
              return matchesCategory && matchesSearch;
            })
            .map(({ scheme, is_eligible, match_score, estimated_financial_benefit, subsidy_text }) => {
              const isSaved = savedSchemeIds.includes(scheme.id);
              const isSpeakingThis = speakingSchemeCode === scheme.code;

              return (
                <div key={scheme.id || scheme.code} className={`scheme-card ${is_eligible ? "eligible" : ""}`}>
                  <div>
                    {/* Card Top */}
                    <div className="scheme-card-top">
                      <div className="scheme-badges-row">
                        <span className="badge-scheme-cat">{scheme.category}</span>
                        <span className={`badge-scheme-match ${match_score >= 85 ? "high" : "med"}`}>
                          <Check size={12} /> {match_score}% Match
                        </span>
                      </div>
                      <button
                        type="button"
                        className={`btn-bookmark-scheme ${isSaved ? "saved" : ""}`}
                        onClick={() => handleSaveScheme(scheme)}
                        title={isSaved ? "Saved to your profile" : "Bookmark this scheme"}
                      >
                        <Bookmark size={16} fill={isSaved ? "#eab308" : "none"} />
                      </button>
                    </div>

                    {/* Title & Agency */}
                    <h3 className="scheme-card-title">{scheme.short_name || scheme.name}</h3>
                    <div className="scheme-agency">🏛️ {scheme.implementing_agency}</div>

                    {/* Benefit Callout */}
                    <div className="scheme-benefit-highlight">
                      <div className="scheme-benefit-value-row">
                        <div className="scheme-benefit-amount">
                          <CircleDollarSign size={18} />
                          <span>{estimated_financial_benefit ? `₹${estimated_financial_benefit.toLocaleString("en-IN")}` : "Subsidized Support"}</span>
                        </div>
                        <span className="scheme-subsidy-tag">{subsidy_text}</span>
                      </div>
                      <p className="scheme-benefit-desc">{scheme.benefit_summary}</p>
                    </div>

                    {/* Key Eligibility Summary */}
                    <div className="scheme-checklist-preview">
                      {(scheme.key_eligibility || []).slice(0, 2).map((crit, idx) => (
                        <div key={idx} className="scheme-crit-item">
                          <CheckCircle2 size={14} />
                          <span>{crit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Required Documents preview */}
                    <div className="scheme-docs-chips">
                      {(scheme.required_documents || []).slice(0, 3).map((doc, idx) => (
                        <span key={idx} className="doc-chip">
                          <FileCheck size={11} color="#15803d" />
                          <span>{doc}</span>
                        </span>
                      ))}
                      {(scheme.required_documents || []).length > 3 && (
                        <span className="doc-chip" style={{ background: "#f1f5f9", color: "#64748b" }}>
                          +{(scheme.required_documents.length - 3)} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="scheme-card-footer">
                    <div className="scheme-action-left">
                      <button
                        type="button"
                        className={`btn-scheme-listen ${isSpeakingThis ? "speaking" : ""}`}
                        onClick={() => handleSpeakScheme(scheme)}
                        title="Listen to scheme details in your language"
                      >
                        {isSpeakingThis ? <VolumeX size={15} /> : <Volume2 size={15} />}
                        <span>{isSpeakingThis ? "Stop Audio" : `Listen (${language})`}</span>
                      </button>

                      <button
                        type="button"
                        className="btn-scheme-details"
                        onClick={() => {
                          setActiveSchemeDetail(scheme);
                          setCheckedDocs({});
                        }}
                      >
                        <FileText size={15} />
                        <span>Checklist & Steps</span>
                      </button>
                    </div>

                    <a
                      href={scheme.official_portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-scheme-apply"
                    >
                      <span>Apply on Portal</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Detailed Scheme Walkthrough & Checklist Modal */}
      {activeSchemeDetail && (
        <SchemeDetailModal
          scheme={activeSchemeDetail}
          onClose={() => setActiveSchemeDetail(null)}
          checkedDocs={checkedDocs}
          setCheckedDocs={setCheckedDocs}
          onSaveScheme={handleSaveScheme}
        />
      )}
    </div>
  );
}
