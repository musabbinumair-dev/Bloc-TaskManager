import React from "react";

interface ConfirmPopupProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmPopup({
  open,
  title,
  message,
  confirmLabel = "DELETE",
  cancelLabel = "CANCEL",
  onConfirm,
  onCancel,
}: ConfirmPopupProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          border: "3px solid #000",
          boxShadow: "8px 8px 0 #000",
          backgroundColor: "#F5F0E8",
          padding: "0",
          minWidth: "340px",
          maxWidth: "440px",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#FF0033",
            color: "#fff",
            padding: "12px 16px",
            fontWeight: 700,
            fontSize: "14px",
            letterSpacing: "0.05em",
            borderBottom: "2px solid #000",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "18px" }}>⚠</span>
          {title}
        </div>

        {/* Body */}
        <div style={{ padding: "20px 16px", fontSize: "13px", color: "#333", lineHeight: 1.5 }}>
          {message}
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
            padding: "12px 16px",
            borderTop: "2px solid #000",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "8px 20px",
              border: "2px solid #000",
              backgroundColor: "#F5F0E8",
              color: "#000",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: "3px 3px 0 #000",
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 20px",
              border: "2px solid #000",
              backgroundColor: "#FF0033",
              color: "#fff",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: "3px 3px 0 #000",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
