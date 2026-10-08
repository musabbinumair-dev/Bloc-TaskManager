import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTaskContext } from "@/lib/task-context";
import { getOwnerStyle, getOwnerBg, getOwnerTextColor } from "@/lib/helpers";
import {
  LayoutDashboard,
  PlusSquare,
  User,
  Users,
  Terminal,
  Palette,
  Share2,
  FolderKanban,
  Activity,
  AlertOctagon,
  CheckSquare,
  Table,
  LogOut,
  Menu,
  X,
  Settings,
} from "@/lib/icons";

const NAV_ITEMS = [
  {
    section: "MY WORKSPACE", items: [
      { href: "/", label: "DASHBOARD", icon: LayoutDashboard },
      { href: "/add", label: "ADD TASK", icon: PlusSquare },
      { href: "/profile", label: "PROFILE & SETTINGS", icon: Settings },
    ]
  },
  {
    section: "TRACKS", items: [
      { href: "/track/musab", label: "MUSAB'S TRACK", icon: Terminal, owner: "Musab" as const },
      { href: "/track/yusha", label: "YUSHA'S TRACK", icon: Palette, owner: "Yusha" as const },
      { href: "/track/shared", label: "SHARED TRACK", icon: Users, owner: "Shared" as const },
    ]
  },
  {
    section: "VIEWS", items: [
      { href: "/all", label: "ALL TASKS", icon: FolderKanban },
      { href: "/in-progress", label: "IN PROGRESS", icon: Activity },
      { href: "/blocked", label: "BLOCKED", icon: AlertOctagon },
      { href: "/done", label: "DONE", icon: CheckSquare },
      { href: "/table", label: "TABLE VIEW", icon: Table },
    ]
  },
];

