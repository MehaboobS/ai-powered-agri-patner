import React from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose, style }) {
  if (!message) return null;

  const renderIcon = () => {
    switch (type) {
      case "error":
        return <AlertTriangle size={18} />;
      case "info":
        return <Info size={18} />;
      case "success":
      default:
        return <CheckCircle2 size={18} />;
    }
  };

  return (
    <div className="reg-toast-banner" style={style}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {renderIcon()}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex" }}
          title="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
