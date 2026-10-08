import { useState, useEffect, createContext, useContext, useCallback } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "info" | "error") => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToastNotification() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "info" | "error" = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: "fixed", bottom: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "8px", zIndex: 9999 }}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const accentColor = toast.type === "success" ? "#00CC44" : toast.type === "error" ? "#FF0033" : "#0055FF";

  return (
    <div
      className="toast-slide-in"
      data-testid={`toast-${toast.id}`}
      style={{
        border: "3px solid #000",
        boxShadow: "4px 4px 0 #000",
        backgroundColor: "#F5F0E8",
        minWidth: "280px",
        maxWidth: "380px",
        display: "flex",
        overflow: "hidden",
      }}
    >
      <div style={{ width: "5px", backgroundColor: accentColor, flexShrink: 0 }} />
      <div style={{ padding: "12px 14px", flex: 1, fontFamily: "'Inter', sans-serif", fontSize: "13px" }}>{toast.message}</div>
      <button
        onClick={onClose}
        style={{
          padding: "0 12px",
          border: "none",
          borderLeft: "2px solid #000",
          backgroundColor: "transparent",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "14px",
        }}
      >
        ✕
      </button>
    </div>
  );
}
