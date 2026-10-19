import React, { useState } from "react";
import {
  FlaskConical,
  Layers,
  UserPlus,
  Sprout,
  Calculator,
  Calendar,
  Store,
  Check,
  Bookmark,
  Leaf,
  History
} from "lucide-react";
import { FERT_CROPS, FERT_UNITS, FERT_STAGES } from "../constants";
import { useFertilizerCalculation } from "../hooks/useFertilizerCalculation";
import { saveFertilizerPlan } from "../services/api";

export default function FertilizerPage({
  onOpenRegisterModal,
  savedPlans,
  fetchSavedPlans
}) {
  const [fertCrop, setFertCrop] = useState("Tomato");
  const [fertArea, setFertArea] = useState(1.0);
  const [fertUnit, setFertUnit] = useState("Acres");
  const [fertStage, setFertStage] = useState("Full Season / Recommended POP");
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  const fertCalculation = useFertilizerCalculation(fertCrop, fertArea, fertUnit, fertStage);

  const handleSavePlan = async () => {
    setIsSavingPlan(true);
    setSaveSuccessMsg(null);
    try {
      const saved = await saveFertilizerPlan({
        crop_name: fertCrop,
        land_area: parseFloat(fertArea) || 1.0,
        area_unit: fertUnit,
        growth_stage: fertStage,
        nitrogen_kg: fertCalculation.pureN,
        phosphorus_kg: fertCalculation.pureP,
        potassium_kg: fertCalculation.pureK,
        urea_bags: fertCalculation.ureaBags,
        dap_bags: fertCalculation.dapBags,
        mop_bags: fertCalculation.mopBags,
        fym_tons: fertCalculation.fymTons,
        vermicompost_kg: fertCalculation.vermicompostKg,
        estimated_cost: fertCalculation.totalCost
      });
      setSaveSuccessMsg(`Plan saved to PostgreSQL (ID: ${saved.id.slice(0, 8)})!`);
      if (fetchSavedPlans) fetchSavedPlans();
    } catch (e) {
      console.error("Save plan error:", e);
    } finally {
      setIsSavingPlan(false);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="fert-container">
      {/* Header */}
      <div className="fert-hero-top">
        <div>
          <div className="badge-tag">
            <FlaskConical size={14} /> ICAR Package of Practices • Precision Soil Fertility
          </div>
          <h1 className="weather-view-title">Fertilizer & NPK Dosage Calculator</h1>
          <p className="weather-view-subtitle">
            Calculate exact commercial bag counts (Urea, DAP, MOP), pure elemental N-P-K, and organic alternatives adjusted for your land acreage.
          </p>
        </div>

        {/* Status pill & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
          <span className="location-item-badge" style={{ padding: "0.4rem 0.8rem", fontSize: "0.82rem" }}>
            <Layers size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            Normalized: {fertCalculation.acres} Acres
          </span>
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

      {/* Input Controls Card */}
      <div className="fert-input-card">
        {/* 1. Crop Selection Chips */}
        <div>
          <div className="fert-section-label">
            <Sprout size={14} /> 1. Select Crop
          </div>
          <div className="fert-crop-chips">
            {FERT_CROPS.map((crop) => (
              <button
                key={crop}
                type="button"
                className={`fert-crop-chip ${fertCrop === crop ? "active" : ""}`}
                onClick={() => setFertCrop(crop)}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Land Area & Unit Controls */}
        <div className="fert-acreage-row">
          <div>
            <div className="fert-section-label">
              <Calculator size={14} /> 2. Land Size & Measurement Unit
            </div>
            <div className="fert-area-input-group">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="1000"
                className="fert-number-input"
                value={fertArea}
                onChange={(e) => setFertArea(e.target.value)}
              />
              <div className="fert-unit-pills">
                {FERT_UNITS.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    className={`fert-unit-btn ${fertUnit === unit ? "active" : ""}`}
                    onClick={() => setFertUnit(unit)}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Range Slider for Quick Adjustments */}
          <div className="fert-slider-group">
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>
              <span>Interactive Land Area Slider</span>
              <span style={{ color: "#15803d" }}>{fertArea} {fertUnit}</span>
            </div>
            <input
              type="range"
              min={fertUnit === "Guntas" ? 1 : 0.25}
              max={fertUnit === "Guntas" ? 100 : 25}
              step={fertUnit === "Guntas" ? 1 : 0.25}
              value={fertArea}
              onChange={(e) => setFertArea(parseFloat(e.target.value))}
              className="fert-slider"
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#94a3b8" }}>
              <span>{fertUnit === "Guntas" ? "1 Gunta" : "0.25 Acre"}</span>
              <span>{fertUnit === "Guntas" ? "100 Guntas (2.5 Acres)" : "25 Acres"}</span>
            </div>
          </div>
        </div>

        {/* 3. Crop Growth Stage Selector */}
        <div>
          <div className="fert-section-label">
            <Calendar size={14} /> 3. Current Growth Stage (Split Dose Adjustment)
          </div>
          <div className="fert-stage-chips">
            {FERT_STAGES.map((stage) => (
              <button
                key={stage}
                type="button"
                className={`fert-stage-btn ${fertStage === stage ? "active" : ""}`}
                onClick={() => setFertStage(stage)}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pure Nutrient Requirement Metrics (N-P-K) */}
      <div>
        <div className="fert-section-label">
          <Layers size={14} /> Elemental Nutrient Absorption Demand ({fertCalculation.acres} Acres)
        </div>
        <div className="fert-npk-grid">
          {/* Nitrogen (N) */}
          <div className="nutrient-card card-n">
            <div className="nutrient-card-header">
              <span className="nutrient-role">Nitrogen (N) • Vegetative & Leaves</span>
              <div className="nutrient-badge badge-n">N</div>
            </div>
            <div className="nutrient-amount">
              {fertCalculation.pureN} <span>kg Pure N</span>
            </div>
            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
              Supplies chlorophyll synthesis and rapid vegetative stem elongation.
            </div>
          </div>

          {/* Phosphorus (P) */}
          <div className="nutrient-card card-p">
            <div className="nutrient-card-header">
              <span className="nutrient-role">Phosphate (P₂O₅) • Root & Bloom</span>
              <div className="nutrient-badge badge-p">P</div>
            </div>
            <div className="nutrient-amount">
              {fertCalculation.pureP} <span>kg Pure P₂O₅</span>
            </div>
            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
              Drives deep tap-root branching, early vigor, and flower bud initiation.
            </div>
          </div>

          {/* Potassium (K) */}
          <div className="nutrient-card card-k">
            <div className="nutrient-card-header">
              <span className="nutrient-role">Potash (K₂O) • Yield & Disease Defense</span>
              <div className="nutrient-badge badge-k">K</div>
            </div>
            <div className="nutrient-amount">
              {fertCalculation.pureK} <span>kg Pure K₂O</span>
            </div>
            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
              Regulates stomatal transpiration, fruit weight, brix sugar, and skin firmness.
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Fertilizer Bags Breakdown */}
      <div>
        <div className="fert-section-label">
          <Store size={14} /> Standard Commercial Fertilizer Purchase Requirements (Subsidized MRP)
        </div>
        <div className="fert-bags-grid">
          {/* Urea Bag Card */}
          <div className="fert-bag-card">
            <div>
              <div className="bag-card-top">
                <div>
                  <div className="bag-name">Urea (46% N)</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Primary Nitrogen Source</div>
                </div>
                <span className="bag-weight-pill">45 kg Bag</span>
              </div>

              <div className="bag-count-display">
                <span className="bag-count-num">{fertCalculation.ureaBags}</span>
                <span className="bag-count-label">Bags</span>
              </div>
              <div className="bag-subtext">Total Quantity: {fertCalculation.ureaKg} kg</div>
            </div>

            <div className="bag-cost-row">
              <div className="bag-cost-label">Subsidized MRP (₹266.50/bag)</div>
              <div className="bag-cost-val">₹{fertCalculation.ureaCost.toLocaleString()}</div>
            </div>
          </div>

          {/* DAP Bag Card */}
          <div className="fert-bag-card">
            <div>
              <div className="bag-card-top">
                <div>
                  <div className="bag-name">DAP (18-46-0)</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Di-Ammonium Phosphate</div>
                </div>
                <span className="bag-weight-pill">50 kg Bag</span>
              </div>

              <div className="bag-count-display">
                <span className="bag-count-num">{fertCalculation.dapBags}</span>
                <span className="bag-count-label">Bags</span>
              </div>
              <div className="bag-subtext">Total Quantity: {fertCalculation.dapKg} kg (Supplies both P & starter N)</div>
            </div>

            <div className="bag-cost-row">
              <div className="bag-cost-label">Subsidized MRP (₹1,350/bag)</div>
              <div className="bag-cost-val">₹{fertCalculation.dapCost.toLocaleString()}</div>
            </div>
          </div>

          {/* MOP Potash Bag Card */}
          <div className="fert-bag-card">
            <div>
              <div className="bag-card-top">
                <div>
                  <div className="bag-name">MOP (60% K₂O)</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Muriate of Potash</div>
                </div>
                <span className="bag-weight-pill">50 kg Bag</span>
              </div>

              <div className="bag-count-display">
                <span className="bag-count-num">{fertCalculation.mopBags}</span>
                <span className="bag-count-label">Bags</span>
              </div>
              <div className="bag-subtext">Total Quantity: {fertCalculation.mopKg} kg</div>
            </div>

            <div className="bag-cost-row">
              <div className="bag-cost-label">Market Price (₹1,700/bag)</div>
              <div className="bag-cost-val">₹{fertCalculation.mopCost.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Input Investment Banner with Save Plan Action */}
      <div className="fert-cost-summary">
        <div>
          <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
            Estimated Total Commercial Input Investment
          </div>
          <div className="cost-total-display">
            <span className="cost-total-amount">₹{fertCalculation.totalCost.toLocaleString()}</span>
            <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>for {fertArea} {fertUnit} ({fertCalculation.acres} Acres)</span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "#cbd5e1", marginTop: "0.25rem" }}>
            *Prices calculated using official Govt of India subsidized fertilizer MRPs.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {saveSuccessMsg && (
            <span style={{ fontSize: "0.85rem", color: "#86efac", fontWeight: 700 }}>
              <Check size={16} style={{ display: "inline", verticalAlign: "middle" }} /> {saveSuccessMsg}
            </span>
          )}
          <button
            type="button"
            className="btn-save-plan"
            onClick={handleSavePlan}
            disabled={isSavingPlan}
          >
            {isSavingPlan ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Bookmark size={18} />}
            Save Plan to PostgreSQL
          </button>
        </div>
      </div>

      {/* Organic & Bio-Fertilizer Package Card */}
      <div className="organic-package-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Leaf size={20} color="#16a34a" />
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#166534" }}>
              Organic & Biological Soil Health Package
            </h3>
          </div>
          <span className="location-item-badge" style={{ background: "#dcfce7", color: "#166534" }}>
            Zero-Residue Bio-Enhancement
          </span>
        </div>

        <p style={{ margin: 0, fontSize: "0.86rem", color: "#334155", lineHeight: 1.5 }}>
          {fertCalculation.benefits}
        </p>

        <div className="organic-items-grid">
          <div className="organic-mini-box">
            <div className="organic-mini-val">{fertCalculation.fymTons} Tons</div>
            <div className="organic-mini-label">Well-Decomposed FYM / Compost</div>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Apply 2–3 weeks before sowing</span>
          </div>

          <div className="organic-mini-box">
            <div className="organic-mini-val">{fertCalculation.vermicompostKg} kg</div>
            <div className="organic-mini-label">High-Humus Vermicompost</div>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Mix along seedling furrow / dripper lines</span>
          </div>

          <div className="organic-mini-box">
            <div className="organic-mini-val">{fertCalculation.neemCakeKg} kg</div>
            <div className="organic-mini-label">De-oiled Neem Cake</div>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Suppresses root nematodes & slows nitrogen leaching</span>
          </div>

          <div className="organic-mini-box">
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#166534", marginBottom: "0.2rem" }}>Bio-Inoculants:</div>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.75rem", color: "#475569" }}>
              {fertCalculation.biofertilizers.map((bio, idx) => (
                <li key={idx}>{bio}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Split Application Schedule Timetable */}
      <div className="fert-schedule-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>
              <Calendar size={18} color="#15803d" /> Stage-Wise Fertilizer Split Schedule
            </h3>
            <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "0.25rem" }}>
              Never apply 100% Nitrogen at sowing. Split applications prevent nitrate leaching into groundwater and increase fertilizer use efficiency by 30%.
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Growth Stage</th>
                <th>Agronomic Timing</th>
                <th>Urea %</th>
                <th>DAP %</th>
                <th>MOP %</th>
                <th>Method of Application</th>
              </tr>
            </thead>
            <tbody>
              {fertCalculation.schedules.map((sched, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: "#0f172a" }}>{sched.stage}</td>
                  <td style={{ color: "#2563eb", fontWeight: 600 }}>{sched.timing}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: sched.urea > 0 ? "#15803d" : "#94a3b8" }}>
                      {sched.urea}%
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: sched.dap > 0 ? "#2563eb" : "#94a3b8" }}>
                      {sched.dap}%
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: sched.mop > 0 ? "#d97706" : "#94a3b8" }}>
                      {sched.mop}%
                    </span>
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "#475569" }}>{sched.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saved Plans History in PostgreSQL */}
      {savedPlans && savedPlans.length > 0 && (
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <History size={18} color="#15803d" />
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                Saved Farm Fertilizer Plans (PostgreSQL Database)
              </h3>
            </div>
            <span className="location-item-badge">
              {savedPlans.length} Records in DB
            </span>
          </div>

          <div className="saved-plans-grid">
            {savedPlans.map((plan) => (
              <div key={plan.id} className="saved-plan-card">
                <div className="saved-plan-header">
                  <span className="saved-plan-crop">{plan.crop_name}</span>
                  <span className="saved-plan-date">{plan.created_at}</span>
                </div>
                <div className="saved-plan-badges">
                  <span className="saved-plan-badge">{plan.land_area} {plan.area_unit}</span>
                  <span className="saved-plan-badge" style={{ background: "#dcfce7", color: "#166534" }}>₹{plan.estimated_cost?.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem" }}>
                  Urea: <strong>{plan.urea_bags} bags</strong> • DAP: <strong>{plan.dap_bags} bags</strong> • MOP: <strong>{plan.mop_bags} bags</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
