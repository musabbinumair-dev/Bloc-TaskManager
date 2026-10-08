import { useState, useEffect } from "react";
import { useAuth, Workspace } from "@/lib/auth-context";
import { useToastNotification } from "@/components/ToastContainer";
import {
  FolderKanban,
  PlusSquare,
  Users,
  Copy,
  Check,
  Mail,
  Link as LinkIcon,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  CheckCircle2,
} from "@/lib/icons";

export default function OnboardingPage({ onComplete }: { onComplete: () => void }) {
  const { user, createWorkspace, joinWorkspace, createInvite, refreshWorkspace } = useAuth();
  const { showToast } = useToastNotification();

  const [step, setStep] = useState<"choose" | "invite">("choose");
  const [mode, setMode] = useState<"create" | "join">("create");

  // Create Workspace Form
  const [wsName, setWsName] = useState("");
  const [wsCategory, setWsCategory] = useState("Engineering");
  const [wsDesc, setWsDesc] = useState("");
  const [createdWs, setCreatedWs] = useState<Workspace | null>(null);

  // Join Workspace Form
  const [joinCode, setJoinCode] = useState("");

  // Invite Form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [invitedList, setInvitedList] = useState<{ email: string; role: string; code: string }[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-fill from URL query param if user arrived via invite link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get("code") || params.get("invite");
    if (codeParam) {
      setMode("join");
      setJoinCode(codeParam.toUpperCase());
    }
  }, []);

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wsName.trim()) {
      showToast("Please enter a workspace name.", "error");
      return;
    }
    setLoading(true);
    const res = await createWorkspace(wsName.trim(), wsCategory, wsDesc.trim());
    setLoading(false);

    if (res.success && res.workspace) {
      setCreatedWs(res.workspace);
      setStep("invite");
      showToast(`Workspace "${res.workspace.name}" created! Now invite your team.`, "success");
    } else {
      showToast(res.error || "Failed to create workspace.", "error");
    }
  }

  async function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) {
      showToast("Please enter the invite code.", "error");
      return;
    }
    setLoading(true);
    const res = await joinWorkspace(joinCode.trim().toUpperCase());
    setLoading(false);

    if (res.success) {
      showToast("Joined workspace successfully! Loading dashboard...", "success");
      onComplete();
    } else {
      showToast(res.error || "Invalid invite code. Please check and try again.", "error");
    }
  }

  async function handleSendEmailInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes("@")) {
      showToast("Please enter a valid teammate email.", "error");
      return;
    }

    const res = await createInvite(inviteEmail, inviteRole);
    if (res.success && res.invite) {
      setInvitedList((prev) => [
        { email: inviteEmail, role: inviteRole, code: res.invite!.code },
        ...prev,
      ]);
      setInviteEmail("");
      showToast(`Invite created for ${inviteEmail}!`, "success");
    } else {
      showToast(res.error || "Failed to generate invite.", "error");
    }
  }

  const inviteCode = createdWs?.inviteCode || "BLOC-XXXX";
  const inviteLink = `${window.location.origin}/join?code=${inviteCode}`;

  function handleCopyCode() {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    showToast("Invite code copied to clipboard!", "info");
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    showToast("Invite link copied to clipboard!", "info");
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 overflow-y-auto"
      style={{
        backgroundColor: "#F5F0E8",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="w-full max-w-[620px] p-6 sm:p-10 my-8"
        style={{
          border: "3px solid #000",
          boxShadow: "8px 8px 0 #000",
          backgroundColor: "#fff",
        }}
      >
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black text-[#FFE600] border-2 border-black flex items-center justify-center font-heading font-black text-sm">
              {step === "choose" ? "1" : "2"}
            </div>
            <div>
              <div className="font-heading font-black text-base text-black tracking-wider">
                {step === "choose" ? "WORKSPACE SETUP" : "INVITE YOUR TEAM"}
              </div>
              <div className="text-[11px] text-gray-600 font-mono">
                HI {user?.name.toUpperCase()}, LET&apos;S GET YOUR TEAM COORDINATED
              </div>
            </div>
          </div>
          <span className="text-[10px] font-heading font-bold bg-[#FFE600] text-black px-2.5 py-1 border border-black">
            {step === "choose" ? "STEP 1 OF 2" : "STEP 2 OF 2"}
          </span>
        </div>

        {/* ── STEP 1: CHOOSE ACTION (CREATE OR JOIN) ── */}
        {step === "choose" && (
          <div>
            {/* Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                type="button"
                onClick={() => setMode("create")}
                className={`p-3 font-heading font-black text-xs border-2 border-black transition-all cursor-pointer ${
                  mode === "create"
                    ? "bg-[#FFE600] text-black shadow-[3px_3px_0_#000]"
                    : "bg-[#F5F0E8] text-gray-700 hover:bg-gray-100"
                }`}
              >
                + CREATE NEW WORKSPACE
              </button>
              <button
                type="button"
                onClick={() => setMode("join")}
                className={`p-3 font-heading font-black text-xs border-2 border-black transition-all cursor-pointer ${
                  mode === "join"
                    ? "bg-[#FFE600] text-black shadow-[3px_3px_0_#000]"
                    : "bg-[#F5F0E8] text-gray-700 hover:bg-gray-100"
                }`}
              >
                🔑 JOIN WITH CODE
              </button>
            </div>

            {/* CREATE FORM */}
            {mode === "create" && (
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block font-heading font-bold text-xs tracking-wider mb-1.5 text-black">
                    WORKSPACE NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={wsName}
                    onChange={(e) => setWsName(e.target.value)}
                    placeholder="e.g. HyperScale Engineering, Studio Apex..."
                    className="w-full p-3 bg-[#F5F0E8] border-2 border-black font-heading font-semibold text-sm outline-none focus:bg-white shadow-[2px_2px_0_#000]"
                  />
                </div>

                <div>
                  <label className="block font-heading font-bold text-xs tracking-wider mb-1.5 text-black">
                    CATEGORY / FOCUS
                  </label>
                  <select
                    value={wsCategory}
                    onChange={(e) => setWsCategory(e.target.value)}
                    className="w-full p-2.5 bg-[#F5F0E8] border-2 border-black font-heading font-semibold text-xs outline-none focus:bg-white"
                  >
                    <option value="Engineering">Engineering & Software</option>
                    <option value="Product Design">Product & UI/UX Design</option>
                    <option value="Startup">Early Stage Startup</option>
                    <option value="Operations">Operations & Infrastructure</option>
                    <option value="Agency">Client Agency / Studio</option>
                    <option value="General">General Task Coordination</option>
                  </select>
                </div>

                <div>
                  <label className="block font-heading font-bold text-xs tracking-wider mb-1.5 text-black">
                    WORKSPACE DESCRIPTION (OPTIONAL)
                  </label>
                  <textarea
                    rows={2}
                    value={wsDesc}
                    onChange={(e) => setWsDesc(e.target.value)}
                    placeholder="What does your team build or ship together?"
                    className="w-full p-2.5 bg-[#F5F0E8] border-2 border-black font-heading font-semibold text-xs outline-none focus:bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-black text-[#FFE600] border-2 border-black font-heading font-black text-xs tracking-wider shadow-[4px_4px_0_#FFE600] cursor-pointer hover:bg-[#FFE600] hover:text-black transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? "INITIALIZING WORKSPACE..." : "CREATE WORKSPACE & INVITE TEAM →"}
                </button>
              </form>
            )}

            {/* JOIN FORM */}
            {mode === "join" && (
              <form onSubmit={handleJoinSubmit} className="space-y-4">
                <div className="p-4 bg-[#F5F0E8] border-2 border-black shadow-[2px_2px_0_#000]">
                  <div className="font-heading font-black text-xs mb-1 text-black">
                    HAVE AN INVITE CODE FROM A TEAMMATE?
                  </div>
                  <div className="text-xs text-gray-600 mb-3">
                    Enter the 6-character code (e.g. BLOC-XXXX) to join your existing team workspace.
                  </div>
                  <input
                    type="text"
                    required
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="BLOC-XXXX"
                    className="w-full p-3 bg-white border-2 border-black font-heading font-black text-lg text-center tracking-widest outline-none shadow-[2px_2px_0_#000]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-black text-[#FFE600] border-2 border-black font-heading font-black text-xs tracking-wider shadow-[4px_4px_0_#FFE600] cursor-pointer hover:bg-[#FFE600] hover:text-black transition-all flex items-center justify-center gap-2"
                >
                  {loading ? "JOINING WORKSPACE..." : "ENTER TEAM WORKSPACE →"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── STEP 2: MULTI-WAY TEAM INVITATION ── */}
        {step === "invite" && (
          <div className="space-y-6">
            <div className="text-xs text-gray-700">
              Your workspace <strong>{createdWs?.name}</strong> is live! Invite your team members using any method below:
            </div>

            {/* METHOD 1: Unique Workspace Code */}
            <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-black text-xs text-black">
                  METHOD 1: WORKSPACE INVITE CODE
                </span>
                <span className="text-[10px] bg-black text-[#FFE600] px-2 py-0.5 font-bold">
                  EASIEST
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mb-3">
                Share this code with teammates. They can enter it during signup or onboarding to join instantly.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white border-2 border-black p-2.5 font-heading font-black text-lg tracking-widest text-center shadow-[1px_1px_0_#000]">
                  {inviteCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-4 py-3 bg-[#FFE600] text-black border-2 border-black font-heading font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0_#000] cursor-pointer hover:bg-yellow-400"
                >
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCode ? "COPIED!" : "COPY CODE"}</span>
                </button>
              </div>
            </div>

            {/* METHOD 2: Shareable URL Link */}
            <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-black text-xs text-black">
                  METHOD 2: SHAREABLE INVITE LINK
                </span>
                <span className="text-[10px] bg-[#0055FF] text-white px-2 py-0.5 font-bold">
                  1-CLICK JOIN
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mb-3">
                Send this direct link to team chats (Slack, Discord, WhatsApp).
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 bg-white border-2 border-black p-2.5 font-mono text-xs overflow-x-auto shadow-[1px_1px_0_#000]"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 bg-black text-[#FFE600] border-2 border-black font-heading font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0_#000] cursor-pointer hover:bg-gray-800"
                >
                  {copiedLink ? <Check size={14} /> : <LinkIcon size={14} />}
                  <span>{copiedLink ? "COPIED!" : "COPY LINK"}</span>
                </button>
              </div>
            </div>

            {/* METHOD 3: Direct Email Invite Pass */}
            <div className="border-2 border-black p-4 bg-[#F5F0E8] shadow-[2px_2px_0_#000]">
              <div className="font-heading font-black text-xs text-black mb-2">
                METHOD 3: SEND DIRECT INVITE PASS
              </div>
              <form onSubmit={handleSendEmailInvite} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="flex-1 p-2 bg-white border-2 border-black font-heading font-semibold text-xs outline-none"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="p-2 bg-white border-2 border-black font-heading font-semibold text-xs outline-none"
                >
                  <option value="member">Role: Member</option>
                  <option value="admin">Role: Admin</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-2 bg-black text-white border-2 border-black font-heading font-bold text-xs cursor-pointer hover:bg-gray-800"
                >
                  + ADD INVITE
                </button>
              </form>

              {invitedList.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-gray-300 pt-2">
                  <div className="text-[10px] font-heading font-bold text-gray-500">
                    PENDING INVITES GENERATED:
                  </div>
                  {invitedList.map((inv, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs bg-white p-2 border border-black"
                    >
                      <span className="font-bold">{inv.email}</span>
                      <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 border border-black font-mono">
                        {inv.role.toUpperCase()} · CODE: {inv.code}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Finish Onboarding Button */}
            <button
              type="button"
              onClick={onComplete}
              className="w-full py-3.5 bg-black text-[#FFE600] border-2 border-black font-heading font-black text-xs tracking-wider shadow-[4px_4px_0_#00CC44] cursor-pointer hover:bg-[#FFE600] hover:text-black transition-all flex items-center justify-center gap-2 mt-4"
            >
              LAUNCH WORKSPACE DASHBOARD →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
