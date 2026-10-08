import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Flame, X } from "@/lib/icons";

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
      <div className="fixed bottom-[74px] md:bottom-6 right-3 md:right-6 left-3 md:left-auto flex flex-col gap-2 z-[9999] pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const accentColor = toast.type === "success" ? "#00CC44" : toast.type === "error" ? "#FF0033" : "#0055FF";
  const ToastIcon = toast.type === "success" ? CheckCircle2 : toast.type === "error" ? AlertTriangle : Flame;

  return (
    <div
      className="toast-slide-in w-full sm:w-auto"
      data-testid={`toast-${toast.id}`}
      style={{
        border: "3px solid #000",
        boxShadow: "4px 4px 0 #000",
        backgroundColor: "#F5F0E8",
        minWidth: "240px",
        maxWidth: "380px",
        display: "flex",
        overflow: "hidden",
        alignItems: "center",
      }}
    >
      <div style={{ width: "5px", alignSelf: "stretch", backgroundColor: accentColor, flexShrink: 0 }} />
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
        <ToastIcon size={16} strokeWidth={2.6} style={{ color: accentColor, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500, color: "#000" }}>{toast.message}</span>
      </div>
      <button
        onClick={onClose}
        style={{
          padding: "10px 12px",
          border: "none",
          borderLeft: "2px solid #000",
          backgroundColor: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={14} strokeWidth={2.6} />
      </button>
    </div>
  );
}
