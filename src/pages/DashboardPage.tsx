import { useState } from "react";
import { useTaskContext } from "@/lib/task-context";
import { getOwnerStyle, timeAgo, timeElapsed, getStatusAccentColor } from "@/lib/helpers";

const CATEGORIES = ["Core", "Backend", "Frontend", "Security", "Analytics", "Billing", "Notifications", "Display", "Bugfix", "DevOps"];

const CAT_COLORS: Record<string, string> = {
  Core: "#FFE600",
  Backend: "#0055FF",
  Frontend: "#9D00FF",
  Security: "#FF0033",
  Analytics: "#FF8800",
  Billing: "#00CC44",
  Notifications: "#FF00AA",
  Display: "#00CCFF",
  Bugfix: "#FF4400",
  DevOps: "#888888",
};

export default function DashboardPage() {
  const { state } = useTaskContext();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const tasks = state.tasks;
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "progress").length;
  const testing = tasks.filter((t) => t.status === "testing").length;
  const blocked = tasks.filter((t) => t.status === "blocked").length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const lastDone = tasks.filter((t) => t.status === "done").sort((a, b) => {
    const aTime = a.doneAt ?? a.createdAt;
    const bTime = b.doneAt ?? b.createdAt;
    return bTime - aTime;
  })[0];

  const MEMBERS = ["Musab", "Yusha", "Shared"] as const;

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", border: "3px solid #000", boxShadow: "4px 4px 0 #000", backgroundColor: "#000", color: "#FFE600" }}>
        <span style={{ fontSize: "20px" }}>▣</span>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "18px", letterSpacing: "0.05em" }}>TEAM DASHBOARD</div>
          <div style={{ fontSize: "12px", color: "#FFE600AA" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
        </div>
      </div>

      {/* Last Completed Banner */}
      {lastDone && !bannerDismissed && (
        <div style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #FFE600", backgroundColor: "#fffdf5", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px" }}>🏆</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "10px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#888", letterSpacing: "0.1em" }}>LATEST COMPLETED TASK</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "14px" }}>{lastDone.title}</div>
            <div style={{ fontSize: "11px", color: "#666" }}>
              Finished by <strong>{lastDone.owner}</strong> · {timeAgo(lastDone.doneAt ?? lastDone.createdAt)}
            </div>
          </div>
          <button
            data-testid="button-dismiss-banner"
            onClick={() => setBannerDismissed(true)}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FF0033'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#FF0033'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F5F0E8'; e.currentTarget.style.color = '#000'; e.currentTarget.style.borderColor = '#000'; }}
            style={{ border: "2px solid #000", backgroundColor: "#F5F0E8", width: "28px", height: "28px", cursor: "pointer", fontWeight: 700, fontSize: "14px", transition: "background-color 0.2s, color 0.2s, border-color 0.2s" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <StatCard label="TOTAL TASKS" value={total} sub="across all tracks" accentColor="#FFE600" />
        <StatCard label="COMPLETED" value={done} sub={`${completionRate}% rate`} accentColor="#00CC44" />
        <StatCard label="IN PROGRESS" value={inProgress} sub={`${testing} in testing`} accentColor="#0055FF" />
        <StatCard label="BLOCKED" value={blocked} sub="need attention" accentColor="#FF0033" valueColor="#FF0033" />
      </div>

      {/* Overall Progress Bar */}
      <div style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000", backgroundColor: "#F5F0E8", padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "13px", letterSpacing: "0.05em" }}>OVERALL PROJECT PROGRESS</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "12px", color: "#444" }}>
            {completionRate}% Complete · {done}/{total}
          </div>
        </div>
        {/* Segmented bar */}
        <div style={{ height: "24px", border: "3px solid #000", display: "flex", overflow: "hidden", backgroundColor: "#CCCCCC" }}>
          {done > 0 && <div style={{ flex: done, backgroundColor: "#00CC44", borderRight: done < total ? "1px solid #000" : "none" }} />}
          {inProgress > 0 && <div style={{ flex: inProgress, backgroundColor: "#0055FF", borderRight: "1px solid #000" }} />}
          {testing > 0 && <div style={{ flex: testing, backgroundColor: "#9D00FF", borderRight: "1px solid #000" }} />}
          {blocked > 0 && <div style={{ flex: blocked, backgroundColor: "#FF0033", borderRight: "1px solid #000" }} />}
          {todo > 0 && <div style={{ flex: todo, backgroundColor: "#CCCCCC" }} />}
        </div>
        {/* Status chips */}
        <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
          {[
            { label: "DONE", count: done, bg: "#00CC44", color: "#000" },
            { label: "PROGRESS", count: inProgress, bg: "#0055FF", color: "#fff" },
            { label: "TESTING", count: testing, bg: "#9D00FF", color: "#fff" },
            { label: "BLOCKED", count: blocked, bg: "#FF0033", color: "#fff" },
            { label: "TODO", count: todo, bg: "#CCCCCC", color: "#000" },
          ].map((chip) => (
            <div key={chip.label} style={{ border: "2px solid #000", backgroundColor: chip.bg, color: chip.color, padding: "2px 10px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", display: "flex", gap: "6px", alignItems: "center" }}>
              <span>{chip.label}</span>
              <span style={{ backgroundColor: chip.color, color: chip.bg, padding: "0 4px", border: "1px solid #000" }}>{chip.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Status Bar */}
      <div style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000", backgroundColor: "#F5F0E8", padding: "16px" }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "13px", letterSpacing: "0.05em", marginBottom: "12px" }}>LIVE STATUS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {["Musab", "Yusha"].map((member) => {
            const activeEntry = state.activeWorkers.find((w) => w.user === member);
            const activeTask = activeEntry ? tasks.find((t) => t.id === activeEntry.taskId) : null;
            return (
              <div key={member} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", border: "2px solid #000", backgroundColor: activeTask ? "#fffdf5" : "#F5F0E8" }}>
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
                <strong style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>{member}</strong>
                {activeTask ? (
                  <>
                    <span style={{ fontSize: "12px", color: "#666" }}>is on →</span>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "12px", flex: 1 }}>{activeTask.title}</span>
                    <span style={{ border: "2px solid #000", backgroundColor: "#fff", padding: "1px 8px", fontSize: "10px", fontWeight: 600 }}>{activeTask.category}</span>
                    <span style={{ fontSize: "11px", color: "#666" }}>{timeElapsed(activeEntry!.startTime)}</span>
                  </>
                ) : (
                  <span style={{ fontSize: "12px", color: "#999" }}>no active task right now</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Progress */}
      <div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "14px", letterSpacing: "0.05em", marginBottom: "12px" }}>TEAM PROGRESS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {MEMBERS.map((member) => {
            const memberTasks = tasks.filter((t) => t.owner === member);
            const mOpen = memberTasks.filter((t) => t.status !== "done").length;
            const mActive = memberTasks.filter((t) => t.status === "progress").length;
            const mDone = memberTasks.filter((t) => t.status === "done").length;
            const mBlocked = memberTasks.filter((t) => t.status === "blocked").length;
            const mPct = memberTasks.length > 0 ? Math.round((mDone / memberTasks.length) * 100) : 0;
            const activeWorker = state.activeWorkers.find((w) => w.user === member);
            const activeTask = activeWorker ? tasks.find((t) => t.id === activeWorker.taskId) : null;
            const roles: Record<string, string> = { Musab: "Full Stack Dev", Yusha: "Frontend Lead", Shared: "Team" };

            return (
              <div key={member} style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000", backgroundColor: "#F5F0E8", padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ ...getOwnerStyle(member as any), width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "16px", border: "3px solid #000" }}>
                    {member[0]}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "13px" }}>{member.toUpperCase()}</div>
                    <div style={{ fontSize: "11px", color: "#666" }}>{roles[member]}</div>
                  </div>
                  <div style={{ marginLeft: "auto", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: activeTask ? "#00CC44" : "#CCCCCC", border: "2px solid #000" }} />
                </div>
                {activeTask ? (
                  <div style={{ border: "2px solid #000", backgroundColor: "#00CC4422", padding: "4px 8px", fontSize: "11px", fontWeight: 600, marginBottom: "10px", display: "flex", gap: "6px" }}>
                    <span>🔥</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeTask.title}</span>
                  </div>
                ) : (
                  <div style={{ border: "2px dashed #ccc", padding: "4px 8px", fontSize: "11px", color: "#999", marginBottom: "10px" }}>no active task</div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px", marginBottom: "10px" }}>
                  {[
                    { label: "OPEN", val: mOpen, color: "#000" },
                    { label: "ACTIVE", val: mActive, color: "#0055FF" },
                    { label: "DONE", val: mDone, color: "#00CC44" },
                    { label: "BLOCK", val: mBlocked, color: "#FF0033" },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: "center", border: "2px solid #000", padding: "4px 2px" }}>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "14px", color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: "8px", fontWeight: 600, letterSpacing: "0.05em", color: "#666" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "11px", fontWeight: 600 }}>
                    <span>PROGRESS</span>
                    <span>{mPct}%</span>
                  </div>
                  <div style={{ height: "10px", border: "2px solid #000", backgroundColor: "#CCCCCC" }}>
                    <div style={{ height: "100%", width: `${mPct}%`, backgroundColor: "#00CC44" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "14px", letterSpacing: "0.05em", marginBottom: "12px" }}>CATEGORY BREAKDOWN</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
          {CATEGORIES.map((cat) => {
            const catTasks = tasks.filter((t) => t.category === cat);
            if (catTasks.length === 0) return null;
            const catDone = catTasks.filter((t) => t.status === "done").length;
            const pct = catTasks.length > 0 ? Math.round((catDone / catTasks.length) * 100) : 0;
            const color = CAT_COLORS[cat] || "#888";
            return (
              <div key={cat} style={{ border: "3px solid #000", boxShadow: "3px 3px 0 #000", backgroundColor: "#F5F0E8", padding: "12px" }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "12px", marginBottom: "8px" }}>{cat.toUpperCase()}</div>
                <div style={{ height: "8px", border: "2px solid #000", backgroundColor: "#CCCCCC", marginBottom: "6px" }}>
                  <div style={{ height: "100%", width: `${pct}%`, backgroundColor: color }} />
                </div>
                <div style={{ fontSize: "11px", color: "#666" }}>{catDone} done / {catTasks.length} total</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Breakdown */}
      <div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "14px", letterSpacing: "0.05em", marginBottom: "12px" }}>PRIORITY BREAKDOWN</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[
            { priority: "high", label: "HIGH", color: "#FF0033", textColor: "#fff" },
            { priority: "medium", label: "MEDIUM", color: "#FF8800", textColor: "#000" },
            { priority: "low", label: "LOW", color: "#AAAAAA", textColor: "#000" },
          ].map(({ priority, label, color, textColor }) => {
            const pTasks = tasks.filter((t) => t.priority === priority);
            const open = pTasks.filter((t) => t.status !== "done").length;
            const pDone = pTasks.filter((t) => t.status === "done").length;
            return (
              <div key={priority} style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000", backgroundColor: "#F5F0E8", borderLeft: `8px solid ${color}`, padding: "16px" }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "12px", color: "#666", marginBottom: "4px" }}>{label} PRIORITY</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "36px", color: color }}>{open}</div>
                <div style={{ fontSize: "11px", color: "#888" }}>open · {pDone} done</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Recent Completions */}
        <div style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000", backgroundColor: "#F5F0E8", padding: "16px" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "13px", letterSpacing: "0.05em", marginBottom: "12px", borderBottom: "2px solid #000", paddingBottom: "8px" }}>
            RECENT COMPLETIONS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {tasks.filter((t) => t.status === "done").sort((a, b) => {
              const aTime = a.doneAt ?? a.createdAt;
              const bTime = b.doneAt ?? b.createdAt;
              return bTime - aTime;
            }).slice(0, 5).map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#00CC44", border: "1px solid #000", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                <span style={{ ...getOwnerStyle(t.owner), padding: "1px 6px", fontSize: "9px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0 }}>
                  {t.owner.toUpperCase()}
                </span>
              </div>
            ))}
            {tasks.filter((t) => t.status === "done").length === 0 && (
              <div style={{ fontSize: "12px", color: "#999" }}>No completed tasks yet.</div>
            )}
          </div>
        </div>

        {/* Needs Attention */}
        <div style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000", backgroundColor: "#F5F0E8", padding: "16px" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "13px", letterSpacing: "0.05em", marginBottom: "12px", borderBottom: "2px solid #000", paddingBottom: "8px" }}>
            NEEDS ATTENTION
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {tasks.filter((t) => t.status === "blocked" || t.priority === "high").filter((t) => t.status !== "done").slice(0, 5).map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: t.status === "blocked" ? "#FF0033" : "#FF8800", border: "1px solid #000", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                <span style={{ ...getOwnerStyle(t.owner), padding: "1px 6px", fontSize: "9px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0 }}>
                  {t.owner.toUpperCase()}
                </span>
              </div>
            ))}
            {tasks.filter((t) => t.status === "blocked" || t.priority === "high").filter((t) => t.status !== "done").length === 0 && (
              <div style={{ fontSize: "12px", color: "#999" }}>All clear!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accentColor, valueColor }: { label: string; value: number; sub: string; accentColor: string; valueColor?: string }) {
  return (
    <div style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000", backgroundColor: "#F5F0E8", padding: "16px", position: "relative", overflow: "hidden" }}>
      <div style={{ fontSize: "10px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: "0.1em", color: "#666", marginBottom: "8px" }}>{label}</div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "42px", color: valueColor ?? "#000", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>{sub}</div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", backgroundColor: accentColor }} />
    </div>
  );
}
