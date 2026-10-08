import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTaskContext } from "@/lib/task-context";
import { getOwnerStyle, getOwnerBg, getOwnerTextColor } from "@/lib/helpers";

const NAV_ITEMS = [
  {
    section: "MY WORKSPACE", items: [
      { href: "/", label: "DASHBOARD", icon: "▣" },
      { href: "/add", label: "ADD TASK", icon: "＋" },
    ]
  },
  {
    section: "TRACKS", items: [
      { href: "/track/musab", label: "MUSAB'S TRACK", icon: "◎", owner: "Musab" as const },
      { href: "/track/yusha", label: "YUSHA'S TRACK", icon: "◎", owner: "Yusha" as const },
      { href: "/track/shared", label: "SHARED TRACK", icon: "◎", owner: "Shared" as const },
    ]
  },
  {
    section: "VIEWS", items: [
      { href: "/all", label: "ALL TASKS", icon: "≡" },
      { href: "/in-progress", label: "IN PROGRESS", icon: "▶" },
      { href: "/blocked", label: "BLOCKED", icon: "✕" },
      { href: "/done", label: "DONE", icon: "✓" },
      { href: "/table", label: "TABLE VIEW", icon: "⊞" },
    ]
  },
];

const PAGE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/add": "Add Task",
  "/track/musab": "Musab's Track",
  "/track/yusha": "Yusha's Track",
  "/track/shared": "Shared Track",
  "/all": "All Tasks",
  "/in-progress": "In Progress",
  "/blocked": "Blocked",
  "/done": "Done",
  "/table": "Table View",
};

interface AppShellProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export default function AppShell({ children, onLogout }: AppShellProps) {
  const [location] = useLocation();
  const { state, dispatch } = useTaskContext();

  const musabOpen = state.tasks.filter((t) => t.owner === "Musab" && t.status !== "done").length;
  const yushaOpen = state.tasks.filter((t) => t.owner === "Yusha" && t.status !== "done").length;
  const sharedOpen = state.tasks.filter((t) => t.owner === "Shared" && t.status !== "done").length;

  const getOpenCount = (path: string): number | null => {
    if (path === "/track/musab") return musabOpen;
    if (path === "/track/yusha") return yushaOpen;
    if (path === "/track/shared") return sharedOpen;
    if (path === "/all") return state.tasks.filter((t) => t.status !== "done").length;
    if (path === "/in-progress") return state.tasks.filter((t) => t.status === "progress").length;
    if (path === "/blocked") return state.tasks.filter((t) => t.status === "blocked").length;
    if (path === "/done") return state.tasks.filter((t) => t.status === "done").length;
    return null;
  };

  const getOwnerBadgeColor = (path: string) => {
    if (path === "/blocked") return "#FF0033";
    if (path === "/done") return "#00CC44";
    return "#FFE600";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#F5F0E8", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>
      {/* NAVBAR */}
      <div
        style={{
          height: "64px",
          borderBottom: "3px solid #000",
          backgroundColor: "#F5F0E8",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        {/* Left: Logo + divider + page label */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src="/bloc-favicon.png"
              alt="Bloc"
              style={{
                width: "32px",
                height: "32px",
                objectFit: "contain",
              }}
            />
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: "20px",
                letterSpacing: "0.08em",
                color: "#000",
              }}
            >
              BLOC
            </span>
          </div>
          <div style={{ width: "2px", height: "24px", backgroundColor: "#000" }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "13px", color: "#444", letterSpacing: "0.04em" }}>
            {PAGE_LABELS[location] ?? location.replace("/", "").toUpperCase()}
          </span>
        </div>

        {/* Right: count chips + user chip + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Member chips */}
          {[
            { label: "MUSAB", count: musabOpen, bg: "#FFE600", color: "#000" },
            { label: "YUSHA", count: yushaOpen, bg: "#0055FF", color: "#fff" },
            { label: "SHARED", count: sharedOpen, bg: "#00CC44", color: "#000" },
          ].map((chip) => (
            <div
              key={chip.label}
              data-testid={`chip-${chip.label.toLowerCase()}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                border: "2px solid #000",
                boxShadow: "2px 2px 0 #000",
                backgroundColor: chip.bg,
                color: chip.color,
                padding: "2px 8px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "10px",
              }}
            >
              {chip.label} <span style={{ backgroundColor: chip.color, color: chip.bg, padding: "0 4px", fontWeight: 700, border: "1px solid currentColor" }}>{chip.count}</span>
            </div>
          ))}

          {/* Divider */}
          <div style={{ width: "2px", height: "24px", backgroundColor: "#000" }} />

          {/* User chip */}
          <div
            data-testid="chip-user"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "2px solid #000",
              boxShadow: "2px 2px 0 #000",
              padding: "2px 8px 2px 4px",
              backgroundColor: "#F5F0E8",
              cursor: "pointer",
            }}
            onClick={() => { }}
            title="Logged in user"
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                ...getOwnerStyle(state.currentUser),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "12px",
                border: "2px solid #000",
              }}
            >
              {state.currentUser[0]}
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px" }}>
              {state.currentUser.toUpperCase()}
            </span>
          </div>

          {/* Logout */}
          <button
            data-testid="button-logout"
            onClick={onLogout}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FF0033'; e.currentTarget.style.borderColor = '#FF0033'; e.currentTarget.style.boxShadow = '2px 2px 0 #CC0028'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.borderColor = '#000'; e.currentTarget.style.boxShadow = '2px 2px 0 #000'; }}
            style={{
              border: "2px solid #000",
              boxShadow: "2px 2px 0 #000",
              backgroundColor: "#000",
              color: "#fff",
              padding: "4px 12px",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "11px",
              cursor: "pointer",
              letterSpacing: "0.05em",
              transition: "background-color 0.2s, border-color 0.2s, box-shadow 0.2s",
            }}
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* SIDEBAR */}
        <div
          style={{
            width: "230px",
            borderRight: "3px solid #000",
            backgroundColor: "#F5F0E8",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            overflowY: "auto",
          }}
        >
          {NAV_ITEMS.map((group, groupIndex) => (
            <div key={group.section}>
              <div
                style={{
                  padding: "8px 12px 4px",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  color: "#666",
                }}
              >
                {group.section}
              </div>
              {group.items.map((item) => {
                const isActive = location === item.href;
                const count = getOpenCount(item.href);
                const badgeColor = getOwnerBadgeColor(item.href);
                const ownerItem = item as { owner?: "Musab" | "Yusha" | "Shared" };
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      data-testid={`nav-${item.label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        backgroundColor: isActive ? "#000" : "transparent",
                        color: isActive ? "#fff" : "#000",
                        cursor: "pointer",
                        borderBottom: "1px solid rgba(0,0,0,0.08)",
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: isActive ? 700 : 600,
                        fontSize: "11px",
                        letterSpacing: "0.04em",
                        userSelect: "none",
                      }}
                    >
                      <span style={{ fontSize: "12px" }}>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {count !== null && (
                        <span
                          style={{
                            padding: "1px 6px",
                            backgroundColor: ownerItem.owner ? getOwnerBg(ownerItem.owner) : badgeColor,
                            color: ownerItem.owner
                              ? getOwnerTextColor(ownerItem.owner)
                              : (item.href === "/blocked" ? "#fff" : "#000"),
                            fontWeight: 700,
                            fontSize: "10px",
                            border: "1px solid #000",
                          }}
                        >
                          {count}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
              <div style={{ borderTop: "3px solid #000" }} />
            </div>
          ))}

          {/* Spacer */}
          <div style={{ marginTop: "auto" }} />
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#F5F0E8" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
