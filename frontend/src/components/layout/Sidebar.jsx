import React from "react";
import {
  Sprout,
  UserPlus,
  RefreshCw,
  Shield,
  Leaf,
  CloudRain,
  TrendingUp,
  FlaskConical,
  Landmark
} from "lucide-react";

export default function Sidebar({
  activeTab,
  navigateTab,
  registeredFarmer,
  onOpenRegisterModal,
  isAdminAuthenticated,
  diagnosis,
  weather
}) {
  return (
    <aside className="app-sidebar">
      <div>
        {/* Brand header */}
        <div className="sidebar-brand">
          <div className="sidebar-logo-row">
            <div className="sidebar-logo-icon">
              <Sprout size={24} />
            </div>
            <div>
              <div className="sidebar-brand-title">Bharath Krishi</div>
              <span className="sidebar-brand-tag">Digital Public Good</span>
            </div>
          </div>
        </div>

        {/* Registered Farmer Profile Card */}
        {registeredFarmer ? (
          <div className="sidebar-farmer-card">
            <div className="farmer-card-top-row">
              <div className="farmer-avatar-badge">
                {registeredFarmer.name?.charAt(0)?.toUpperCase() || "🌾"}
              </div>
              <div className="farmer-meta">
                <div className="farmer-meta-name">{registeredFarmer.name}</div>
                <div className="farmer-meta-sub">
                  {registeredFarmer.phone_number ? `📞 +91 ${registeredFarmer.phone_number}` : registeredFarmer.language}
                </div>
              </div>
              <button
                type="button"
                className="btn-switch-profile"
                onClick={onOpenRegisterModal}
                title="Switch Profile"
              >
                <RefreshCw size={11} />
                <span>Switch</span>
              </button>
            </div>
            <button
              type="button"
              className="btn-sidebar-new-user"
              onClick={onOpenRegisterModal}
              title="Register another farmer or create a new user profile"
            >
              <UserPlus size={13} />
              <span>Register as New User</span>
            </button>
          </div>
        ) : (
          <div style={{ margin: "0 1rem 0.85rem" }}>
            <button
              type="button"
              className="btn-reg-submit"
              style={{ padding: "0.55rem 0.85rem", fontSize: "0.82rem", width: "100%", margin: 0 }}
              onClick={onOpenRegisterModal}
            >
              <UserPlus size={15} />
              <span>Register as New User</span>
            </button>
          </div>
        )}

        {/* Nav Items */}
        <nav className="sidebar-nav">
          {/* 👑 ADMIN SECTION ON TOP OF SLIDER / SIDEBAR */}
          <button
            type="button"
            className={`nav-item ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => navigateTab("admin")}
            style={{
              borderLeft: activeTab === "admin" ? "3px solid #7c3aed" : "3px solid transparent",
              background: activeTab === "admin" ? "rgba(124, 58, 237, 0.08)" : undefined
            }}
          >
            <Shield size={18} color="#7c3aed" />
            <span style={{ fontWeight: 800 }}>Admin Portal</span>
            <span
              className="nav-item-badge"
              style={{
                color: isAdminAuthenticated ? "#15803d" : "#7c3aed",
                background: isAdminAuthenticated ? "#dcfce7" : "#f3e8ff"
              }}
            >
              {isAdminAuthenticated ? "Online" : "Login Req"}
            </span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === "diagnostics" ? "active" : ""}`}
            onClick={() => navigateTab("diagnostics")}
          >
            <Leaf size={18} />
            <span>Crop Diagnostics</span>
            {diagnosis && <span className="nav-item-badge">Scanned</span>}
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === "weather" ? "active" : ""}`}
            onClick={() => navigateTab("weather")}
          >
            <CloudRain size={18} />
            <span>Weather & Spraying</span>
            {weather && (
              <span className="nav-item-badge" style={{ color: weather.spray_advisory.status === "AVOID" ? "#dc2626" : "#16a34a" }}>
                {weather.spray_advisory.status}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === "mandi" ? "active" : ""}`}
            onClick={() => navigateTab("mandi")}
          >
            <TrendingUp size={18} />
            <span>Nearest Mandi Rates</span>
            <span className="nav-item-badge" style={{ color: "#15803d" }}>Live GPS</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === "fertilizer" ? "active" : ""}`}
            onClick={() => navigateTab("fertilizer")}
          >
            <FlaskConical size={18} />
            <span>Fertilizer & NPK Dosage</span>
            <span className="nav-item-badge" style={{ color: "#2563eb" }}>ICAR POP</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === "schemes" ? "active" : ""}`}
            onClick={() => navigateTab("schemes")}
          >
            <Landmark size={18} />
            <span>Govt Schemes & Subsidies</span>
            <span className="nav-item-badge" style={{ color: "#b45309", background: "#fef3c7" }}>
              ₹ Subsidy
            </span>
          </button>
        </nav>
      </div>

      {/* Sidebar Footer Widget */}
      <div className="sidebar-footer">
        {/* Quick weather glance */}
        {weather && (
          <div
            className="sidebar-weather-glance"
            onClick={() => navigateTab("weather")}
            title="Click to view detailed weather & spray advisory"
          >
            <div className="glance-header">
              <span className="glance-title">
                <CloudRain size={12} /> Spray Status
              </span>
              <span className={`spray-status-badge badge-${weather.spray_advisory.status}`} style={{ fontSize: "0.68rem", padding: "0.15rem 0.4rem" }}>
                {weather.spray_advisory.status}
              </span>
            </div>
            <div className="glance-details">
              <span style={{ fontWeight: 700, color: "#064e3b" }}>
                {weather.current_weather.temperature_c.toFixed(1)}°C
              </span>
              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                {weather.current_weather.weather_condition}
              </span>
            </div>
          </div>
        )}

        {/* System status */}
        <div className="sidebar-status">
          <div className="status-dot" />
          <span>AI Diagnostic & Mandi Engine Online</span>
        </div>
      </div>
    </aside>
  );
}
