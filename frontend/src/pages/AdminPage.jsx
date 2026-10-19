import React, { useState, useMemo } from "react";
import {
  Shield,
  AlertCircle,
  User,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  LogOut,
  UserPlus,
  Users,
  Globe,
  MapPin,
  ShieldCheck,
  Search,
  X,
  CheckCircle2
} from "lucide-react";
import { TOP_10_LANGUAGES } from "../constants";

export default function AdminPage({
  isAdminAuthenticated,
  adminUsername,
  setAdminUsername,
  adminPassword,
  setAdminPassword,
  adminLoginLoading,
  adminLoginError,
  showAdminPassword,
  setShowAdminPassword,
  handleAdminLogin,
  handleAdminLogout,
  adminFarmers,
  adminLoading,
  fetchAdminFarmers,
  onOpenRegisterModal
}) {
  const [adminSearch, setAdminSearch] = useState("");
  const [adminLangFilter, setAdminLangFilter] = useState("ALL");

  // Filtered farmers for Admin Dashboard
  const filteredAdminFarmers = useMemo(() => {
    return adminFarmers.filter((f) => {
      const matchesSearch =
        !adminSearch ||
        (f.name && f.name.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (f.phone_number && f.phone_number.includes(adminSearch)) ||
        (f.city && f.city.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (f.state && f.state.toLowerCase().includes(adminSearch.toLowerCase()));

      const matchesLang =
        adminLangFilter === "ALL" ||
        (f.language && f.language.toLowerCase() === adminLangFilter.toLowerCase());

      return matchesSearch && matchesLang;
    });
  }, [adminFarmers, adminSearch, adminLangFilter]);

  if (!isAdminAuthenticated) {
    return (
      <div className="admin-auth-container">
        <div className="admin-auth-card">
          <div className="admin-auth-header">
            <div className="admin-auth-badge">
              <Shield size={12} /> SECURE GATEWAY • POSTGRESQL VERIFIED
            </div>
            <div className="admin-auth-icon">
              <Shield size={34} color="#7c3aed" />
            </div>
            <h2>Admin Portal Access</h2>
            <p>
              Enter your verified administrator credentials to access the central Farmer Registry and database administrative controls.
            </p>
          </div>

          {adminLoginError && (
            <div className="admin-auth-error">
              <AlertCircle size={18} />
              <span>{adminLoginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="admin-auth-form">
            <div className="admin-form-group">
              <label htmlFor="admin-username">Admin Username</label>
              <div className="admin-input-wrapper">
                <User size={18} className="admin-field-icon" />
                <input
                  id="admin-username"
                  type="text"
                  placeholder="Enter admin username"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-password">Admin Password</label>
              <div className="admin-input-wrapper">
                <Lock size={18} className="admin-field-icon" />
                <input
                  id="admin-password"
                  type={showAdminPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-admin-submit"
              disabled={adminLoginLoading}
            >
              {adminLoginLoading ? (
                <>
                  <RefreshCw size={18} className="spinning" />
                  <span>Verifying Database Credentials...</span>
                </>
              ) : (
                <>
                  <Shield size={18} />
                  <span>Authenticate & Access Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="admin-auth-footer">
            <p>
              🔒 Verified with PostgreSQL Admin Database • Restricted Administrator Access
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-title-group">
          <div className="badge-tag">
            <Shield size={14} /> System Administration • PostgreSQL Registry
          </div>
          <h1>👑 Farmer Registry Admin Dashboard</h1>
          <p>
            Centralized registry of all smallholder farmers registered on Bharath Krishi Platform. Monitor regional language distribution, contact directories, and active agricultural clusters.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <div className="admin-user-badge">
            <User size={14} />
            <span>Logged in: <strong>{adminUsername || "Mehaboob"}</strong> (Superadmin)</span>
          </div>
          <button
            type="button"
            className="btn-refresh-location"
            onClick={fetchAdminFarmers}
            disabled={adminLoading}
          >
            <RefreshCw size={16} className={adminLoading ? "spinning" : ""} />
            <span>{adminLoading ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button
            type="button"
            className="btn-save-plan"
            onClick={onOpenRegisterModal}
            style={{ padding: "0.5rem 0.9rem", fontSize: "0.85rem" }}
          >
            <UserPlus size={16} />
            <span>Register Farmer</span>
          </button>
          <button
            type="button"
            className="btn-admin-logout"
            onClick={handleAdminLogout}
            title="Sign Out of Admin Portal"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "#dcfce7", color: "#15803d" }}>
            <Users size={24} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{adminFarmers.length}</span>
            <span className="admin-stat-label">Total Registered Farmers</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
            <Globe size={24} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">
              {new Set(adminFarmers.map((f) => f.language)).size}
            </span>
            <span className="admin-stat-label">Regional Languages Active</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
            <MapPin size={24} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">
              {new Set(adminFarmers.map((f) => f.state).filter(Boolean)).size || 1}
            </span>
            <span className="admin-stat-label">States / Agronomic Zones</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
            <ShieldCheck size={24} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value" style={{ fontSize: "1.2rem", color: "#166534" }}>Online</span>
            <span className="admin-stat-label">PostgreSQL Agri Database</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrapper">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search farmers by name, phone (+91...), or city..."
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
          />
          {adminSearch && (
            <button
              type="button"
              onClick={() => setAdminSearch("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Language Filter Chips */}
        <div className="admin-lang-chips">
          <button
            type="button"
            className={`admin-chip ${adminLangFilter === "ALL" ? "active" : ""}`}
            onClick={() => setAdminLangFilter("ALL")}
          >
            All ({adminFarmers.length})
          </button>
          {TOP_10_LANGUAGES.map((lang) => {
            const count = adminFarmers.filter(
              (f) => f.language && f.language.toLowerCase() === lang.code.toLowerCase()
            ).length;
            if (count === 0 && adminLangFilter !== lang.code) return null;
            return (
              <button
                key={lang.code}
                type="button"
                className={`admin-chip ${adminLangFilter === lang.code ? "active" : ""}`}
                onClick={() => setAdminLangFilter(lang.code)}
              >
                {lang.native} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Card */}
      <div className="admin-table-card">
        {adminLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
            <RefreshCw size={32} className="spinning" style={{ margin: "0 auto 1rem", color: "#15803d" }} />
            <div>Loading Registered Farmers from PostgreSQL...</div>
          </div>
        ) : filteredAdminFarmers.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
            <Users size={40} style={{ margin: "0 auto 0.75rem", color: "#94a3b8" }} />
            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>No Farmers Found</div>
            <p style={{ margin: "0.25rem 0 1rem", fontSize: "0.85rem" }}>
              {adminSearch || adminLangFilter !== "ALL"
                ? "No farmers match the current search or language filter."
                : "No farmers registered in the system yet."}
            </p>
            {(adminSearch || adminLangFilter !== "ALL") && (
              <button
                type="button"
                className="btn-location-item"
                onClick={() => {
                  setAdminSearch("");
                  setAdminLangFilter("ALL");
                }}
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Farmer Full Name</th>
                  <th>Mobile Contact</th>
                  <th>Chosen Language</th>
                  <th>Location (City, State)</th>
                  <th>Registered Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdminFarmers.map((f, index) => (
                  <tr key={f.id || index}>
                    <td style={{ color: "#94a3b8", fontWeight: 700 }}>{index + 1}</td>
                    <td>
                      <div className="farmer-table-name">
                        <div className="farmer-table-avatar">
                          {f.name?.charAt(0)?.toUpperCase() || "F"}
                        </div>
                        <div>
                          <strong style={{ color: "#0f172a" }}>{f.name}</strong>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                            ID: {f.id ? f.id.slice(0, 8) : "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {f.phone_number ? (
                        <span style={{ fontWeight: 700, color: "#15803d" }}>
                          +91 {f.phone_number}
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.82rem" }}>
                          Not provided (Optional)
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="badge-farmer-lang">
                        <Globe size={12} /> {f.language}
                      </span>
                    </td>
                    <td>
                      <div style={{ color: "#0f172a", fontWeight: 600 }}>
                        {f.city || "—"}, {f.state || "—"}
                      </div>
                      {f.latitude != null && f.longitude != null && (
                        <div style={{ fontSize: "0.72rem", color: "#15803d", display: "flex", alignItems: "center", gap: "0.2rem", marginTop: "0.15rem" }}>
                          <MapPin size={10} /> {Number(f.latitude).toFixed(2)}°N, {Number(f.longitude).toFixed(2)}°E
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                        {f.created_at || "Just now"}
                      </span>
                    </td>
                    <td>
                      <span className="badge-verified-farmer">
                        <CheckCircle2 size={12} /> Registered Farmer
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
