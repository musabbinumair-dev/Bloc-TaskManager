import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useTaskContext } from "@/lib/task-context";
import { getOwnerStyle, timeAgo, timeElapsed, getStatusAccentColor } from "@/lib/helpers";
import InviteModal from "@/components/InviteModal";
import {
  LayoutDashboard,
  Trophy,
  X,
  Flame,
  CheckCircle2,
  Check,
  Activity,
  AlertOctagon,
  FolderKanban,
  FlaskConical,
  Clock,
  PlusSquare,
  Users,
  Copy,
  Sparkles,
} from "@/lib/icons";

export default function DashboardPage() {
  const { currentWorkspace, members } = useAuth();
  const { state } = useTaskContext();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const tasks = state.tasks;
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "progress").length;
  const testing = tasks.filter((t) => t.status === "testing").length;
  const blocked = tasks.filter((t) => t.status === "blocked").length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const lastDone = tasks
    .filter((t) => t.status === "done")
    .sort((a, b) => {
      const aTime = a.doneAt ?? a.createdAt;
      const bTime = b.doneAt ?? b.createdAt;
      return bTime - aTime;
    })[0];

  // Dynamic members from workspace
  const teamMemberNames = members.map((m) => m.name);
  const allCardNames = [...teamMemberNames, "Shared"];

  return (
    <div className="p-3 sm:p-5 flex flex-col gap-3 sm:gap-5">
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "10px 14px", border: "3px solid #000", boxShadow: "4px 4px 0 #000", backgroundColor: "#000", color: "#FFE600" }}>
        <div className="flex items-center gap-2.5">
          <LayoutDashboard size={20} strokeWidth={2.6} className="text-[#FFE600] shrink-0" />
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "16px", letterSpacing: "0.05em" }}>
              {currentWorkspace ? `${currentWorkspace.name.toUpperCase()} DASHBOARD` : "TEAM DASHBOARD"}
            </div>
            <div style={{ fontSize: "11px", color: "#FFE600AA" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · {members.length} team members
            </div>
          </div>
        </div>

        <button
          onClick={() => setInviteModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#FFE600] text-black border-2 border-black font-heading font-black text-xs cursor-pointer hover:bg-white"
        >
          <Users size={14} />
          <span>INVITE TEAM</span>
        </button>
      </div>

      {/* Fresh Empty Workspace Callout */}
      {total === 0 && (
        <div
          className="p-5 sm:p-7 border-3 border-black bg-white shadow-[6px_6px_0_#000]"
          style={{ position: "relative" }}
        >
          <div className="max-w-xl">
            <span className="text-[10px] font-heading font-extrabold bg-[#FFE600] text-black px-2 py-0.5 border border-black mb-2 inline-block">
              FRESH WORKSPACE LAUNCHED
            </span>
            <h2 className="font-heading font-black text-xl sm:text-2xl tracking-wide mb-2">
              WELCOME TO {currentWorkspace?.name.toUpperCase()}
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed mb-4">
              Your brutalist coordination hub is active with zero clutter. Add tasks to start tracking sprints, assign owners, or invite teammates via code or link.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/add"
                className="px-4 py-2.5 bg-black text-[#FFE600] border-2 border-black font-heading font-black text-xs flex items-center gap-2 shadow-[2px_2px_0_#FFE600] hover:bg-[#FFE600] hover:text-black cursor-pointer"
              >
                <PlusSquare size={15} strokeWidth={2.6} />
                <span>+ CREATE FIRST TASK</span>
              </Link>
              <button
                type="button"
                onClick={() => setInviteModalOpen(true)}
                className="px-4 py-2.5 bg-[#FFE600] text-black border-2 border-black font-heading font-black text-xs flex items-center gap-2 shadow-[2px_2px_0_#000] hover:bg-yellow-400 cursor-pointer"
              >
                <Users size={15} strokeWidth={2.6} />
                <span>INVITE TEAMMATES</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Last Completed Banner */}
      {lastDone && !bannerDismissed && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-4" style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #FFE600", backgroundColor: "#fffdf5" }}>
          <div className="flex items-center gap-3">
            <div style={{ width: "32px", height: "32px", backgroundColor: "#FFE600", border: "2px solid #000", boxShadow: "2px 2px 0 #000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Trophy size={18} strokeWidth={2.6} color="#000" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "9px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#888", letterSpacing: "0.1em" }}>LATEST COMPLETED TASK</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "13px" }}>{lastDone.title}</div>
              <div style={{ fontSize: "11px", color: "#666" }}>
                Finished by <strong>{lastDone.owner}</strong> · {timeAgo(lastDone.doneAt ?? lastDone.createdAt)}
              </div>
            </div>
            <button
              data-testid="button-dismiss-banner"
              onClick={() => setBannerDismissed(true)}
              className="sm:hidden ml-auto"
              style={{ border: "2px solid #000", backgroundColor: "#F5F0E8", width: "26px", height: "26px", cursor: "pointer", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X size={14} strokeWidth={2.6} />
            </button>
          </div>
          <button
            data-testid="button-dismiss-banner"
            onClick={() => setBannerDismissed(true)}
            className="hidden sm:flex ml-auto items-center justify-center"
            style={{ border: "2px solid #000", backgroundColor: "#F5F0E8", width: "28px", height: "28px", cursor: "pointer", fontWeight: 700 }}
          >
            <X size={14} strokeWidth={2.6} />
          </button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        <StatCard label="TOTAL TASKS" value={total} sub="across all tracks" accentColor="#FFE600" icon={FolderKanban} />
        <StatCard label="COMPLETED" value={done} sub={`${completionRate}% rate`} accentColor="#00CC44" icon={CheckCircle2} />
        <StatCard label="IN PROGRESS" value={inProgress} sub={`${testing} in testing`} accentColor="#0055FF" icon={Activity} />
        <StatCard label="BLOCKED" value={blocked} sub="need attention" accentColor="#FF0033" valueColor="#FF0033" icon={AlertOctagon} />
      </div>

      {/* Overall Progress Bar */}
      <div style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000", backgroundColor: "#F5F0E8", padding: "14px" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.05em" }}>OVERALL WORKSPACE PROGRESS</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "11px", color: "#444" }}>
            {completionRate}% Complete · {done}/{total}
          </div>
        </div>
        {/* Segmented bar */}
        <div style={{ height: "20px", border: "3px solid #000", display: "flex", overflow: "hidden", backgroundColor: "#CCCCCC" }}>
          {done > 0 && <div style={{ flex: done, backgroundColor: "#00CC44", borderRight: done < total ? "1px solid #000" : "none" }} />}
          {inProgress > 0 && <div style={{ flex: inProgress, backgroundColor: "#0055FF", borderRight: "1px solid #000" }} />}
          {testing > 0 && <div style={{ flex: testing, backgroundColor: "#9D00FF", borderRight: "1px solid #000" }} />}
          {blocked > 0 && <div style={{ flex: blocked, backgroundColor: "#FF0033", borderRight: "1px solid #000" }} />}
          {todo > 0 && <div style={{ flex: todo, backgroundColor: "#CCCCCC" }} />}
        </div>
        {/* Status chips */}
        <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
          {[
            { label: "DONE", count: done, bg: "#00CC44", color: "#000", icon: CheckCircle2 },
            { label: "PROGRESS", count: inProgress, bg: "#0055FF", color: "#fff", icon: Activity },
            { label: "TESTING", count: testing, bg: "#9D00FF", color: "#fff", icon: FlaskConical },
            { label: "BLOCKED", count: blocked, bg: "#FF0033", color: "#fff", icon: AlertOctagon },
            { label: "TODO", count: todo, bg: "#CCCCCC", color: "#000", icon: Clock },
          ].map((chip) => {
            const ChipIcon = chip.icon;
            return (
              <div key={chip.label} style={{ border: "2px solid #000", backgroundColor: chip.bg, color: chip.color, padding: "2px 8px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "10px", display: "flex", gap: "4px", alignItems: "center" }}>
                <ChipIcon size={11} strokeWidth={2.6} className="shrink-0" />
                <span>{chip.label}</span>
                <span style={{ backgroundColor: chip.color, color: chip.bg, padding: "0 3px", border: "1px solid #000" }}>{chip.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Status Bar (Dynamic per team member) */}
      <div style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000", backgroundColor: "#F5F0E8", padding: "14px" }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.05em", marginBottom: "10px" }}>LIVE STATUS & ACTIVE PRESENCE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {members.map((member) => {
            const activeEntry = state.activeWorkers.find((w) => w.user.toLowerCase() === member.name.toLowerCase());
            const activeTask = activeEntry ? tasks.find((t) => t.id === activeEntry.taskId) : null;
            return (
              <div
                key={member.userId}
                className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 sm:p-3 border-2 border-black"
                style={{ backgroundColor: activeTask ? "#fffdf5" : "#F5F0E8" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={activeTask ? "pulse-dot" : ""}
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: activeTask ? "#00CC44" : "#CCCCCC",
                      flexShrink: 0,
                    }}
                  />
                  <strong style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>{member.name}</strong>
                  {activeTask && (
                    <span style={{ fontSize: "11px", color: "#666" }}>is on:</span>
                  )}
                </div>
                {activeTask ? (
                  <div className="flex items-center gap-2 flex-wrap flex-1 pl-4 sm:pl-0">
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "12px", flex: 1, minWidth: "120px" }}>{activeTask.title}</span>
                    <span style={{ border: "2px solid #000", backgroundColor: "#fff", padding: "1px 6px", fontSize: "10px", fontWeight: 600 }}>{activeTask.category}</span>
                    <span style={{ fontSize: "10px", color: "#666" }}>{timeElapsed(activeEntry!.startTime)}</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 pl-4 sm:pl-0">no active task right now</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Progress (Dynamic per team member) */}
      <div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "13px", letterSpacing: "0.05em", marginBottom: "10px" }}>TEAM SPRINT PROGRESS</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {allCardNames.map((memberName) => {
            const memberTasks = tasks.filter((t) => t.owner.toLowerCase() === memberName.toLowerCase());
            const mOpen = memberTasks.filter((t) => t.status !== "done").length;
            const mActive = memberTasks.filter((t) => t.status === "progress").length;
            const mDone = memberTasks.filter((t) => t.status === "done").length;
            const mBlocked = memberTasks.filter((t) => t.status === "blocked").length;
            const mPct = memberTasks.length > 0 ? Math.round((mDone / memberTasks.length) * 100) : 0;
            const activeWorker = state.activeWorkers.find((w) => w.user.toLowerCase() === memberName.toLowerCase());
            const activeTask = activeWorker ? tasks.find((t) => t.id === activeWorker.taskId) : null;
            const memberObj = members.find((m) => m.name.toLowerCase() === memberName.toLowerCase());

            return (
              <div key={memberName} style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000", backgroundColor: "#F5F0E8", padding: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ ...getOwnerStyle(memberName), width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "14px", border: "3px solid #000" }}>
                    {memberName[0]}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "12px" }}>{memberName.toUpperCase()}</div>
                    <div style={{ fontSize: "10px", color: "#666" }}>{memberObj?.roleTitle || (memberName === "Shared" ? "Shared Team" : "Member")}</div>
                  </div>
                  <div style={{ marginLeft: "auto", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: activeTask ? "#00CC44" : "#CCCCCC", border: "2px solid #000" }} />
                </div>
                {activeTask ? (
                  <div style={{ border: "2px solid #000", backgroundColor: "#00CC4422", padding: "4px 8px", fontSize: "11px", fontWeight: 600, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Flame size={13} strokeWidth={2.6} className="text-[#FF4400] shrink-0" />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeTask.title}</span>
                  </div>
                ) : (
                  <div style={{ border: "2px dashed #ccc", padding: "4px 8px", fontSize: "11px", color: "#999", marginBottom: "10px" }}>no active task</div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px", marginBottom: "10px" }}>
                  {[
                    { label: "OPEN", val: mOpen, color: "#000" },
                    { label: "ACTIVE", val: mActive, color: "#0055FF" },
                    { label: "BLOCKED", val: mBlocked, color: "#FF0033" },
                    { label: "DONE", val: mDone, color: "#00CC44" },
                  ].map((s) => (
                    <div key={s.label} style={{ border: "2px solid #000", backgroundColor: "#fff", padding: "4px", textAlign: "center" }}>
                      <div style={{ fontSize: "9px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#888" }}>{s.label}</div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "14px", color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ flex: 1, height: "8px", border: "2px solid #000", backgroundColor: "#CCCCCC", overflow: "hidden" }}>
                    <div style={{ width: `${mPct}%`, height: "100%", backgroundColor: "#00CC44" }} />
                  </div>
                  <span style={{ fontSize: "10px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{mPct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <InviteModal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} />
    </div>
  );
}

function StatCard({ label, value, sub, accentColor, valueColor, icon: Icon }: { label: string; value: number; sub: string; accentColor: string; valueColor?: string; icon: any }) {
  return (
    <div style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000", backgroundColor: "#F5F0E8", padding: "14px", borderTop: `6px solid ${accentColor}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "10px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: "0.08em", color: "#666" }}>{label}</span>
        <Icon size={16} strokeWidth={2.6} style={{ color: accentColor }} />
      </div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "32px", lineHeight: 1, color: valueColor ?? "#000", marginBottom: "4px" }}>{value}</div>
      <div style={{ fontSize: "11px", color: "#888", fontWeight: 500 }}>{sub}</div>
    </div>
  );
}
