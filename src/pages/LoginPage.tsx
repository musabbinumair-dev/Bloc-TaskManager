import { useState } from "react";
import { auth, signInWithEmailAndPassword } from "@/lib/firebase";
import { useToastNotification } from "@/components/ToastContainer";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { showToast } = useToastNotification();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const email = username.includes("@") ? username : `${username}@demo.com`;
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      showToast("Wrong email or password. Try again.", "error");
    }
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "radial-gradient(rgba(0,0,0,0.15) 1.5px, transparent 1.5px)",
        backgroundColor: "#F5F0E8",
        backgroundSize: "24px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── Background Stationery Elements ── */}

      {/* 1. Yellow Sticky Note with Pushpin */}
      <div
        className="login-bg-element"
        style={{
          top: "10%",
          left: "7%",
          width: "170px",
          transform: "rotate(-4deg)",
        }}
      >
        {/* Pushpin */}
        <div style={{ position: "absolute", top: "-8px", left: "50%", marginLeft: "-8px", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#FF0033", border: "2px solid #000", zIndex: 1 }}>
          <div style={{ position: "absolute", top: "3px", left: "3px", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.4)" }} />
        </div>
        {/* Note body */}
        <div style={{ backgroundColor: "#FFE600", border: "2px solid #000", boxShadow: "4px 4px 0 #000", padding: "20px 14px 14px", fontFamily: "'Space Grotesk', sans-serif" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.06em", marginBottom: "10px", borderBottom: "1px solid rgba(0,0,0,0.2)", paddingBottom: "6px" }}>TODO</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px" }}>☑</span>
              <span style={{ textDecoration: "line-through", opacity: 0.6 }}>Draft wireframes</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px" }}>☑</span>
              <span style={{ textDecoration: "line-through", opacity: 0.6 }}>Review with team</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px" }}>☐</span>
              <span>Ship to production</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Lined Notepad Page with Paperclip */}
      <div
        className="login-bg-element"
        style={{
          top: "14%",
          right: "8%",
          width: "160px",
          transform: "rotate(3deg)",
        }}
      >
        {/* Paperclip SVG */}
        <svg
          style={{ position: "absolute", top: "-12px", right: "12px", zIndex: 2 }}
          width="24" height="50" viewBox="0 0 24 50" fill="none"
        >
          <path d="M8 4 C8 2, 16 2, 16 4 L16 38 C16 42, 8 42, 8 38 L8 12 C8 10, 12 10, 12 12 L12 34" stroke="#888" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
        {/* Notepad body */}
        <div style={{ backgroundColor: "#fff", border: "2px solid #000", boxShadow: "4px 4px 0 #000", padding: "16px 14px 14px 28px", position: "relative" }}>
          {/* Red margin line */}
          <div style={{ position: "absolute", left: "22px", top: 0, bottom: 0, width: "1px", backgroundColor: "#FF0033", opacity: 0.4 }} />
          {/* Lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.1)", padding: "5px 0", fontSize: "10px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: i < 3 ? "#333" : "transparent" }}>
              {i === 0 ? "Meeting notes" : i === 1 ? "Q3 deadlines" : i === 2 ? "Assign owners" : "."}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Yellow Pencil */}
      <div
        className="login-bg-element"
        style={{
          bottom: "18%",
          left: "6%",
          transform: "rotate(35deg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", height: "14px" }}>
          {/* Eraser */}
          <div style={{ width: "16px", height: "14px", backgroundColor: "#FFB6C1", border: "2px solid #000", borderRight: "none" }} />
          {/* Metal band */}
          <div style={{ width: "10px", height: "14px", backgroundColor: "#C0C0C0", borderTop: "2px solid #000", borderBottom: "2px solid #000" }}>
            <div style={{ marginTop: "3px", width: "100%", height: "2px", backgroundColor: "#999" }} />
            <div style={{ marginTop: "2px", width: "100%", height: "2px", backgroundColor: "#999" }} />
          </div>
          {/* Pencil body */}
          <div style={{ width: "120px", height: "14px", backgroundColor: "#FFE600", borderTop: "2px solid #000", borderBottom: "2px solid #000", display: "flex", alignItems: "center", paddingLeft: "8px" }}>
            <span style={{ fontSize: "6px", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.1em", color: "#000", opacity: 0.5 }}>BLOC №2</span>
          </div>
          {/* Wood tip */}
          <div style={{ width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "14px solid #D2B48C" }} />
          {/* Lead tip */}
          <div style={{ width: 0, height: 0, borderTop: "3px solid transparent", borderBottom: "3px solid transparent", borderLeft: "6px solid #333" }} />
        </div>
      </div>

      {/* 4. Ruler */}
      <div
        className="login-bg-element"
        style={{
          bottom: "25%",
          right: "6%",
          transform: "rotate(-8deg)",
        }}
      >
        <div style={{
          width: "200px", height: "30px",
          backgroundColor: "#FFE600", border: "2px solid #000", boxShadow: "3px 3px 0 #000",
          display: "flex", alignItems: "flex-end", padding: "0 6px",
          position: "relative",
        }}>
          {/* Tick marks */}
          {Array.from({ length: 17 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${6 + i * 11.2}px`,
              bottom: 0,
              width: "1px",
              height: i % 2 === 0 ? "12px" : "7px",
              backgroundColor: "#000",
            }}>
              {i % 2 === 0 && (
                <span style={{ position: "absolute", top: "-12px", left: "-3px", fontSize: "7px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{i / 2}</span>
              )}
            </div>
          ))}
          {/* Label */}
          <span style={{ position: "absolute", right: "8px", top: "4px", fontSize: "5px", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.1em", opacity: 0.5 }}>CM</span>
        </div>
      </div>

      {/* 5. Coffee Mug (top-down view) */}
      <div
        className="login-bg-element"
        style={{
          top: "55%",
          left: "8%",
          transform: "rotate(6deg)",
        }}
      >
        <div style={{ position: "relative", width: "60px", height: "60px" }}>
          {/* Handle */}
          <div style={{
            position: "absolute", right: "-16px", top: "14px",
            width: "18px", height: "30px",
            border: "3px solid #000", borderLeft: "none",
            borderRadius: "0 50% 50% 0",
            backgroundColor: "#FFE600",
          }} />
          {/* Mug outer */}
          <div style={{
            width: "60px", height: "60px", borderRadius: "50%",
            border: "3px solid #000", backgroundColor: "#FFE600",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "3px 3px 0 #000",
            position: "relative", zIndex: 1,
          }}>
            {/* Coffee */}
            <div style={{
              width: "42px", height: "42px", borderRadius: "50%",
              backgroundColor: "#3E2723", border: "2px solid #000",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden",
            }}>
              {/* Shine */}
              <div style={{ position: "absolute", top: "8px", left: "8px", width: "10px", height: "6px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", transform: "rotate(-30deg)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Login Card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          border: "3px solid #000",
          boxShadow: "10px 10px 0 #000",
          backgroundColor: "#F5F0E8",
          padding: "48px 40px",
          width: "420px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", marginBottom: "8px" }}>
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
                fontSize: "32px",
                letterSpacing: "0.08em",
                color: "#000",
              }}
            >
              BLOC
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "#666", letterSpacing: "0.08em", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
            TEAM TASK COORDINATION
          </div>
          <div
            style={{
              borderTop: "3px solid #000",
              marginTop: "20px",
              paddingTop: "16px",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "16px",
              letterSpacing: "0.05em",
              color: "#000",
            }}
          >
            SIGN IN TO YOUR WORKSPACE
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "11px",
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              USERNAME
            </label>
            <input
              data-testid="input-username"
              type="text"
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username..."
              required
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label
              style={{
                display: "block",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "11px",
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              PASSWORD
            </label>
            <input
              data-testid="input-password"
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              required
            />
          </div>

          <button
            data-testid="button-login"
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#000",
              color: "#FFE600",
              border: "3px solid #000",
              boxShadow: "4px 4px 0 #FFE600",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800,
              fontSize: "14px",
              letterSpacing: "0.08em",
              cursor: "pointer",
              transition: "transform 0.1s, box-shadow 0.1s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translate(-2px, -2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "6px 6px 0 #FFE600";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translate(0, 0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "4px 4px 0 #FFE600";
            }}
          >
            ENTER WORKSPACE →
          </button>
        </form>
      </div>
    </div>
  );
}
