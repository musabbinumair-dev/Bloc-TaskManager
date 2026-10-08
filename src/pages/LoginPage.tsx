import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToastNotification } from "@/components/ToastContainer";
import { Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("register");
  
  // Register state
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { showToast } = useToastNotification();

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast("Please enter email and password.", "error");
      return;
    }
    setLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoading(false);

    if (!result.success) {
      showToast(result.error || "Invalid email or password.", "error");
    } else {
      showToast("Welcome back! Signing in...", "success");
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please enter your name.", "error");
      return;
    }
    if (!registerEmail || !registerEmail.includes("@")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    if (registerPassword.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    setLoading(true);
    const result = await register(name, registerEmail, registerPassword);
    setLoading(false);

    if (!result.success) {
      showToast(result.error || "Failed to create account.", "error");
    } else {
      showToast("Account created successfully! Welcome to Bloc.", "success");
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 overflow-y-auto"
      style={{
        position: "relative",
        background: "radial-gradient(rgba(0,0,0,0.15) 1.5px, transparent 1.5px)",
        backgroundColor: "#F5F0E8",
        backgroundSize: "24px 24px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Background Stationery Elements ── */}
      {/* Yellow Sticky Note with Pushpin */}
      <div
        className="hidden md:block login-bg-element"
        style={{
          top: "10%",
          left: "8%",
          width: "170px",
          transform: "rotate(-4deg)",
        }}
      >
        <div style={{ position: "absolute", top: "-8px", left: "50%", marginLeft: "-8px", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#FF0033", border: "2px solid #000", zIndex: 1 }}>
          <div style={{ position: "absolute", top: "3px", left: "3px", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.4)" }} />
        </div>
        <div style={{ backgroundColor: "#FFE600", border: "2px solid #000", boxShadow: "4px 4px 0 #000", padding: "20px 14px 14px", fontFamily: "'Space Grotesk', sans-serif" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.06em", marginBottom: "10px", borderBottom: "1px solid rgba(0,0,0,0.2)", paddingBottom: "6px" }}>WORKFLOW</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>1.</span>
              <span>Create account</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>2.</span>
              <span>Launch workspace</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>3.</span>
              <span>Invite team via code</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lined Notepad Page */}
      <div
        className="hidden lg:block login-bg-element"
        style={{
          top: "14%",
          right: "8%",
          width: "160px",
          transform: "rotate(3deg)",
        }}
      >
        <div style={{ backgroundColor: "#fff", border: "2px solid #000", boxShadow: "4px 4px 0 #000", padding: "16px 14px 14px 28px", position: "relative" }}>
          <div style={{ position: "absolute", left: "22px", top: 0, bottom: 0, width: "1px", backgroundColor: "#FF0033", opacity: 0.4 }} />
          {["Team alignment", "Live workers", "Fast sprint boards", "Zero bloat"].map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.1)", padding: "5px 0", fontSize: "10px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Ruler Element */}
      <div
        className="hidden lg:block login-bg-element"
        style={{
          bottom: "18%",
          right: "6%",
          transform: "rotate(-8deg)",
        }}
      >
        <div style={{
          width: "180px", height: "28px",
          backgroundColor: "#FFE600", border: "2px solid #000", boxShadow: "3px 3px 0 #000",
          display: "flex", alignItems: "flex-end", padding: "0 6px",
          position: "relative",
        }}>
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${6 + i * 11}px`,
              bottom: 0,
              width: "1px",
              height: i % 2 === 0 ? "11px" : "6px",
              backgroundColor: "#000",
            }} />
          ))}
          <span style={{ position: "absolute", right: "8px", top: "4px", fontSize: "6px", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>BLOC</span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div
        className="w-full max-w-[440px] p-6 sm:p-8 my-auto"
        style={{
          position: "relative",
          zIndex: 10,
          border: "3px solid #000",
          boxShadow: "8px 8px 0 #000",
          backgroundColor: "#F5F0E8",
          boxSizing: "border-box",
        }}
      >
        {/* Brand Header */}
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", marginBottom: "6px" }}>
            <img
              src="/bloc-favicon.png"
              alt="Bloc Logo"
              style={{
                width: "36px",
                height: "36px",
                objectFit: "contain",
              }}
            />
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: "30px",
                letterSpacing: "0.08em",
                color: "#000",
              }}
            >
              BLOC
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
            BRUTALIST TEAM WORKSPACE
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", marginBottom: "20px", border: "2px solid #000" }}>
          <button
            type="button"
            onClick={() => setTab("register")}
            style={{
              padding: "10px",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800,
              fontSize: "12px",
              letterSpacing: "0.05em",
              borderRight: "2px solid #000",
              backgroundColor: tab === "register" ? "#FFE600" : "#fff",
              color: "#000",
              cursor: "pointer",
            }}
          >
            CREATE ACCOUNT
          </button>
          <button
            type="button"
            onClick={() => setTab("login")}
            style={{
              padding: "10px",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800,
              fontSize: "12px",
              letterSpacing: "0.05em",
              backgroundColor: tab === "login" ? "#FFE600" : "#fff",
              color: "#000",
              cursor: "pointer",
            }}
          >
            SIGN IN
          </button>
        </div>

        {/* REGISTER FORM */}
        {tab === "register" && (
          <form onSubmit={handleRegisterSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  marginBottom: "4px",
                }}
              >
                YOUR FULL NAME
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full p-2.5 bg-white border-2 border-black font-heading font-semibold text-xs outline-none shadow-[2px_2px_0_#000]"
                />
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  marginBottom: "4px",
                }}
              >
                WORK EMAIL
              </label>
              <input
                type="email"
                required
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="alex@team.com"
                className="w-full p-2.5 bg-white border-2 border-black font-heading font-semibold text-xs outline-none shadow-[2px_2px_0_#000]"
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  marginBottom: "4px",
                }}
              >
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full p-2.5 bg-white border-2 border-black font-heading font-semibold text-xs outline-none shadow-[2px_2px_0_#000]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#000",
                color: "#FFE600",
                border: "2px solid #000",
                boxShadow: "4px 4px 0 #FFE600",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: "13px",
                letterSpacing: "0.06em",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT & ONBOARD →"}
            </button>
          </form>
        )}

        {/* LOGIN FORM */}
        {tab === "login" && (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  marginBottom: "4px",
                }}
              >
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full p-2.5 bg-white border-2 border-black font-heading font-semibold text-xs outline-none shadow-[2px_2px_0_#000]"
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  marginBottom: "4px",
                }}
              >
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full p-2.5 bg-white border-2 border-black font-heading font-semibold text-xs outline-none shadow-[2px_2px_0_#000]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#000",
                color: "#FFE600",
                border: "2px solid #000",
                boxShadow: "4px 4px 0 #FFE600",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: "13px",
                letterSpacing: "0.06em",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {loading ? "SIGNING IN..." : "ENTER WORKSPACE →"}
            </button>
          </form>
        )}

        <div style={{ marginTop: "18px", borderTop: "1px solid #ccc", paddingTop: "12px", fontSize: "11px", color: "#666", textAlign: "center" }}>
          <span className="font-semibold text-black">🔒 Secure Server Auth</span> · Hashed credentials with private team workspaces
        </div>
      </div>
    </div>
  );
}
