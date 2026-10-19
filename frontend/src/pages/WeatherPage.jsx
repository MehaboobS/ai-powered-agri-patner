import React from "react";
import {
  CloudRain,
  UserPlus,
  AlertTriangle,
  Clock,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  ShieldCheck
} from "lucide-react";
import LocationCombobox from "../components/common/LocationCombobox";

export default function WeatherPage({
  locations,
  farmerLocation,
  onSelectLocation,
  onUseGps,
  onOpenRegisterModal,
  weather,
  weatherLoading,
  weatherError
}) {
  return (
    <div className="weather-view-container">
      {/* Header with City, State Combobox */}
      <div className="weather-hero-top">
        <div>
          <div className="badge-tag">
            <CloudRain size={14} /> Micro-Climate • Open-Meteo Integration
          </div>
          <h1 className="weather-view-title">Farm Weather & Spray Advisory</h1>
          <p className="weather-view-subtitle">
            Real-time spray viability windows, rain wash-off risks, and wind drift analysis for smallholders.
          </p>
        </div>

        {/* City, State Searchable Combobox & Register Action */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <LocationCombobox
            locations={locations}
            currentLocation={farmerLocation}
            onSelectLocation={onSelectLocation}
            onUseGps={onUseGps}
            placeholder="Type City, State (e.g. Nashik, MH)..."
          />
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

      {weatherLoading ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          <p style={{ color: "#64748b", fontWeight: 600 }}>Fetching live satellite and station forecast...</p>
        </div>
      ) : weatherError ? (
        <div className="alert-error">
          <AlertTriangle size={18} />
          <span>{weatherError}</span>
        </div>
      ) : weather ? (
        <>
          {/* Hero Spray Viability Banner */}
          <div className={`spray-card spray-card-${weather.spray_advisory.status}`} style={{ padding: "1.75rem" }}>
            <div className="spray-card-head" style={{ marginBottom: "0.75rem" }}>
              <span className={`spray-status-badge badge-${weather.spray_advisory.status}`} style={{ fontSize: "1rem", padding: "0.4rem 1rem" }}>
                {weather.spray_advisory.headline}
              </span>
              <span className="spray-window-time" style={{ fontSize: "0.95rem" }}>
                <Clock size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                {weather.spray_advisory.recommended_window}
              </span>
            </div>
            <p style={{ fontSize: "1rem", color: "#334155", lineHeight: 1.6, marginBottom: "1rem" }}>
              {weather.spray_advisory.advisory_message}
            </p>
            <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
              📍 Location: {farmerLocation.display_name} ({weather.location.latitude.toFixed(2)}°N, {weather.location.longitude.toFixed(2)}°E) • Outlook: {weather.forecast_summary}
            </div>
          </div>

          {/* Big 4 Agro-Weather Metrics */}
          <div className="weather-big-metrics">
            <div className="big-metric-card">
              <div className="big-metric-icon" style={{ background: "#ffedd5", color: "#ea580c" }}>
                <Thermometer size={24} />
              </div>
              <div>
                <div className="big-metric-label">Temperature</div>
                <div className="big-metric-value">{weather.current_weather.temperature_c.toFixed(1)}°C</div>
                <div className="big-metric-hint">{weather.current_weather.temperature_c > 32 ? "High evaporation risk" : "Optimal for uptake"}</div>
              </div>
            </div>

            <div className="big-metric-card">
              <div className="big-metric-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                <Droplets size={24} />
              </div>
              <div>
                <div className="big-metric-label">Relative Humidity</div>
                <div className="big-metric-value">{weather.current_weather.humidity_percent}%</div>
                <div className="big-metric-hint">{weather.current_weather.humidity_percent > 85 ? "High fungal risk" : "Normal droplet drying"}</div>
              </div>
            </div>

            <div className="big-metric-card">
              <div className="big-metric-icon" style={{ background: "#dcfce7", color: "#15803d" }}>
                <Wind size={24} />
              </div>
              <div>
                <div className="big-metric-label">Wind Velocity</div>
                <div className="big-metric-value">{weather.current_weather.wind_speed_kmh.toFixed(1)} km/h</div>
                <div className="big-metric-hint">{weather.current_weather.wind_speed_kmh > 12 ? "Wind drift warning" : "Minimal chemical drift"}</div>
              </div>
            </div>

            <div className="big-metric-card">
              <div className="big-metric-icon" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                <CloudRain size={24} />
              </div>
              <div>
                <div className="big-metric-label">Rain Risk (6h)</div>
                <div className="big-metric-value">{weather.spray_advisory.rain_risk_next_6h_percent}%</div>
                <div className="big-metric-hint">{weather.spray_advisory.rain_risk_next_6h_percent >= 40 ? "Wash-off hazard" : "Safe from rain wash-off"}</div>
              </div>
            </div>
          </div>

          {/* Diurnal / Hourly Spraying Guide */}
          <div className="glass-card" style={{ marginTop: "1rem" }}>
            <h3 className="card-title">
              <Clock size={20} color="#15803d" /> Daily Spray Suitability Timetable
            </h3>
            <div className="hourly-guide-grid">
              <div className="hourly-card" style={{ borderLeft: "4px solid #16a34a" }}>
                <div className="hourly-time">
                  <Sun size={16} color="#eab308" /> Early Morning (6:00 AM – 9:30 AM)
                </div>
                <span className="hourly-badge" style={{ background: "#dcfce7", color: "#166534" }}>
                  ⭐️ Most Recommended
                </span>
                <p className="hourly-desc">
                  Minimal wind turbulence, cool ambient temperatures, and open stomatal apertures allow superior systemic pesticide absorption.
                </p>
              </div>

              <div className="hourly-card" style={{ borderLeft: "4px solid #dc2626" }}>
                <div className="hourly-time">
                  <Sun size={16} color="#ea580c" /> Midday (11:00 AM – 3:30 PM)
                </div>
                <span className="hourly-badge" style={{ background: "#fee2e2", color: "#991b1b" }}>
                  ⛔️ Unfavorable
                </span>
                <p className="hourly-desc">
                  High thermal radiation causes immediate chemical crystallization or evaporation before leaf absorption. Causes leaf scorch (phytotoxicity).
                </p>
              </div>

              <div className="hourly-card" style={{ borderLeft: "4px solid #ca8a04" }}>
                <div className="hourly-time">
                  <Sun size={16} color="#ca8a04" /> Late Afternoon (4:30 PM – 6:30 PM)
                </div>
                <span className="hourly-badge" style={{ background: "#fef9c3", color: "#854d0e" }}>
                  ✓ Secondary Window
                </span>
                <p className="hourly-desc">
                  Temperatures taper off and winds usually calm down. Suitable for contact fungicides and neem oil applications.
                </p>
              </div>
            </div>
          </div>

          {/* Agronomic Best Practices Card */}
          <div className="glass-card" style={{ marginTop: "0.5rem" }}>
            <h3 className="card-title">
              <ShieldCheck size={20} color="#15803d" /> Spray Stewardship & Farmer Safety
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
              <div style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.5 }}>
                <strong>• Nozzle Selection:</strong> Use hollow cone nozzles for contact bio-fungicides and flat fan nozzles for systemic remedies.
              </div>
              <div style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.5 }}>
                <strong>• Water pH:</strong> Ensure clean, neutral pond or borewell water (pH 6.5–7.0) to prevent hydrolytic degradation of active ingredients.
              </div>
              <div style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.5 }}>
                <strong>• Personal Protective Equipment:</strong> Wear a face mask, gloves, and rubber boots when spraying even organic decoctions.
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
