// Base API URL: Automatically normalizes protocol for Render, Docker Nginx, or local development
const rawApiBase = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = rawApiBase
  ? (rawApiBase.startsWith("http") ? rawApiBase : `https://${rawApiBase}`)
  : (import.meta.env.PROD ? "" : "http://localhost:8000");

/**
 * Fetch predefined locations from database
 */
export async function fetchLocations() {
  const res = await fetch(`${API_BASE_URL}/api/locations`);
  if (!res.ok) throw new Error("Failed to load locations.");
  return res.json();
}

/**
 * Fetch micro-climate weather and spray advisory
 */
export async function fetchWeatherAdvisory(lat, lon, language) {
  const res = await fetch(`${API_BASE_URL}/api/weather-advisory?lat=${lat}&lon=${lon}&language=${encodeURIComponent(language || "English")}`);
  if (!res.ok) throw new Error("Unable to retrieve weather advisory.");
  return res.json();
}

/**
 * Search mandi market rates with GPS-nearest calculations
 */
export async function fetchMandiRates({ query, language, city, state, latitude, longitude }) {
  const res = await fetch(`${API_BASE_URL}/api/mandi-rates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: query || undefined,
      language: language,
      city: city,
      state: state,
      latitude: latitude,
      longitude: longitude
    })
  });
  if (!res.ok) throw new Error("Could not retrieve Mandi prices.");
  return res.json();
}

/**
 * Run AI plant disease diagnosis
 */
export async function diagnoseCrop(formData) {
  const res = await fetch(`${API_BASE_URL}/api/diagnose`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Diagnosis failed. Please check backend connection.");
  }
  return res.json();
}

/**
 * Fetch saved fertilizer plans from PostgreSQL
 */
export async function fetchSavedFertilizerPlans() {
  const res = await fetch(`${API_BASE_URL}/api/fertilizer/saved`);
  if (!res.ok) throw new Error("Failed to load saved plans.");
  return res.json();
}

/**
 * Save customized fertilizer plan to PostgreSQL
 */
export async function saveFertilizerPlan(planData) {
  const res = await fetch(`${API_BASE_URL}/api/fertilizer/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(planData)
  });
  if (!res.ok) throw new Error("Failed to save fertilizer plan.");
  return res.json();
}

/**
 * Admin authentication
 */
export async function adminLogin(username, password) {
  const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username.trim(),
      password: password
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Invalid admin credentials.");
  }
  return data;
}

/**
 * Fetch registered farmers for admin dashboard
 */
export async function fetchAdminFarmers() {
  const res = await fetch(`${API_BASE_URL}/api/farmers`);
  if (!res.ok) throw new Error("Failed to load registered farmers.");
  const data = await res.json();
  return data.farmers || [];
}

/**
 * Register a new farmer
 */
export async function registerFarmer(farmerData) {
  const res = await fetch(`${API_BASE_URL}/api/farmers/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(farmerData)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Registration failed. Please try again.");
  }
  return res.json();
}

/**
 * Fetch central government schemes directory
 */
export async function fetchSchemesList() {
  const res = await fetch(`${API_BASE_URL}/api/schemes/list`);
  if (!res.ok) throw new Error("Failed to load government schemes directory.");
  return res.json();
}

/**
 * Evaluate farm eligibility for subsidies and schemes
 */
export async function checkSchemeEligibility({ land_area, area_unit, crop_name, state }) {
  const res = await fetch(`${API_BASE_URL}/api/schemes/check-eligibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      land_area: land_area,
      area_unit: area_unit,
      crop_name: crop_name === "All Crops" ? null : crop_name,
      state: state
    })
  });
  if (!res.ok) throw new Error("Could not evaluate scheme eligibility.");
  return res.json();
}

/**
 * Save/bookmark scheme to farmer profile
 */
export async function saveScheme({ farmer_id, scheme_id }) {
  const res = await fetch(`${API_BASE_URL}/api/schemes/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farmer_id,
      scheme_id
    })
  });
  return res;
}
