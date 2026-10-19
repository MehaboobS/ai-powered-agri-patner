import React from "react";
import {
  Store,
  UserPlus,
  Mic,
  MicOff,
  Search,
  Volume2,
  VolumeX,
  AlertTriangle,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import LocationCombobox from "../components/common/LocationCombobox";
import { LANGUAGES, POPULAR_CROPS } from "../constants";

export default function MandiPage({
  locations,
  farmerLocation,
  onSelectLocation,
  onUseGps,
  language,
  setLanguage,
  onOpenRegisterModal,
  mandiData,
  mandiLoading,
  mandiError,
  mandiQuery,
  setMandiQuery,
  searchMandiRates,
  isRecording,
  handleToggleVoiceInput,
  isSpeaking,
  handleSpeakMandiReport
}) {
  return (
    <div className="mandi-view-container">
      {/* View Header with City, State Combobox */}
      <div className="weather-hero-top">
        <div>
          <div className="badge-tag">
            <Store size={14} /> Live APMC Mandi Auction Rates • Synced with {farmerLocation.city}, {farmerLocation.state}
          </div>
          <h1 className="weather-view-title">Nearest Mandi Rates & Market Insights</h1>
          <p className="weather-view-subtitle">
            Wholesale prices dynamically calculated for each district's APMC market yard. Speak or type your crops.
          </p>
        </div>

        {/* Controls: City/State Combobox & Language */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <LocationCombobox
            locations={locations}
            currentLocation={farmerLocation}
            onSelectLocation={onSelectLocation}
            onUseGps={onUseGps}
            placeholder="Type City, State..."
          />

          {/* Language Selector for Speech */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <select
              className="select-district"
              value={language}
              onChange={(e) => {
                const newLang = e.target.value;
                setLanguage(newLang);
                searchMandiRates(mandiQuery, newLang, farmerLocation.latitude, farmerLocation.longitude, farmerLocation.city, farmerLocation.state);
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
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
        </div>
      </div>

      {/* Voice & Text Search Box */}
      <div className="mandi-search-card">
        <div className="mandi-input-group">
          {/* Mic Button */}
          <button
            type="button"
            className={`btn-mic ${isRecording ? "btn-mic-recording" : ""}`}
            onClick={handleToggleVoiceInput}
            title={isRecording ? "Listening... click to stop" : `Click to speak crops in ${language}`}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Text input */}
          <input
            type="text"
            className="mandi-input-field"
            placeholder={`Speak or type crops (e.g., 'Tomato and Chilli rates' in ${language})...`}
            value={mandiQuery}
            onChange={(e) => setMandiQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchMandiRates(mandiQuery, language, farmerLocation.latitude, farmerLocation.longitude, farmerLocation.city, farmerLocation.state);
              }
            }}
          />

          {/* Compact Search Button */}
          <button
            type="button"
            className="btn-mandi-search"
            onClick={() => searchMandiRates(mandiQuery, language, farmerLocation.latitude, farmerLocation.longitude, farmerLocation.city, farmerLocation.state)}
            disabled={mandiLoading}
          >
            {mandiLoading ? <div className="spinner" /> : <Search size={15} />} Search
          </button>
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div className="voice-status-banner">
            <div className="status-dot" style={{ background: "#ef4444", boxShadow: "0 0 10px #ef4444" }} />
            <span>Listening in {language}... Speak your list of crops clearly.</span>
          </div>
        )}

        {/* Quick Crop Chips */}
        <div className="quick-crop-chips">
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", alignSelf: "center", marginRight: "0.25rem" }}>
            Quick Search:
          </span>
          {POPULAR_CROPS.map((crop) => (
            <button
              key={crop}
              type="button"
              className="crop-chip-btn"
              onClick={() => {
                setMandiQuery(crop);
                searchMandiRates(crop, language, farmerLocation.latitude, farmerLocation.longitude, farmerLocation.city, farmerLocation.state);
              }}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* Audio Speech Card (Plays spoken summary orally) */}
      {mandiData && mandiData.spoken_summary && (
        <div className="audio-speech-card">
          <div className="audio-speech-content">
            <div className="audio-speech-title">
              <Volume2 size={20} color="#15803d" />
              <span>Orally Spoken Nearest Market Report ({mandiData.language})</span>
            </div>
            <p className="audio-speech-text">
              "{mandiData.spoken_summary}"
            </p>
          </div>

          <button
            type="button"
            className={`btn-speak ${isSpeaking ? "btn-speak-active" : ""}`}
            onClick={handleSpeakMandiReport}
          >
            {isSpeaking ? (
              <>
                <VolumeX size={18} /> Stop Speaking
              </>
            ) : (
              <>
                <Volume2 size={18} /> 🔊 Listen to Report
              </>
            )}
          </button>
        </div>
      )}

      {/* Error banner */}
      {mandiError && (
        <div className="alert-error">
          <AlertTriangle size={18} />
          <span>{mandiError}</span>
        </div>
      )}

      {/* Loading state */}
      {mandiLoading ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          <p style={{ color: "#64748b", fontWeight: 600 }}>Calculating nearest APMC distances and prices...</p>
        </div>
      ) : mandiData && mandiData.items && mandiData.items.length > 0 ? (
        <div className="mandi-cards-grid">
          {mandiData.items.map((item, idx) => (
            <div key={idx} className="mandi-card">
              <div>
                {/* Card header */}
                <div className="mandi-card-header">
                  <div>
                    <div className="mandi-crop-name">{item.crop_name}</div>
                    <div className="mandi-market-name">
                      <Store size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "3px" }} />
                      {item.market_name} • {item.state}
                    </div>
                    {item.distance_km !== null && item.distance_km !== undefined && (
                      <div>
                        <span className="mandi-distance-badge">
                          <MapPin size={11} /> {item.distance_km} km away (Nearest APMC)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Trend pill */}
                  <span className={`trend-badge trend-${item.trend}`}>
                    {item.trend === "Rising" && <TrendingUp size={13} />}
                    {item.trend === "Falling" && <TrendingDown size={13} />}
                    {item.trend === "Stable" && <Minus size={13} />}
                    {item.trend} {item.trend_percentage ? `(${item.trend_percentage > 0 ? "+" : ""}${item.trend_percentage}%)` : ""}
                  </span>
                </div>

                {/* Modal Price Box */}
                <div className="mandi-price-box" style={{ marginTop: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                      Modal / Average Rate
                    </div>
                    <div className="modal-price-val">
                      ₹{item.modal_price.toFixed(1)} <span className="modal-price-unit">{item.unit}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600, textAlign: "right" }}>
                      Price Range
                    </div>
                    <div className="price-range-text">
                      ₹{item.min_price} – ₹{item.max_price} {item.unit}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8", textAlign: "right", marginTop: "2px" }}>
                      Arrivals: {item.arrival_volume}
                    </div>
                  </div>
                </div>
              </div>

              {/* Economic Recommendation */}
              <div className="mandi-recommendation-box">
                <strong>💡 Market Advisory:</strong> {item.recommendation}
              </div>
            </div>
          ))}
        </div>
      ) : !mandiLoading ? (
        <div className="empty-placeholder glass-card">
          <Store className="empty-icon" />
          <p>No commodities found for your query. Tap the mic and speak crop names or choose from the quick search chips.</p>
        </div>
      ) : null}
    </div>
  );
}
