import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useTaskContext } from "@/lib/task-context";
import { getOwnerStyle } from "@/lib/helpers";
import InviteModal from "@/components/InviteModal";
import {
  LayoutDashboard,
  PlusSquare,
  User,
  Users,
  FolderKanban,
  Activity,
  AlertOctagon,
  CheckSquare,
  Table,
  LogOut,
  Menu,
  X,
  Settings,
  Plus,
  Layers,
  ChevronDown,
} from "@/lib/icons";

interface AppShellProps {
  children: React.ReactNode;
  onLogout: () => void;
  onOpenOnboarding?: () => void;
}

export default function AppShell({ children, onLogout, onOpenOnboarding }: AppShellProps) {
  const [location] = useLocation();
  const { user, currentWorkspace, workspaces, selectWorkspace, members } = useAuth();
  const { state } = useTaskContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);

  const sharedOpen = state.tasks.filter((t) => t.owner.toLowerCase() === "shared" && t.status !== "done").length;
  const myOpen = state.tasks.filter((t) => t.owner.toLowerCase() === (user?.name || "").toLowerCase() && t.status !== "done").length;

  const getOpenCount = (path: string): number | null => {
    if (path === "/all") return state.tasks.filter((t) => t.status !== "done").length;
    if (path === "/in-progress") return state.tasks.filter((t) => t.status === "progress").length;
    if (path === "/blocked") return state.tasks.filter((t) => t.status === "blocked").length;
    if (path === "/done") return state.tasks.filter((t) => t.status === "done").length;
    return null;
  };

  const getPageTitle = (loc: string) => {
    if (loc === "/") return "Dashboard";
    if (loc === "/add") return "Add Task";
    if (loc === "/profile" || loc === "/settings") return "Profile & Workspace";
    if (loc === "/all") return "All Tasks";
    if (loc === "/in-progress") return "In Progress";
    if (loc === "/blocked") return "Blocked";
    if (loc === "/done") return "Done";
    if (loc === "/table") return "Table View";
    if (loc.startsWith("/track/")) {
      const target = decodeURIComponent(loc.replace("/track/", ""));
      return target.toLowerCase() === "shared" ? "Shared Track" : `${target}'s Track`;
    }
    return "Workspace";
  };

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
        className="h-[54px] sm:h-[60px]"
      >
        {/* Mobile Hamburger */}
        <button
          data-testid="button-mobile-menu"
          onClick={() => setMobileMenuOpen(true)}
          className="flex md:hidden items-center justify-center border-2 border-black bg-white cursor-pointer active:translate-y-0.5"
          style={{ width: "36px", height: "36px", flexShrink: 0, boxShadow: "2px 2px 0 #000" }}
          aria-label="Open menu"
        >
          <Menu size={20} strokeWidth={2.4} />
        </button>

        {/* Brand & Workspace Picker */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", textDecoration: "none" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "#000",
                  border: "2px solid #000",
                  boxShadow: "2px 2px 0 #000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img
                  src="/bloc-favicon.png"
                  alt="Bloc"
                  style={{ width: "24px", height: "24px", objectFit: "contain" }}
                />
              </div>
              <span
                className="hidden sm:inline"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 800,
                  fontSize: "19px",
                  letterSpacing: "0.06em",
                  color: "#000",
                }}
              >
                BLOC
              </span>
            </div>
          </Link>

          {/* Workspace Pill / Switcher */}
          {currentWorkspace && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white border-2 border-black font-heading font-black text-xs cursor-pointer shadow-[2px_2px_0_#000] hover:bg-yellow-100"
              >
                <Layers size={13} strokeWidth={2.6} />
                <span className="max-w-[120px] sm:max-w-[160px] truncate">{currentWorkspace.name.toUpperCase()}</span>
                <ChevronDown size={12} strokeWidth={3} />
              </button>

              {wsDropdownOpen && (
                <div
                  className="absolute left-0 top-full mt-1.5 w-60 bg-white border-3 border-black shadow-[4px_4px_0_#000] z-50 p-2"
                  onClick={() => setWsDropdownOpen(false)}
                >
                  <div className="text-[10px] font-heading font-bold text-gray-500 mb-1 px-1">
                    WORKSPACES:
                  </div>
                  {workspaces.map((w) => (
                    <button
                      key={w.workspace.id}
                      onClick={() => selectWorkspace(w.workspace.id)}
                      className={`w-full text-left p-2 font-heading font-bold text-xs flex items-center justify-between border-2 border-black mb-1 cursor-pointer ${
                        w.workspace.id === currentWorkspace.id
                          ? "bg-[#FFE600] text-black"
                          : "bg-[#F5F0E8] hover:bg-white text-black"
                      }`}
                    >
                      <span className="truncate">{w.workspace.name}</span>
                      <span className="text-[9px] uppercase opacity-75">{w.role}</span>
                    </button>
                  ))}

                  {onOpenOnboarding && (
                    <button
                      onClick={onOpenOnboarding}
                      className="w-full mt-2 p-2 bg-black text-[#FFE600] font-heading font-black text-xs border-2 border-black cursor-pointer hover:bg-gray-800 text-center"
                    >
                      + CREATE / JOIN WORKSPACE
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden sm:block" style={{ width: "2px", height: "24px", backgroundColor: "#000", margin: "0 6px" }} />

        {/* Page Title */}
        <div className="hidden sm:flex items-center gap-1.5 flex-1 min-w-0">
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              color: "#333",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {getPageTitle(location)}
          </span>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Invite Team Button */}
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFE600] text-black border-2 border-black font-heading font-black text-xs shadow-[2px_2px_0_#000] cursor-pointer hover:bg-yellow-400 active:translate-y-0.5"
          >
            <Users size={14} strokeWidth={2.6} />
            <span className="hidden sm:inline">INVITE TEAM</span>
          </button>

          {/* User Profile */}
          <Link href="/profile">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                border: "2px solid #000",
                boxShadow: "2px 2px 0 #000",
                padding: "2px 8px 2px 4px",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
              className="hover:bg-[#FFE600] transition-colors"
              title="Profile & Settings"
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  ...getOwnerStyle(user?.name || "U"),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 800,
                  fontSize: "12px",
                  border: "2px solid #000",
                }}
              >
                {(user?.name || "U")[0]}
              </div>
              <span className="hidden md:inline font-heading font-black text-xs text-black">
                {user?.name.toUpperCase()}
              </span>
            </div>
          </Link>

          {/* Logout */}
          <button
            data-testid="button-logout"
            onClick={onLogout}
            className="px-2.5 sm:px-3 py-1.5 bg-black text-white border-2 border-black font-heading font-bold text-xs shadow-[2px_2px_0_#000] cursor-pointer hover:bg-[#FF0033] hover:border-[#FF0033] flex items-center gap-1 transition-colors"
          >
            <LogOut size={13} strokeWidth={2.5} />
            <span className="hidden sm:inline">LOGOUT</span>
          </button>
        </div>
      </div>

      {/* BODY (SIDEBAR + MAIN CONTENT) */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* DESKTOP SIDEBAR */}
        <aside
          className="hidden md:flex flex-col w-[215px] shrink-0 border-r-3 border-black bg-[#F5F0E8] overflow-y-auto"
          style={{ height: "100%" }}
        >
          {/* Quick Add Task button in sidebar */}
          <div className="p-3 border-b-2 border-black">
            <Link
              href="/add"
              className="w-full py-2.5 bg-black text-[#FFE600] border-2 border-black font-heading font-black text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0_#FFE600] hover:bg-[#FFE600] hover:text-black transition-colors"
            >
              <PlusSquare size={15} strokeWidth={2.6} />
              <span>+ ADD TASK</span>
            </Link>
          </div>

          <div className="p-3 space-y-4 flex-1">
            {/* 1. MY WORKSPACE */}
            <div>
              <div className="text-[10px] font-heading font-extrabold text-gray-500 tracking-wider mb-1.5 px-1">
                MY WORKSPACE
              </div>
              <div className="space-y-1">
                <Link
                  href="/"
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 border-2 border-black font-heading font-bold text-xs transition-transform ${
                    location === "/" ? "bg-[#FFE600] shadow-[2px_2px_0_#000] text-black" : "bg-white hover:bg-yellow-50 text-black"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard size={14} strokeWidth={2.4} />
                    <span>DASHBOARD</span>
                  </span>
                </Link>

                <Link
                  href="/profile"
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 border-2 border-black font-heading font-bold text-xs transition-transform ${
                    location === "/profile" || location === "/settings" ? "bg-[#FFE600] shadow-[2px_2px_0_#000] text-black" : "bg-white hover:bg-yellow-50 text-black"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Settings size={14} strokeWidth={2.4} />
                    <span>SETTINGS</span>
                  </span>
                </Link>
              </div>
            </div>

            {/* 2. TRACKS (Dynamic per workspace member) */}
            <div>
              <div className="text-[10px] font-heading font-extrabold text-gray-500 tracking-wider mb-1.5 px-1 flex items-center justify-between">
                <span>TEAM TRACKS</span>
                <span className="text-[9px] font-mono bg-black text-[#FFE600] px-1">{members.length}</span>
              </div>
              <div className="space-y-1">
                {/* My Own Track */}
                {user && (
                  <Link
                    href={`/track/${encodeURIComponent(user.name)}`}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 border-2 border-black font-heading font-bold text-xs transition-transform ${
                      location === `/track/${encodeURIComponent(user.name)}`
                        ? "bg-[#FFE600] shadow-[2px_2px_0_#000] text-black"
                        : "bg-white hover:bg-yellow-50 text-black"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <div
                        style={{ ...getOwnerStyle(user.name), width: "16px", height: "16px", fontSize: "10px", border: "1px solid #000" }}
                        className="flex items-center justify-center shrink-0 font-black"
                      >
                        {user.name[0]}
                      </div>
                      <span className="truncate">MY TRACK</span>
                    </span>
                    <span className="text-[10px] bg-black text-[#FFE600] px-1.5 border border-black font-mono">
                      {myOpen}
                    </span>
                  </Link>
                )}

                {/* Teammates Tracks */}
                {members
                  .filter((m) => m.userId !== user?.id)
                  .map((m, idx) => {
                    const memberOpen = state.tasks.filter((t) => t.owner.toLowerCase() === m.name.toLowerCase() && t.status !== "done").length;
                    const path = `/track/${encodeURIComponent(m.name)}`;
                    const isActive = location === path;
                    return (
                      <Link
                        key={`teammate-track-${m.userId || m.id || "mem"}-${idx}`}
                        href={path}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 border-2 border-black font-heading font-bold text-xs transition-transform ${
                          isActive ? "bg-[#FFE600] shadow-[2px_2px_0_#000] text-black" : "bg-white hover:bg-yellow-50 text-black"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <div
                            style={{ ...getOwnerStyle(m.name), width: "16px", height: "16px", fontSize: "10px", border: "1px solid #000" }}
                            className="flex items-center justify-center shrink-0 font-black"
                          >
                            {m.name[0]}
                          </div>
                          <span className="truncate">{m.name.toUpperCase()}</span>
                        </span>
                        <span className="text-[10px] bg-black text-[#FFE600] px-1.5 border border-black font-mono">
                          {memberOpen}
                        </span>
                      </Link>
                    );
                  })}

                {/* Shared Track */}
                <Link
                  href="/track/shared"
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 border-2 border-black font-heading font-bold text-xs transition-transform ${
                    location === "/track/shared" ? "bg-[#FFE600] shadow-[2px_2px_0_#000] text-black" : "bg-white hover:bg-yellow-50 text-black"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Users size={14} strokeWidth={2.4} />
                    <span>SHARED TRACK</span>
                  </span>
                  <span className="text-[10px] bg-black text-[#FFE600] px-1.5 border border-black font-mono">
                    {sharedOpen}
                  </span>
                </Link>

                {/* Quick Invite Button */}
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(true)}
                  className="w-full mt-1.5 py-1.5 bg-[#F5F0E8] border-2 border-dashed border-black font-heading font-bold text-[11px] text-gray-700 hover:bg-[#FFE600] hover:text-black cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus size={12} strokeWidth={3} />
                  <span>INVITE TEAMMATE</span>
                </button>
              </div>
            </div>

            {/* 3. VIEWS */}
            <div>
              <div className="text-[10px] font-heading font-extrabold text-gray-500 tracking-wider mb-1.5 px-1">
                VIEWS
              </div>
              <div className="space-y-1">
                {[
                  { href: "/all", label: "ALL TASKS", icon: FolderKanban },
                  { href: "/in-progress", label: "IN PROGRESS", icon: Activity },
                  { href: "/blocked", label: "BLOCKED", icon: AlertOctagon },
                  { href: "/done", label: "DONE", icon: CheckSquare },
                  { href: "/table", label: "TABLE VIEW", icon: Table },
                ].map((item) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;
                  const count = getOpenCount(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 border-2 border-black font-heading font-bold text-xs transition-transform ${
                        isActive ? "bg-[#FFE600] shadow-[2px_2px_0_#000] text-black" : "bg-white hover:bg-yellow-50 text-black"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={14} strokeWidth={2.4} />
                        <span>{item.label}</span>
                      </span>
                      {count !== null && (
                        <span className="text-[10px] bg-black text-[#FFE600] px-1.5 border border-black font-mono">
                          {count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: "#F5F0E8" }}>
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="flex md:hidden h-[54px] border-t-3 border-black bg-white shrink-0 items-center justify-around z-30">
        <Link
          href="/"
          className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 ${
            location === "/" ? "bg-[#FFE600] text-black font-bold" : "text-black"
          }`}
        >
          <LayoutDashboard size={18} strokeWidth={2.4} />
          <span className="text-[9px] font-heading font-bold">HOME</span>
        </Link>

        <Link
          href="/add"
          className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 ${
            location === "/add" ? "bg-[#FFE600] text-black font-bold" : "text-black"
          }`}
        >
          <PlusSquare size={18} strokeWidth={2.4} />
          <span className="text-[9px] font-heading font-bold">ADD</span>
        </Link>

        <button
          onClick={() => setInviteModalOpen(true)}
          className="flex-1 h-full flex flex-col items-center justify-center gap-0.5 bg-black text-[#FFE600]"
        >
          <Users size={18} strokeWidth={2.4} />
          <span className="text-[9px] font-heading font-bold">INVITE</span>
        </button>

        <Link
          href="/all"
          className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 ${
            location === "/all" ? "bg-[#FFE600] text-black font-bold" : "text-black"
          }`}
        >
          <FolderKanban size={18} strokeWidth={2.4} />
          <span className="text-[9px] font-heading font-bold">TASKS</span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 ${
            mobileMenuOpen ? "bg-[#FFE600] text-black font-bold" : "text-black"
          }`}
        >
          <Menu size={18} strokeWidth={2.4} />
          <span className="text-[9px] font-heading font-bold">MENU</span>
        </button>
      </nav>

      {/* MOBILE FULL DRAWER */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden bg-black/60"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-4/5 max-w-[280px] h-full bg-[#F5F0E8] border-r-3 border-black p-4 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <span className="font-heading font-black text-sm tracking-wider">
                  {currentWorkspace?.name.toUpperCase()}
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-6 h-6 border-2 border-black bg-white flex items-center justify-center font-bold"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2 bg-white border-2 border-black font-heading font-bold text-xs"
                >
                  DASHBOARD
                </Link>
                <Link
                  href="/add"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2 bg-white border-2 border-black font-heading font-bold text-xs"
                >
                  + ADD TASK
                </Link>
                <Link
                  href="/all"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2 bg-white border-2 border-black font-heading font-bold text-xs"
                >
                  ALL TASKS ({state.tasks.length})
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2 bg-white border-2 border-black font-heading font-bold text-xs"
                >
                  PROFILE & SETTINGS
                </Link>
              </div>

              <div className="border-t-2 border-black pt-3">
                <div className="text-[10px] font-heading font-bold text-gray-600 mb-2">
                  TEAM TRACKS:
                </div>
                {members.map((m, idx) => (
                  <Link
                    key={`mobile-teammate-${m.userId || m.id || "mem"}-${idx}`}
                    href={`/track/${encodeURIComponent(m.name)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block p-1.5 mb-1 bg-white border-2 border-black font-heading font-bold text-xs"
                  >
                    {m.name.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full p-2.5 bg-black text-[#FF0033] border-2 border-black font-heading font-black text-xs text-center"
            >
              LOGOUT
            </button>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <InviteModal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} />
    </div>
  );
}
