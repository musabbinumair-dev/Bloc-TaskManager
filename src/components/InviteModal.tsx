import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToastNotification } from "@/components/ToastContainer";
import { Copy, Check, Link as LinkIcon, Mail, X, Users, Shield } from "@/lib/icons";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InviteModal({ open, onClose }: InviteModalProps) {
  const { currentWorkspace, createInvite, invites } = useAuth();
  const { showToast } = useToastNotification();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open || !currentWorkspace) return null;

  const inviteCode = currentWorkspace.inviteCode;
  const inviteLink = `${window.location.origin}/join?code=${inviteCode}`;

  function handleCopyCode() {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    showToast("Invite code copied!", "info");
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    showToast("Invite link copied!", "info");
    setTimeout(() => setCopiedLink(false), 2000);
  }

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    setLoading(true);
    const res = await createInvite(email, role);
    setLoading(false);

    if (res.success) {
      showToast(`Invite created for ${email}!`, "success");
      setEmail("");
    } else {
      showToast(res.error || "Failed to create invite.", "error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] p-6 bg-white border-3 border-black shadow-[8px_8px_0_#000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Users size={20} strokeWidth={2.6} />
            <h2 className="font-heading font-black text-base tracking-wider text-black">
              INVITE TEAMMATES TO {currentWorkspace.name.toUpperCase()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 border-2 border-black bg-[#F5F0E8] flex items-center justify-center cursor-pointer hover:bg-[#FFE600]"
          >
            <X size={16} strokeWidth={2.6} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Method 1: Code */}
          <div className="border-2 border-black p-3.5 bg-[#F5F0E8] shadow-[2px_2px_0_#000]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-heading font-bold text-xs text-black">
                WORKSPACE INVITE CODE:
              </span>
              <span className="text-[10px] font-mono bg-black text-[#FFE600] px-2 py-0.5 font-bold">
                INSTANT
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border-2 border-black p-2 font-heading font-black text-base text-center tracking-widest">
                {inviteCode}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3.5 py-2 bg-[#FFE600] text-black border-2 border-black font-heading font-bold text-xs flex items-center gap-1 shadow-[2px_2px_0_#000] cursor-pointer hover:bg-yellow-400"
              >
                {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedCode ? "COPIED" : "COPY CODE"}</span>
              </button>
            </div>
          </div>

          {/* Method 2: Link */}
          <div className="border-2 border-black p-3.5 bg-[#F5F0E8] shadow-[2px_2px_0_#000]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-heading font-bold text-xs text-black">
                SHAREABLE JOIN LINK:
              </span>
              <span className="text-[10px] font-mono bg-[#0055FF] text-white px-2 py-0.5 font-bold">
                URL
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 bg-white border-2 border-black p-2 font-mono text-xs overflow-x-auto"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-black text-[#FFE600] border-2 border-black font-heading font-bold text-xs flex items-center gap-1 shadow-[2px_2px_0_#000] cursor-pointer hover:bg-gray-800"
              >
                {copiedLink ? <Check size={14} /> : <LinkIcon size={14} />}
                <span>{copiedLink ? "COPIED" : "COPY LINK"}</span>
              </button>
            </div>
          </div>

          {/* Method 3: Email Invite */}
          <div className="border-2 border-black p-3.5 bg-[#F5F0E8] shadow-[2px_2px_0_#000]">
            <div className="font-heading font-bold text-xs text-black mb-1.5">
              GENERATE INDIVIDUAL PASS BY EMAIL:
            </div>
            <form onSubmit={handleCreateInvite} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@domain.com"
                className="flex-1 p-2 bg-white border-2 border-black font-heading font-semibold text-xs outline-none"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="p-2 bg-white border-2 border-black font-heading font-semibold text-xs outline-none"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-2 bg-black text-white border-2 border-black font-heading font-bold text-xs cursor-pointer hover:bg-gray-800"
              >
                + ADD
              </button>
            </form>

            {invites.length > 0 && (
              <div className="mt-3 max-h-24 overflow-y-auto space-y-1 border-t border-gray-300 pt-2">
                {invites.slice(0, 4).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between text-[11px] bg-white p-1.5 border border-black">
                    <span className="font-bold">{inv.email || "Open Pass"}</span>
                    <span className="font-mono bg-gray-200 px-1 border border-black text-[10px]">
                      {inv.code}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-black text-[#FFE600] border-2 border-black font-heading font-bold text-xs shadow-[2px_2px_0_#000] cursor-pointer hover:bg-[#FFE600] hover:text-black"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}