const PAGE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/add": "Add Task",
  "/profile": "Profile & Settings",
  "/settings": "Profile & Settings",
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
  const { state } = useTaskContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const currentTrackPath = `/track/${state.currentUser.toLowerCase()}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#F5F0E8", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>
      {/* NAVBAR */}
      <div
        style={{
          borderBottom: "3px solid #000",
          backgroundColor: "#F5F0E8",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: "8px",
          flexShrink: 0,
        }}
        className="h-14 md:h-16 md:px-4"
      >
        {/* Left: Logo + divider + page label */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
          <Link href="/">
            <div style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <img
                src="/bloc-favicon.png"
                alt="Bloc"
                style={{
                  width: "28px",
                  height: "28px",
                  objectFit: "contain",
                }}
              />
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 800,
                  fontSize: "18px",
                  letterSpacing: "0.08em",
                  color: "#000",
                }}
              >
                BLOC
              </span>
            </div>
          </Link>
          <div style={{ width: "2px", height: "20px", backgroundColor: "#000" }} />
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: "12px",
              color: "#444",
              letterSpacing: "0.04em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {PAGE_LABELS[location] ?? location.replace("/", "").toUpperCase()}
          </span>
        </div>

        {/* Desktop Navbar Actions (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-2">
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
          <Link href="/profile">
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
              className="hover:bg-[#FFE600] transition-colors"
              title="Profile & Workspace Settings"
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
          </Link>

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
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background-color 0.2s, border-color 0.2s, box-shadow 0.2s",
            }}
          >
            <LogOut size={13} strokeWidth={2.5} />
            LOGOUT
          </button>
        </div>

        {/* Mobile Top Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Current User Badge */}
          <Link href="/profile">
            <div
              style={{
                width: "30px",
                height: "30px",
                ...getOwnerStyle(state.currentUser),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                border: "2px solid #000",
                boxShadow: "2px 2px 0 #000",
                cursor: "pointer",
              }}
              title={`Profile & Settings (${state.currentUser})`}
            >
              {state.currentUser[0]}
            </div>
          </Link>

          {/* Hamburger / Menu Toggle Button */}
          <button
            data-testid="button-mobile-menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            style={{
              minWidth: "40px",
              height: "36px",
              padding: "0 8px",
              border: "2px solid #000",
              boxShadow: "2px 2px 0 #000",
              backgroundColor: mobileMenuOpen ? "#FFE600" : "#000",
              color: mobileMenuOpen ? "#000" : "#FFE600",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {mobileMenuOpen ? <X size={18} strokeWidth={2.6} /> : <Menu size={18} strokeWidth={2.6} />}
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* DESKTOP SIDEBAR */}
        <div
          className="hidden md:flex flex-col w-[230px] border-r-[3px] border-black bg-[#F5F0E8] shrink-0 overflow-y-auto"
        >
          {NAV_ITEMS.map((group) => (
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
                const IconComponent = item.icon;
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
                      <IconComponent size={14} strokeWidth={2.4} className="shrink-0" />
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

        {/* MOBILE SLIDE-OVER DRAWER OVERLAY */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/60 flex justify-end"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-[85vw] max-w-[320px] h-full bg-[#F5F0E8] border-l-4 border-black flex flex-col shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="p-3 border-b-3 border-black bg-black text-[#FFE600] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderKanban size={16} strokeWidth={2.5} />
                  <span className="font-heading font-bold text-sm tracking-wider">NAVIGATION</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center border-2 border-[#FFE600] bg-transparent text-[#FFE600] font-bold text-sm cursor-pointer"
                >
                  <X size={16} strokeWidth={2.6} />
                </button>
              </div>

              {/* Mobile Member Stats Strip */}
              <div className="p-3 border-b-2 border-black bg-[#fffdf5]">
                <div className="text-[10px] font-heading font-bold text-gray-500 tracking-wider mb-2">OPEN TASKS BY OWNER</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "MUSAB", count: musabOpen, bg: "#FFE600", color: "#000", href: "/track/musab" },
                    { label: "YUSHA", count: yushaOpen, bg: "#0055FF", color: "#fff", href: "/track/yusha" },
                    { label: "SHARED", count: sharedOpen, bg: "#00CC44", color: "#000", href: "/track/shared" },
                  ].map((chip) => (
                    <Link
                      key={chip.label}
                      href={chip.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="border-2 border-black p-1 text-center font-heading font-bold text-[10px] shadow-[1px_1px_0_#000]"
                      style={{ backgroundColor: chip.bg, color: chip.color }}
                    >
                      <div>{chip.label}</div>
                      <div className="text-xs font-black">{chip.count}</div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 overflow-y-auto">
                {NAV_ITEMS.map((group) => (
                  <div key={group.section} className="border-b-2 border-black">
                    <div className="px-3 pt-3 pb-1 text-[9px] font-heading font-bold text-gray-500 tracking-widest">
                      {group.section}
                    </div>
                    {group.items.map((item) => {
                      const isActive = location === item.href;
                      const count = getOpenCount(item.href);
                      const badgeColor = getOwnerBadgeColor(item.href);
                      const ownerItem = item as { owner?: "Musab" | "Yusha" | "Shared" };
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div
                            className={`flex items-center gap-3 px-3 py-2.5 font-heading text-xs border-b border-black/10 min-h-[44px] cursor-pointer ${
                              isActive ? "bg-black text-[#FFE600] font-bold" : "text-black hover:bg-black/5"
                            }`}
                          >
                            <IconComponent size={15} strokeWidth={2.4} className="shrink-0" />
                            <span className="flex-1 tracking-wider">{item.label}</span>
                            {count !== null && (
                              <span
                                className="px-2 py-0.5 text-[10px] font-bold border border-black"
                                style={{
                                  backgroundColor: ownerItem.owner ? getOwnerBg(ownerItem.owner) : badgeColor,
                                  color: ownerItem.owner
                                    ? getOwnerTextColor(ownerItem.owner)
                                    : (item.href === "/blocked" ? "#fff" : "#000"),
                                }}
                              >
                                {count}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Drawer Footer with User & Logout */}
              <div className="p-3 border-t-3 border-black bg-[#F5F0E8] flex flex-col gap-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 border-2 border-black bg-white shadow-[2px_2px_0_#000] hover:bg-[#FFE600] transition-colors cursor-pointer"
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      ...getOwnerStyle(state.currentUser),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #000",
                    }}
                    className="font-heading font-bold text-xs"
                  >
                    {state.currentUser[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-heading text-gray-500 font-bold">LOGGED IN AS</div>
                    <div className="font-heading font-bold text-xs flex items-center justify-between">
                      <span>{state.currentUser.toUpperCase()}</span>
                      <span className="text-[9px] bg-black text-[#FFE600] px-1.5 py-0.5 border border-black">SETTINGS →</span>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 bg-[#FF0033] text-white border-2 border-black font-heading font-bold text-xs shadow-[3px_3px_0_#000] cursor-pointer active:translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <LogOut size={14} strokeWidth={2.5} />
                  LOGOUT OF BLOC →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <div
          className="flex-1 overflow-y-auto bg-[#F5F0E8] pb-24 md:pb-0"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {children}
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F5F0E8] border-t-3 border-black flex items-center justify-around h-15 shadow-[0_-3px_0_#000]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {[
          { href: "/", label: "HOME", icon: LayoutDashboard },
          { href: "/add", label: "ADD", icon: PlusSquare },
          { href: currentTrackPath, label: "MY TRACK", icon: User },
          { href: "/all", label: "ALL", icon: FolderKanban },
        ].map((tab) => {
          const isActive = location === tab.href;
          const TabIcon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 min-h-[44px] cursor-pointer transition-colors ${
                isActive ? "bg-black text-[#FFE600] font-bold" : "text-black hover:bg-black/5"
              }`}
            >
              <TabIcon size={17} strokeWidth={2.4} />
              <span className="text-[9px] font-heading font-bold tracking-wider leading-none mt-0.5">
                {tab.label}
              </span>
            </Link>
          );
        })}
        {/* Quick Menu Button in bottom nav */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 min-h-[44px] cursor-pointer border-none bg-transparent ${
            mobileMenuOpen ? "bg-black text-[#FFE600] font-bold" : "text-black hover:bg-black/5"
          }`}
        >
          <Menu size={17} strokeWidth={2.4} />
          <span className="text-[9px] font-heading font-bold tracking-wider leading-none mt-0.5">
            MENU
          </span>
        </button>
      </nav>
    </div>
  );
}
