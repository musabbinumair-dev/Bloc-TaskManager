import { useState } from "react";
import { useTaskContext } from "@/lib/task-context";
import { User } from "@/lib/task-context";
import { getOwnerStyle } from "@/lib/helpers";
import TaskBoard from "@/components/TaskBoard";

const CATEGORIES = ["All", "Core", "Backend", "Frontend", "Security", "Analytics", "Billing", "Notifications", "Display", "Bugfix", "DevOps"];
const PRIORITIES = ["All", "high", "medium", "low"];
const STATUSES = ["All", "todo", "progress", "testing", "blocked", "done"];

interface TrackPageProps {
  owner: User;
}

const ICONS: Record<User, string> = { Musab: "◎", Yusha: "◎", Shared: "◎" };

export default function TrackPage({ owner }: TrackPageProps) {
  const { state } = useTaskContext();
  const isMyTrack = owner.toLowerCase() === state.currentUser.toLowerCase() || owner === "Shared";
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [priFilter, setPriFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const all = state.tasks.filter((t) => t.owner.toLowerCase() === owner.toLowerCase());
  const open = all.filter((t) => t.status !== "done").length;
  const done = all.filter((t) => t.status === "done").length;

  const filtered = all.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter !== "All" && t.category !== catFilter) return false;
    if (priFilter !== "All" && t.priority !== priFilter) return false;
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    return true;
  });

  const hasFilters = search || catFilter !== "All" || priFilter !== "All" || statusFilter !== "All";

  const inputStyle: React.CSSProperties = {
    padding: "6px 10px",
    border: "2px solid #000",
    boxShadow: "2px 2px 0 #000",
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: "12px",
    backgroundColor: "#fff",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Page header */}
      <div style={{ padding: "14px 20px", border: "3px solid #000", borderLeft: "none", borderRight: "none", borderTop: "none", backgroundColor: "#000", color: "#FFE600", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <div style={{ ...getOwnerStyle(owner), width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "18px", border: "3px solid #FFE600" }}>
          {owner[0]}
        </div>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "18px", letterSpacing: "0.05em" }}>
            {owner === "Shared" ? "SHARED TRACK" : `${owner.toUpperCase()}'S TRACK`}
          </div>
          <div style={{ fontSize: "12px", color: "#FFE600AA" }}>{open} open · {done} done</div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "12px 20px", borderBottom: "3px solid #000", backgroundColor: "#F5F0E8", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", flexShrink: 0 }}>
        <input
          data-testid="input-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          style={{ ...inputStyle, minWidth: "180px", cursor: "text" }}
        />
        <select data-testid="select-category-filter" value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={inputStyle}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c === "All" ? "ALL CATEGORIES" : c}</option>)}
        </select>
        <select data-testid="select-priority-filter" value={priFilter} onChange={(e) => setPriFilter(e.target.value)} style={inputStyle}>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p === "All" ? "ALL PRIORITIES" : p.toUpperCase()}</option>)}
        </select>
        <select data-testid="select-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={inputStyle}>
          {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "ALL STATUSES" : s.toUpperCase()}</option>)}
        </select>
        {hasFilters && (
          <button
            data-testid="button-clear-filters"
            onClick={() => { setSearch(""); setCatFilter("All"); setPriFilter("All"); setStatusFilter("All"); }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFE600'; e.currentTarget.style.color = '#000'; e.currentTarget.style.borderColor = '#FFE600'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FF0033'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#FF0033'; }}
            style={{ padding: "6px 14px", border: "2px solid #000", backgroundColor: "#FF0033", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", cursor: "pointer", transition: "background-color 0.2s, color 0.2s, border-color 0.2s" }}
          >
            CLEAR FILTERS
          </button>
        )}
      </div>

      {/* Board */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {filtered.length === 0 ? (
          <div style={{ border: "3px dashed #ccc", padding: "40px", textAlign: "center", color: "#999", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
            NO TASKS FOUND
          </div>
        ) : (
          <TaskBoard tasks={filtered} showNewAssignments={isMyTrack} showCurrentlyActive={isMyTrack} />
        )}
      </div>
    </div>
  );
}
