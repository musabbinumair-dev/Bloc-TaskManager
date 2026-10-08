import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useTaskContext } from "@/lib/task-context";
import { getOwnerStyle } from "@/lib/helpers";
import { useToastNotification } from "@/components/ToastContainer";
import InviteModal from "@/components/InviteModal";
import {
  User,
  Users,
  Shield,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Sliders,
  Download,
  Save,
  Check,
  FolderKanban,
  Layers,
  Copy,
} from "@/lib/icons";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user, currentWorkspace, currentRole, members, logout, updateProfile } = useAuth();
  const { state } = useTaskContext();
  const { showToast } = useToastNotification();

  const [activeTab, setActiveTab] = useState<"profile" | "workspace" | "security">("profile");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Profile fields
  const [name, setName] = useState(user?.name || "");
  const [roleTitle, setRoleTitle] = useState(user?.roleTitle || "Team Member");
  const [bioStatus, setBioStatus] = useState(user?.bioStatus || "");
  const [profileSaving, setProfileSaving] = useState(false);

  // Security password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setRoleTitle(user.roleTitle || "Team Member");
      setBioStatus(user.bioStatus || "");
    }
  }, [user]);

  // Tasks statistics for the current user
  const userTasks = state.tasks.filter(
    (t) => t.owner.toLowerCase() === (user?.name || "").toLowerCase()
  );
  const totalUserTasks = userTasks.length;
  const inProgressUserTasks = userTasks.filter((t) => t.status === "progress").length;
  const blockedUserTasks = userTasks.filter((t) => t.status === "blocked").length;
  const doneUserTasks = userTasks.filter((t) => t.status === "done").length;
  const completionRate =
    totalUserTasks > 0 ? Math.round((doneUserTasks / totalUserTasks) * 100) : 0;

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Name cannot be empty.", "error");
      return;
    }
    setProfileSaving(true);
    const res = await updateProfile({ name: name.trim(), roleTitle: roleTitle.trim(), bioStatus: bioStatus.trim() });
    setProfileSaving(false);

    if (res.success) {
      showToast("Profile details updated successfully!", "success");
    } else {
      showToast(res.error || "Failed to update profile.", "error");
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) {
      showToast("Please enter your current password.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setPasswordLoading(true);
    const res = await updateProfile({ currentPassword, newPassword });
    setPasswordLoading(false);

    if (res.success) {
      showToast("Password updated successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      showToast(res.error || "Failed to update password.", "error");
    }
  }

  function handleExportTasks() {
    try {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(state.tasks, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `bloc_${currentWorkspace?.name || "tasks"}_backup.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`Exported ${state.tasks.length} tasks to JSON backup!`, "success");
    } catch {
      showToast("Failed to export workspace data", "error");
    }
  }

  function handleCopyInviteCode() {
    if (!currentWorkspace) return;
    navigator.clipboard.writeText(currentWorkspace.inviteCode);
    setCopiedCode(true);
    showToast("Workspace invite code copied!", "info");
    setTimeout(() => setCopiedCode(false), 2000);
  }

  return (
    <div className="min-h-full pb-16">
      {/* ── Header Banner ── */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 border-b-3 border-black bg-black text-[#FFE600] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div
            style={{ ...getOwnerStyle(user?.name || "U") }}
            className="w-10 h-10 flex items-center justify-center font-heading font-black text-lg shrink-0 border-2 border-[#FFE600]"
          >
            {(user?.name || "U")[0]}
          </div>
          <div>
            <div className="font-heading font-black text-base sm:text-lg tracking-wider">
              PROFILE & WORKSPACE SETTINGS
            </div>
            <div className="text-xs text-gray-300 font-mono">
              USER: <span className="text-white font-bold">{user?.name.toUpperCase()}</span> · {user?.email}
            </div>
          </div>
        </div>

        {/* Quick Nav Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: "profile" as const, label: "MY PROFILE", icon: User },
            { id: "workspace" as const, label: "WORKSPACE & TEAM", icon: Layers },
            { id: "security" as const, label: "SECURITY", icon: Shield },
          ].map((tab) => {
            const active = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-heading font-bold text-xs border-2 border-black transition-transform cursor-pointer ${
                  active
                    ? "bg-[#FFE600] text-black shadow-[2px_2px_0_#fff]"
                    : "bg-[#222] text-gray-300 hover:bg-[#333] hover:text-white"
                }`}
              >
                <TabIcon size={13} strokeWidth={2.4} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* ── TAB 1: PROFILE & PERFORMANCE ── */}
        {activeTab === "profile" && (
          <section className="border-3 border-black bg-white shadow-[4px_4px_0_#000] p-4 sm:p-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
              <div className="flex items-center gap-2">
                <User size={20} strokeWidth={2.6} className="text-black" />
                <h2 className="font-heading font-black text-base sm:text-lg tracking-wider">
                  MEMBER PROFILE & ROLE
                </h2>
              </div>
              <span className="text-[11px] font-heading font-bold bg-[#FFE600] text-black border border-black px-2.5 py-1">
                ROLE: {currentRole.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Avatar & Summary */}
              <div className="lg:col-span-1 border-2 border-black p-4 bg-[#F5F0E8] flex flex-col items-center text-center shadow-[2px_2px_0_#000]">
                <div
                  style={{ ...getOwnerStyle(user?.name || "U") }}
                  className="w-20 h-20 flex items-center justify-center font-heading font-black text-3xl mb-3 border-3 border-black shadow-[4px_4px_0_#000]"
                >
                  {(user?.name || "U")[0]}
                </div>

                <div className="font-heading font-black text-lg tracking-wider text-black">
                  {user?.name.toUpperCase()}
                </div>
                <div className="text-xs font-semibold text-gray-600 mt-1 mb-2">
                  {roleTitle || "Team Member"}
                </div>
                <div className="text-[11px] font-mono text-gray-500 mb-4">
                  {user?.email}
                </div>

                <Link
                  href={`/track/${encodeURIComponent(user?.name || "")}`}
                  className="w-full py-2 bg-black text-[#FFE600] border-2 border-black font-heading font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#FFE600] hover:text-black transition-colors shadow-[2px_2px_0_#000]"
                >
                  <FolderKanban size={14} strokeWidth={2.4} />
                  VIEW MY TRACK →
                </Link>
              </div>

              {/* Right Column: Edit Profile Details */}
              <div className="lg:col-span-2 space-y-5">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block font-heading font-bold text-xs tracking-wider mb-1.5 text-black">
                      YOUR FULL NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 bg-white border-2 border-black font-heading font-semibold text-sm outline-none shadow-[2px_2px_0_#000]"
                    />
                  </div>

                  <div>
                    <label className="block font-heading font-bold text-xs tracking-wider mb-1.5 text-black">
                      ROLE / TITLE IN THIS WORKSPACE
                    </label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="e.g. Lead Systems Engineer, UI/UX Designer..."
                      className="w-full p-2.5 bg-white border-2 border-black font-heading font-semibold text-sm outline-none shadow-[2px_2px_0_#000]"
                    />
                  </div>

                  <div>
                    <label className="block font-heading font-bold text-xs tracking-wider mb-1.5 text-black">
                      CURRENT SPRINT FOCUS / STATUS
                    </label>
                    <textarea
                      rows={2}
                      value={bioStatus}
                      onChange={(e) => setBioStatus(e.target.value)}
                      placeholder="What are you primarily focusing on right now?"
                      className="w-full p-2.5 bg-white border-2 border-black font-heading font-semibold text-sm outline-none shadow-[2px_2px_0_#000] resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-5 py-2.5 bg-black text-[#FFE600] border-2 border-black font-heading font-bold text-xs tracking-wider flex items-center gap-2 shadow-[3px_3px_0_#000] cursor-pointer hover:bg-[#FFE600] hover:text-black active:translate-y-0.5 transition-all"
                    >
                      <Save size={14} strokeWidth={2.6} />
                      {profileSaving ? "SAVING..." : "SAVE PROFILE DETAILS"}
                    </button>
                  </div>
                </form>

                {/* Personal Performance Strip */}
                <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000]">
                  <div className="font-heading font-bold text-xs text-black tracking-wider mb-3 flex items-center justify-between">
                    <span>MY WORKSPACE PERFORMANCE</span>
                    <span className="text-gray-600 font-mono text-[11px] font-bold">
                      {completionRate}% COMPLETED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="border-2 border-black p-2 bg-white text-center shadow-[1px_1px_0_#000]">
                      <div className="text-[10px] font-heading font-bold text-gray-500">ASSIGNED</div>
                      <div className="font-heading font-black text-xl text-black">{totalUserTasks}</div>
                    </div>
                    <div className="border-2 border-black p-2 bg-[#0055FF] text-white text-center shadow-[1px_1px_0_#000]">
                      <div className="text-[10px] font-heading font-bold text-blue-100">IN PROGRESS</div>
                      <div className="font-heading font-black text-xl">{inProgressUserTasks}</div>
                    </div>
                    <div className="border-2 border-black p-2 bg-[#FF0033] text-white text-center shadow-[1px_1px_0_#000]">
                      <div className="text-[10px] font-heading font-bold text-red-100">BLOCKED</div>
                      <div className="font-heading font-black text-xl">{blockedUserTasks}</div>
                    </div>
                    <div className="border-2 border-black p-2 bg-[#00CC44] text-black text-center shadow-[1px_1px_0_#000]">
                      <div className="text-[10px] font-heading font-bold text-green-900">COMPLETED</div>
                      <div className="font-heading font-black text-xl">{doneUserTasks}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── TAB 2: WORKSPACE & TEAM ── */}
        {activeTab === "workspace" && (
          <section className="border-3 border-black bg-white shadow-[4px_4px_0_#000] p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <Layers size={20} strokeWidth={2.6} className="text-black" />
                <h2 className="font-heading font-black text-base sm:text-lg tracking-wider">
                  WORKSPACE: {currentWorkspace?.name.toUpperCase()}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#FFE600] text-black border-2 border-black font-heading font-black text-xs shadow-[2px_2px_0_#000] cursor-pointer hover:bg-yellow-400"
              >
                + INVITE TEAM
              </button>
            </div>

            {/* Workspace Credentials Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000]">
                <div className="text-[10px] font-heading font-bold text-gray-600 mb-1">
                  WORKSPACE INVITE CODE:
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-xl tracking-widest text-black bg-white px-3 py-1 border-2 border-black">
                    {currentWorkspace?.inviteCode || "BLOC-XXXX"}
                  </span>
                  <button
                    onClick={handleCopyInviteCode}
                    className="p-2 bg-black text-[#FFE600] border-2 border-black cursor-pointer hover:bg-gray-800"
                    title="Copy Code"
                  >
                    {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-600 mt-2">
                  Teammates can enter this code during onboarding to join immediately.
                </p>
              </div>

              <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000] flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-heading font-bold text-gray-600 mb-1">
                    BACKUP & DATA EXPORT:
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Export all {state.tasks.length} tasks, status logs, and comments as a structured JSON file.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportTasks}
                  className="py-2 bg-black text-[#FFE600] border-2 border-black font-heading font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#FFE600] hover:text-black cursor-pointer shadow-[2px_2px_0_#000]"
                >
                  <Download size={14} />
                  <span>EXPORT WORKSPACE JSON</span>
                </button>
              </div>
            </div>

            {/* Team Members List */}
            <div>
              <div className="font-heading font-black text-sm tracking-wider mb-3 flex items-center justify-between border-b-2 border-black pb-2 text-black">
                <span>ACTIVE TEAM MEMBERS ({members.length})</span>
                <span className="text-xs font-mono text-gray-500">SYNCED REAL-TIME</span>
              </div>

              <div className="space-y-2">
                {members.map((m) => {
                  const mTasks = state.tasks.filter(
                    (t) => t.owner.toLowerCase() === m.name.toLowerCase()
                  );
                  return (
                    <div
                      key={m.userId}
                      className="border-2 border-black p-3 bg-white flex flex-wrap items-center justify-between gap-3 shadow-[1px_1px_0_#000]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          style={{ ...getOwnerStyle(m.name) }}
                          className="w-9 h-9 flex items-center justify-center font-heading font-black text-sm border-2 border-black"
                        >
                          {m.name[0]}
                        </div>
                        <div>
                          <div className="font-heading font-black text-xs text-black">
                            {m.name.toUpperCase()} {m.userId === user?.id && <span className="text-[10px] text-gray-500">(YOU)</span>}
                          </div>
                          <div className="text-[11px] text-gray-600 font-mono">
                            {m.email} · {m.roleTitle || "Member"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-heading font-bold bg-[#F5F0E8] border border-black px-2 py-0.5">
                          {m.role.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-black font-mono">
                          {mTasks.length} tasks
                        </span>
                        <Link
                          href={`/track/${encodeURIComponent(m.name)}`}
                          className="text-xs font-heading font-bold text-[#0055FF] hover:underline"
                        >
                          View Track →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── TAB 3: SECURITY & PASSWORD ── */}
        {activeTab === "security" && (
          <section className="border-3 border-black bg-white shadow-[4px_4px_0_#000] p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <Shield size={20} strokeWidth={2.6} className="text-black" />
                <h2 className="font-heading font-black text-base sm:text-lg tracking-wider">
                  ACCOUNT SECURITY & CREDENTIALS
                </h2>
              </div>
              <span className="text-[10px] font-mono bg-black text-[#FFE600] px-2 py-0.5 border border-black font-bold">
                BCRYPT PROTECTED
              </span>
            </div>

            <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000] flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-heading font-bold text-gray-600">
                  AUTHENTICATED ACCOUNT:
                </div>
                <div className="font-heading font-black text-base text-black flex items-center gap-2 mt-0.5">
                  <Mail size={16} strokeWidth={2.4} />
                  <span>{user?.email}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="px-3.5 py-2 bg-[#FF0033] text-white border-2 border-black font-heading font-bold text-xs shadow-[2px_2px_0_#000] hover:bg-[#CC0028] cursor-pointer flex items-center gap-1.5"
              >
                <LogOut size={13} strokeWidth={2.4} />
                LOGOUT OF BLOC
              </button>
            </div>

            {/* Change Password Form */}
            <div className="max-w-md border-2 border-black p-4 bg-white shadow-[2px_2px_0_#000]">
              <div className="flex items-center gap-2 font-heading font-black text-sm tracking-wider border-b-2 border-black pb-2 mb-4 text-black">
                <Lock size={16} strokeWidth={2.6} />
                UPDATE PASSWORD
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block font-heading font-bold text-xs tracking-wider mb-1 text-black">
                    CURRENT PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full p-2.5 pr-10 bg-[#F5F0E8] border-2 border-black font-heading font-semibold text-xs outline-none focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-heading font-bold text-xs tracking-wider mb-1 text-black">
                    NEW PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full p-2.5 pr-10 bg-[#F5F0E8] border-2 border-black font-heading font-semibold text-xs outline-none focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black cursor-pointer"
                    >
                      {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-heading font-bold text-xs tracking-wider mb-1 text-black">
                    CONFIRM NEW PASSWORD
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full p-2.5 bg-[#F5F0E8] border-2 border-black font-heading font-semibold text-xs outline-none focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-2.5 bg-black text-[#FFE600] border-2 border-black font-heading font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-[2px_2px_0_#000] cursor-pointer hover:bg-[#FFE600] hover:text-black active:translate-y-0.5 disabled:opacity-60"
                >
                  <KeyRound size={14} strokeWidth={2.4} />
                  {passwordLoading ? "UPDATING PASSWORD..." : "UPDATE PASSWORD"}
                </button>
              </form>
            </div>
          </section>
        )}
      </div>

      <InviteModal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} />
    </div>
  );
}
