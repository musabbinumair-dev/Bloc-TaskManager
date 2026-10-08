import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTaskContext } from "@/lib/task-context";
import { getOwnerStyle, getOwnerBg, getOwnerTextColor } from "@/lib/helpers";
import { useToastNotification } from "@/components/ToastContainer";
import ConfirmPopup from "@/components/ConfirmPopup";
import {
  auth,
  signOut,
  updatePassword,
  updateEmail,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  dbRef,
  set,
} from "@/lib/firebase";
import {
  loadUserPreferences,
  saveUserPreferences,
  UserPreferences,
} from "@/lib/settings";
import { seedIfEmpty } from "@/lib/seed-data";
import {
  User,
  Users,
  Terminal,
  Palette,
  Shield,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertOctagon,
  LogOut,
  Sliders,
  Download,
  RefreshCw,
  Save,
  Check,
  Activity,
  FolderKanban,
  Table,
  LayoutDashboard,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
} from "@/lib/icons";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useTaskContext();
  const { showToast } = useToastNotification();

  // Settings & Preferences
  const [prefs, setPrefs] = useState<UserPreferences>(loadUserPreferences);
  const [savedBadge, setSavedBadge] = useState(false);

  // Authentication & Security state
  const currentUserAuth = auth.currentUser;
  const currentEmail = currentUserAuth?.email || `${state.currentUser.toLowerCase()}@demo.com`;

  // Email form
  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Profile customization state
  const [roleTitle, setRoleTitle] = useState(
    prefs.customRoleTitle[state.currentUser] ||
      (state.currentUser === "Musab"
        ? "Lead Full-Stack Systems Engineer"
        : "Lead Product & UI/UX Designer")
  );
  const [bioStatus, setBioStatus] = useState(
    prefs.bioStatus[state.currentUser] ||
      (state.currentUser === "Musab"
        ? "Refactoring database sync and core sprint tasks"
        : "Polishing responsive brutalist design and animations")
  );

  // Confirm dialogs
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "workflow" | "data">("profile");

  // Keep local role/bio in sync when user changes
  useEffect(() => {
    setRoleTitle(
      prefs.customRoleTitle[state.currentUser] ||
        (state.currentUser === "Musab"
          ? "Lead Full-Stack Systems Engineer"
          : "Lead Product & UI/UX Designer")
    );
    setBioStatus(
      prefs.bioStatus[state.currentUser] ||
        (state.currentUser === "Musab"
          ? "Refactoring database sync and core sprint tasks"
          : "Polishing responsive brutalist design and animations")
    );
  }, [state.currentUser, prefs]);

  // Tasks statistics for the current user
  const userTasks = state.tasks.filter((t) => t.owner === state.currentUser);
  const totalUserTasks = userTasks.length;
  const inProgressUserTasks = userTasks.filter((t) => t.status === "progress").length;
  const blockedUserTasks = userTasks.filter((t) => t.status === "blocked").length;
  const doneUserTasks = userTasks.filter((t) => t.status === "done").length;
  const completionRate = totalUserTasks > 0 ? Math.round((doneUserTasks / totalUserTasks) * 100) : 0;

  // Handle Preferences update
  function updatePrefs(newP: Partial<UserPreferences>) {
    const updated = { ...prefs, ...newP };
    setPrefs(updated);
    saveUserPreferences(updated);
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  }

  // Save profile info (role title and bio)
  function handleSaveProfileInfo(e: React.FormEvent) {
    e.preventDefault();
    const updatedRoleTitles = {
      ...prefs.customRoleTitle,
      [state.currentUser]: roleTitle.trim(),
    };
    const updatedBioStatuses = {
      ...prefs.bioStatus,
      [state.currentUser]: bioStatus.trim(),
    };
    updatePrefs({
      customRoleTitle: updatedRoleTitles,
      bioStatus: updatedBioStatuses,
    });
    showToast("Profile details updated successfully!", "success");
  }

  // Quick Switch Workspace identity
  function handleSwitchUser(target: "Musab" | "Yusha") {
    if (state.currentUser === target) return;
    dispatch({ type: "SET_CURRENT_USER", payload: target });
    showToast(`Switched workspace identity to ${target}`, "info");
  }

  // Handle Change Email
  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) {
      showToast("Please enter a new email address", "error");
      return;
    }
    if (!newEmail.includes("@") || !newEmail.includes(".")) {
      showToast("Please enter a valid email address", "error");
      return;
    }
    if (!emailCurrentPassword) {
      showToast("Current password is required to verify your identity", "error");
      return;
    }

    setEmailLoading(true);
    try {
      if (currentUserAuth && currentUserAuth.email) {
        // Re-authenticate first
        const credential = EmailAuthProvider.credential(currentUserAuth.email, emailCurrentPassword);
        await reauthenticateWithCredential(currentUserAuth, credential);

        // Try verifyBeforeUpdateEmail or updateEmail
        try {
          if (verifyBeforeUpdateEmail) {
            await verifyBeforeUpdateEmail(currentUserAuth, newEmail.trim());
            showToast(`Verification sent to ${newEmail}! Check inbox to confirm.`, "success");
          } else {
            await updateEmail(currentUserAuth, newEmail.trim());
            showToast("Email address updated successfully!", "success");
          }
        } catch (updateErr: any) {
          // If verifyBeforeUpdateEmail fails, try updateEmail directly
          await updateEmail(currentUserAuth, newEmail.trim());
          showToast("Email address updated successfully!", "success");
        }
      } else {
        showToast("Demo session: Email updated locally to " + newEmail, "success");
      }
      setNewEmail("");
      setEmailCurrentPassword("");
    } catch (err: any) {
      console.error("Email update error:", err);
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        showToast("Incorrect current password. Verification failed.", "error");
      } else if (err.code === "auth/email-already-in-use") {
        showToast("That email address is already in use by another account.", "error");
      } else if (err.code === "auth/requires-recent-login") {
        showToast("Security timeout: Please log out and log back in, then retry.", "error");
      } else {
        showToast(err.message || "Failed to update email. Please try again.", "error");
      }
    } finally {
      setEmailLoading(false);
    }
  }

  // Handle Change Password
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) {
      showToast("Please enter your current password", "error");
      return;
    }
    if (!newPassword) {
      showToast("Please enter a new password", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters long", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New password and confirmation do not match", "error");
      return;
    }

    setPasswordLoading(true);
    try {
      if (currentUserAuth && currentUserAuth.email) {
        // Re-authenticate
        const credential = EmailAuthProvider.credential(currentUserAuth.email, currentPassword);
        await reauthenticateWithCredential(currentUserAuth, credential);

        // Update password
        await updatePassword(currentUserAuth, newPassword);
        showToast("Password changed successfully!", "success");
      } else {
        showToast("Demo session: Password changed successfully!", "success");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Password update error:", err);
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        showToast("Incorrect current password. Verification failed.", "error");
      } else if (err.code === "auth/weak-password") {
        showToast("Password is too weak. Must be at least 6 characters.", "error");
      } else if (err.code === "auth/requires-recent-login") {
        showToast("Security timeout: Please log out and back in to change password.", "error");
      } else {
        showToast(err.message || "Failed to update password. Please try again.", "error");
      }
    } finally {
      setPasswordLoading(false);
    }
  }

  // Handle Send Password Reset Email
  async function handleSendResetEmail() {
    try {
      if (currentEmail) {
        await sendPasswordResetEmail(auth, currentEmail);
        showToast(`Password reset link sent to ${currentEmail}!`, "success");
      }
    } catch (err: any) {
      showToast(err.message || "Could not send reset email. Verify email address.", "error");
    }
  }

  // Export tasks as JSON
  function handleExportTasks() {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.tasks, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `bloc_tasks_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`Exported ${state.tasks.length} tasks to JSON backup!`, "success");
    } catch (err) {
      showToast("Failed to export data", "error");
    }
  }

  // Reset demo tasks in database
  async function handleResetData() {
    try {
      await seedIfEmpty();
      showToast("Workspace re-seeded with default demo data!", "success");
    } catch (e) {
      showToast("Failed to reset workspace data", "error");
    } finally {
      setResetConfirmOpen(false);
    }
  }

  const isMusab = state.currentUser === "Musab";
  const userAccent = isMusab ? "#FFE600" : "#0055FF";
  const userTextColor = isMusab ? "#000" : "#fff";

  return (
    <div className="min-h-full pb-16">
      {/* ── Top Header Banner ── */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 border-b-3 border-black bg-black text-[#FFE600] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div
            style={{
              backgroundColor: userAccent,
              color: userTextColor,
              border: "2px solid #000",
              boxShadow: "2px 2px 0 #FFE600",
            }}
            className="w-10 h-10 flex items-center justify-center font-heading font-black text-lg shrink-0"
          >
            {isMusab ? <Terminal size={22} strokeWidth={2.8} /> : <Palette size={22} strokeWidth={2.8} />}
          </div>
          <div>
            <div className="font-heading font-black text-base sm:text-lg tracking-wider flex items-center gap-2">
              <span>PROFILE & SETTINGS</span>
              {savedBadge && (
                <span className="text-[10px] bg-[#00CC44] text-black px-2 py-0.5 border border-black font-bold animate-pulse">
                  SAVED
                </span>
              )}
            </div>
            <div className="text-xs text-gray-300 font-mono">
              WORKSPACE IDENTITY: <span className="text-white font-bold">{state.currentUser.toUpperCase()}</span> · {currentEmail}
            </div>
          </div>
        </div>

        {/* Quick Nav Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: "profile" as const, label: "PROFILE", icon: User },
            { id: "security" as const, label: "LOGIN & SECURITY", icon: Shield },
            { id: "workflow" as const, label: "WORKFLOW", icon: Sliders },
            { id: "data" as const, label: "DATA BACKUP", icon: Download },
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
        {/* ── TAB 1: PROFILE & IDENTITY ── */}
        {(activeTab === "profile" || activeTab === "workflow") && (
          <section className="border-3 border-black bg-white shadow-[4px_4px_0_#000] p-4 sm:p-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
              <div className="flex items-center gap-2">
                <User size={20} strokeWidth={2.6} className="text-black" />
                <h2 className="font-heading font-black text-base sm:text-lg tracking-wider">
                  WORKSPACE IDENTITY & TRACK
                </h2>
              </div>
              <span className="text-[11px] font-heading font-bold bg-[#F5F0E8] border border-black px-2.5 py-1">
                ACTIVE USER: {state.currentUser.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Avatar & Switcher */}
              <div className="lg:col-span-1 border-2 border-black p-4 bg-[#F5F0E8] flex flex-col items-center text-center shadow-[2px_2px_0_#000]">
                {/* Big Brutalist Avatar */}
                <div
                  style={{
                    backgroundColor: userAccent,
                    color: userTextColor,
                    border: "3px solid #000",
                    boxShadow: "4px 4px 0 #000",
                  }}
                  className="w-24 h-24 flex items-center justify-center font-heading font-black text-4xl mb-3"
                >
                  {state.currentUser[0]}
                </div>

                <div className="font-heading font-black text-xl tracking-wider text-black">
                  {state.currentUser.toUpperCase()}
                </div>
                <div className="text-xs font-semibold text-gray-600 mt-1 mb-4">
                  {roleTitle || "Team Member"}
                </div>

                {/* Identity Quick Switcher */}
                <div className="w-full border-t-2 border-black pt-4">
                  <div className="text-[10px] font-heading font-bold text-gray-600 tracking-wider mb-2">
                    SWITCH WORKSPACE IDENTITY:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSwitchUser("Musab")}
                      className={`py-2 px-3 border-2 border-black font-heading font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0_#000] active:translate-y-0.5 ${
                        isMusab ? "bg-[#FFE600] text-black ring-2 ring-black" : "bg-white text-black hover:bg-gray-100"
                      }`}
                    >
                      <Terminal size={14} strokeWidth={2.6} />
                      MUSAB
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchUser("Yusha")}
                      className={`py-2 px-3 border-2 border-black font-heading font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0_#000] active:translate-y-0.5 ${
                        !isMusab ? "bg-[#0055FF] text-white ring-2 ring-black" : "bg-white text-black hover:bg-gray-100"
                      }`}
                    >
                      <Palette size={14} strokeWidth={2.6} />
                      YUSHA
                    </button>
                  </div>
                </div>

                {/* Direct Track link */}
                <Link
                  href={`/track/${state.currentUser.toLowerCase()}`}
                  className="w-full mt-4 py-2 bg-black text-[#FFE600] border-2 border-black font-heading font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#FFE600] hover:text-black transition-colors shadow-[2px_2px_0_#000]"
                >
                  <FolderKanban size={14} strokeWidth={2.4} />
                  VIEW {state.currentUser.toUpperCase()}&apos;S TRACK →
                </Link>
              </div>

              {/* Right Column: Custom Role Title & Track Quick Stats */}
              <div className="lg:col-span-2 space-y-5">
                {/* Profile Details Form */}
                <form onSubmit={handleSaveProfileInfo} className="space-y-4">
                  <div>
                    <label className="block font-heading font-bold text-xs tracking-wider mb-1.5 text-black">
                      YOUR ROLE / TITLE
                    </label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="e.g. Lead Systems Engineer, UI/UX Designer..."
                      className="w-full p-2.5 bg-white border-2 border-black font-heading font-semibold text-sm outline-none shadow-[2px_2px_0_#000] focus:bg-[#FFFDE6]"
                    />
                  </div>

                  <div>
                    <label className="block font-heading font-bold text-xs tracking-wider mb-1.5 text-black">
                      STATUS / CURRENT FOCUS
                    </label>
                    <textarea
                      rows={2}
                      value={bioStatus}
                      onChange={(e) => setBioStatus(e.target.value)}
                      placeholder="What are you currently focusing on across sprints?"
                      className="w-full p-2.5 bg-white border-2 border-black font-heading font-semibold text-sm outline-none shadow-[2px_2px_0_#000] focus:bg-[#FFFDE6] resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-black text-[#FFE600] border-2 border-black font-heading font-bold text-xs tracking-wider flex items-center gap-2 shadow-[3px_3px_0_#000] cursor-pointer hover:bg-[#FFE600] hover:text-black active:translate-y-0.5 transition-all"
                    >
                      <Save size={14} strokeWidth={2.6} />
                      SAVE PROFILE DETAILS
                    </button>
                  </div>
                </form>

                {/* User Track Statistics Strip */}
                <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000]">
                  <div className="font-heading font-bold text-xs text-black tracking-wider mb-3 flex items-center justify-between">
                    <span>MY WORKSPACE PERFORMANCE SNAPSHOT</span>
                    <span className="text-gray-500 font-mono text-[11px]">{completionRate}% COMPLETED</span>
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

        {/* ── TAB 2: LOGIN & SECURITY SETTINGS ── */}
        {(activeTab === "security" || activeTab === "profile") && (
          <section className="border-3 border-black bg-white shadow-[4px_4px_0_#000] p-4 sm:p-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Shield size={20} strokeWidth={2.6} className="text-black" />
                <h2 className="font-heading font-black text-base sm:text-lg tracking-wider">
                  LOGIN & AUTHENTICATION SETTINGS
                </h2>
              </div>
              <span className="text-[10px] font-mono bg-black text-[#FFE600] px-2 py-0.5 border border-black font-bold">
                FIREBASE AUTH
              </span>
            </div>

            {/* Current Account Card */}
            <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000] mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] font-heading font-bold text-gray-500 tracking-wider">
                  CURRENT AUTHENTICATED EMAIL
                </div>
                <div className="font-heading font-black text-base text-black flex items-center gap-2">
                  <Mail size={16} strokeWidth={2.4} />
                  <span>{currentEmail}</span>
                  <span className="text-[10px] font-heading font-bold bg-[#00CC44] text-black px-2 py-0.5 border border-black">
                    ACTIVE
                  </span>
                </div>
                <div className="text-[11px] font-mono text-gray-600">
                  UID: <span className="font-bold">{currentUserAuth?.uid?.slice(0, 16) || "demo-session-local"}...</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  className="px-3.5 py-2 bg-white text-black border-2 border-black font-heading font-bold text-xs shadow-[2px_2px_0_#000] hover:bg-gray-100 cursor-pointer flex items-center gap-1.5"
                >
                  <KeyRound size={13} strokeWidth={2.4} />
                  SEND RESET LINK
                </button>
                <button
                  type="button"
                  onClick={() => signOut(auth)}
                  className="px-3.5 py-2 bg-[#FF0033] text-white border-2 border-black font-heading font-bold text-xs shadow-[2px_2px_0_#000] hover:bg-[#CC0028] cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut size={13} strokeWidth={2.4} />
                  LOGOUT
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Change Box */}
              <div className="border-2 border-black p-4 bg-white shadow-[2px_2px_0_#000]">
                <div className="flex items-center gap-2 font-heading font-black text-sm tracking-wider border-b-2 border-black pb-2 mb-4 text-black">
                  <Mail size={16} strokeWidth={2.6} />
                  CHANGE EMAIL ADDRESS
                </div>

                <form onSubmit={handleChangeEmail} className="space-y-3">
                  <div>
                    <label className="block font-heading font-bold text-xs tracking-wider mb-1 text-black">
                      NEW EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. musab.new@domain.com"
                      className="w-full p-2.5 bg-[#F5F0E8] border-2 border-black font-heading font-semibold text-xs outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-heading font-bold text-xs tracking-wider mb-1 text-black">
                      CONFIRM CURRENT PASSWORD
                    </label>
                    <input
                      type="password"
                      required
                      value={emailCurrentPassword}
                      onChange={(e) => setEmailCurrentPassword(e.target.value)}
                      placeholder="Enter current password to verify"
                      className="w-full p-2.5 bg-[#F5F0E8] border-2 border-black font-heading font-semibold text-xs outline-none focus:bg-white"
                    />
                  </div>

                  <p className="text-[11px] text-gray-500 leading-tight">
                    Firebase Auth requires your current password to verify identity before updating your email.
                  </p>

                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="w-full py-2.5 bg-[#0055FF] text-white border-2 border-black font-heading font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-[2px_2px_0_#000] cursor-pointer hover:bg-blue-700 active:translate-y-0.5 disabled:opacity-60"
                  >
                    {emailLoading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} strokeWidth={2.4} />}
                    {emailLoading ? "UPDATING EMAIL..." : "UPDATE EMAIL ADDRESS"}
                  </button>
                </form>
              </div>

              {/* Password Change Box */}
              <div className="border-2 border-black p-4 bg-white shadow-[2px_2px_0_#000]">
                <div className="flex items-center gap-2 font-heading font-black text-sm tracking-wider border-b-2 border-black pb-2 mb-4 text-black">
                  <Lock size={16} strokeWidth={2.6} />
                  CHANGE PASSWORD
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
                        placeholder="Current account password"
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
                    {passwordLoading ? <RefreshCw size={14} className="animate-spin" /> : <KeyRound size={14} strokeWidth={2.4} />}
                    {passwordLoading ? "CHANGING PASSWORD..." : "UPDATE PASSWORD"}
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* ── TAB 3: WORKFLOW & DISPLAY PREFERENCES ── */}
        {(activeTab === "workflow" || activeTab === "profile") && (
          <section className="border-3 border-black bg-white shadow-[4px_4px_0_#000] p-4 sm:p-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Sliders size={20} strokeWidth={2.6} className="text-black" />
                <h2 className="font-heading font-black text-base sm:text-lg tracking-wider">
                  WORKSPACE PREFERENCES & BEHAVIOR
                </h2>
              </div>
              <span className="text-[10px] font-heading font-bold bg-[#FFE600] text-black px-2 py-0.5 border border-black">
                CUSTOMIZABLE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Default Landing Page */}
              <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000]">
                <label className="block font-heading font-bold text-xs tracking-wider mb-1.5 text-black">
                  DEFAULT LANDING VIEW
                </label>
                <p className="text-[11px] text-gray-600 mb-2">
                  Choose which view opens automatically when you log into Bloc.
                </p>
                <select
                  value={prefs.defaultLandingView}
                  onChange={(e) => updatePrefs({ defaultLandingView: e.target.value })}
                  className="w-full p-2.5 bg-white border-2 border-black font-heading font-bold text-xs outline-none cursor-pointer"
                >
                  <option value="/">Dashboard (/)</option>
                  <option value={`/track/${state.currentUser.toLowerCase()}`}>
                    My Personal Track (/track/{state.currentUser.toLowerCase()})
                  </option>
                  <option value="/all">All Tasks (/all)</option>
                  <option value="/table">Table View (/table)</option>
                  <option value="/in-progress">In Progress (/in-progress)</option>
                </select>
              </div>

              {/* Overdue Task Highlight */}
              <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000] flex items-center justify-between gap-4">
                <div>
                  <div className="font-heading font-bold text-xs text-black">
                    HIGHLIGHT OVERDUE TASKS
                  </div>
                  <div className="text-[11px] text-gray-600">
                    Blinks red warning badge for past-due tasks on cards and rows.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updatePrefs({ highlightOverdue: !prefs.highlightOverdue })}
                  className={`w-12 h-6 border-2 border-black p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ${
                    prefs.highlightOverdue ? "bg-[#00CC44] justify-end" : "bg-gray-300 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 bg-black border border-black" />
                </button>
              </div>

              {/* Confirm Before Deleting */}
              <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000] flex items-center justify-between gap-4">
                <div>
                  <div className="font-heading font-bold text-xs text-black">
                    CONFIRMATION ON TASK DELETE
                  </div>
                  <div className="text-[11px] text-gray-600">
                    Display brutalist popup modal before permanently removing tasks.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updatePrefs({ confirmDelete: !prefs.confirmDelete })}
                  className={`w-12 h-6 border-2 border-black p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ${
                    prefs.confirmDelete ? "bg-[#00CC44] justify-end" : "bg-gray-300 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 bg-black border border-black" />
                </button>
              </div>

              {/* Show Assigned Tasks Banner */}
              <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000] flex items-center justify-between gap-4">
                <div>
                  <div className="font-heading font-bold text-xs text-black">
                    NEW ASSIGNMENT BANNER
                  </div>
                  <div className="text-[11px] text-gray-600">
                    Show pink notification section for newly delegated tasks.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updatePrefs({ showAssignedBanner: !prefs.showAssignedBanner })}
                  className={`w-12 h-6 border-2 border-black p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ${
                    prefs.showAssignedBanner ? "bg-[#00CC44] justify-end" : "bg-gray-300 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 bg-black border border-black" />
                </button>
              </div>

              {/* Live Worker Presence Indicators */}
              <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000] flex items-center justify-between gap-4">
                <div>
                  <div className="font-heading font-bold text-xs text-black">
                    LIVE ACTIVE WORKER BADGES
                  </div>
                  <div className="text-[11px] text-gray-600">
                    Show animated &quot;Currently on this&quot; presence indicators.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updatePrefs({ showLiveWorkers: !prefs.showLiveWorkers })}
                  className={`w-12 h-6 border-2 border-black p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ${
                    prefs.showLiveWorkers ? "bg-[#00CC44] justify-end" : "bg-gray-300 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 bg-black border border-black" />
                </button>
              </div>

              {/* Sound Feedback */}
              <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {prefs.soundEffects ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  <div>
                    <div className="font-heading font-bold text-xs text-black">
                      AUDIO / SOUND FEEDBACK
                    </div>
                    <div className="text-[11px] text-gray-600">
                      Subtle tactile audio clicks on completions and status toggles.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updatePrefs({ soundEffects: !prefs.soundEffects })}
                  className={`w-12 h-6 border-2 border-black p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ${
                    prefs.soundEffects ? "bg-[#00CC44] justify-end" : "bg-gray-300 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 bg-black border border-black" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── TAB 4: DATA & WORKSPACE BACKUP ── */}
        {(activeTab === "data" || activeTab === "workflow") && (
          <section className="border-3 border-black bg-white shadow-[4px_4px_0_#000] p-4 sm:p-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Download size={20} strokeWidth={2.6} className="text-black" />
                <h2 className="font-heading font-black text-base sm:text-lg tracking-wider">
                  WORKSPACE BACKUP & DATA CONTROLS
                </h2>
              </div>
              <span className="text-[10px] font-mono bg-[#00CC44] text-black px-2 py-0.5 border border-black font-bold">
                {state.tasks.length} TASKS IN DB
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* JSON Backup Export */}
              <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000] flex flex-col justify-between">
                <div>
                  <div className="font-heading font-bold text-sm text-black mb-1 flex items-center gap-1.5">
                    <Download size={15} strokeWidth={2.6} />
                    EXPORT WORKSPACE (JSON)
                  </div>
                  <p className="text-xs text-gray-600 mb-4">
                    Download complete snapshot of all tasks, notes, comments, and timestamps as structured JSON.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportTasks}
                  className="w-full py-2.5 bg-black text-[#FFE600] border-2 border-black font-heading font-bold text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-[#FFE600] hover:text-black cursor-pointer shadow-[2px_2px_0_#000] active:translate-y-0.5"
                >
                  <Download size={14} strokeWidth={2.4} />
                  DOWNLOAD JSON BACKUP
                </button>
              </div>

              {/* Re-seed Default Data */}
              <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000] flex flex-col justify-between">
                <div>
                  <div className="font-heading font-bold text-sm text-black mb-1 flex items-center gap-1.5">
                    <RefreshCw size={15} strokeWidth={2.6} />
                    RESTORE DEFAULT DEMO TASKS
                  </div>
                  <p className="text-xs text-gray-600 mb-4">
                    Re-populate workspace database with default curated team tasks for testing and demonstration.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setResetConfirmOpen(true)}
                  className="w-full py-2.5 bg-[#FF0033] text-white border-2 border-black font-heading font-bold text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-[#CC0028] cursor-pointer shadow-[2px_2px_0_#000] active:translate-y-0.5"
                >
                  <RefreshCw size={14} strokeWidth={2.4} />
                  RESTORE DEMO WORKSPACE
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Confirmation Modal for Data Reset */}
      <ConfirmPopup
        open={resetConfirmOpen}
        title="RESTORE DEMO TASKS?"
        message="This will re-seed the Firebase Realtime Database with default sprint tasks for Musab and Yusha. Any empty state will be populated."
        confirmLabel="RESTORE DEMO DATA"
        onConfirm={handleResetData}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
}
