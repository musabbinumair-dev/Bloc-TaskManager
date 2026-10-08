import { useState } from "react";
import { useTaskContext } from "@/lib/task-context";
import TaskBoard from "@/components/TaskBoard";

const CATEGORIES = ["All", "Core", "Backend", "Frontend", "Security", "Analytics", "Billing", "Notifications", "Display", "Bugfix", "DevOps"];
const PRIORITIES = ["All", "high", "medium", "low"];
const STATUSES = ["All", "todo", "progress", "testing", "blocked", "done"];

export default function AllTasksPage() {
  const { state } = useTaskContext();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [priFilter, setPriFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const open = state.tasks.filter((t) => t.status !== "done").length;

  const filtered = state.tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
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
      <div style={{ padding: "14px 20px", borderBottom: "3px solid #000", backgroundColor: "#000", color: "#FFE600", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <span style={{ fontSize: "20px" }}>≡</span>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "18px", letterSpacing: "0.05em" }}>ALL TASKS</div>
          <div style={{ fontSize: "12px", color: "#FFE600AA" }}>{open} open · {state.tasks.length} total</div>
        </div>
      </div>

      <div style={{ padding: "12px 20px", borderBottom: "3px solid #000", backgroundColor: "#F5F0E8", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", flexShrink: 0 }}>
        <input
          data-testid="input-all-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search all tasks..."
          style={{ ...inputStyle, minWidth: "180px", cursor: "text" }}
        />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={inputStyle}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c === "All" ? "ALL CATEGORIES" : c}</option>)}
        </select>
        <select value={priFilter} onChange={(e) => setPriFilter(e.target.value)} style={inputStyle}>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p === "All" ? "ALL PRIORITIES" : p.toUpperCase()}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={inputStyle}>
          {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "ALL STATUSES" : s.toUpperCase()}</option>)}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setCatFilter("All"); setPriFilter("All"); setStatusFilter("All"); }}
            style={{ padding: "6px 14px", border: "2px solid #000", backgroundColor: "#FF0033", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", cursor: "pointer" }}
          >
            CLEAR FILTERS
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {filtered.length === 0 ? (
          <div style={{ border: "3px dashed #ccc", padding: "40px", textAlign: "center", color: "#999", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>NO TASKS FOUND</div>
        ) : (
          <TaskBoard tasks={filtered} />
        )}
      </div>
    </div>
  );
}
