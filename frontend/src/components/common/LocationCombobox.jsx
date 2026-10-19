import React, { useState, useRef, useEffect, useMemo } from "react";
import { Navigation, MapPin, X } from "lucide-react";

/**
 * Search by City or State, filter case-insensitively, allow ONLY 5 dropdown values at a time!
 */
export default function LocationCombobox({
  locations,
  currentLocation,
  onSelectLocation,
  onUseGps,
  placeholder = "Search City, State..."
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(currentLocation?.display_name || "Kolar, Karnataka");
  const containerRef = useRef(null);

  // Sync displayed text when currentLocation updates from GPS or external selection
  const [prevDisplayName, setPrevDisplayName] = useState(currentLocation?.display_name);
  if (currentLocation?.display_name !== prevDisplayName) {
    setPrevDisplayName(currentLocation?.display_name);
    setQuery(currentLocation?.display_name || "");
  }

  // Click-outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter case-insensitively and strictly cap at 5 items at a time
  const filtered = useMemo(() => {
    if (!locations || locations.length === 0) return [];
    const q = (query || "").trim().toLowerCase();

    if (!q) {
      return locations.slice(0, 5); // Default top 5
    }

    const matches = locations.filter((loc) => {
      const cityLower = (loc.city || "").toLowerCase();
      const stateLower = (loc.state || "").toLowerCase();
      const displayLower = (loc.display_name || "").toLowerCase();
      return (
        displayLower.includes(q) ||
        cityLower.includes(q) ||
        stateLower.includes(q)
      );
    });

    // STRICT REQUIREMENT: Allow ONLY 5 dropdown values at a time!
    return matches.slice(0, 5);
  }, [locations, query]);

  return (
    <div className="location-combobox-container" ref={containerRef}>
      <button
        type="button"
        className="btn-gps"
        onClick={onUseGps}
        title="Detect GPS location for nearest market and weather"
      >
        <Navigation size={12} /> My Farm GPS
      </button>

      <div className="location-input-wrapper">
        <MapPin size={14} color="#15803d" style={{ flexShrink: 0 }} />
        <input
          type="text"
          className="location-search-input"
          placeholder={placeholder}
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
        />
        {query && (
          <button
            type="button"
            className="btn-clear-location"
            onClick={() => {
              setQuery("");
              setIsOpen(true);
            }}
            title="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="location-dropdown-menu">
          {filtered.length > 0 ? (
            filtered.map((loc) => (
              <div
                key={loc.id}
                className={`location-dropdown-item ${currentLocation?.id === loc.id ? "selected" : ""}`}
                onClick={() => {
                  setQuery(loc.display_name);
                  setIsOpen(false);
                  onSelectLocation(loc);
                }}
              >
                <div className="location-item-main">
                  <span className="location-item-title">{loc.display_name}</span>
                  <span className="location-item-badge">{loc.state}</span>
                </div>
                {loc.major_crops && loc.major_crops.length > 0 && (
                  <span className="location-item-crops">
                    Key crops: {loc.major_crops.join(", ")}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="location-dropdown-empty">
              No matching City or State found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
