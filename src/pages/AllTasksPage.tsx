import { useState } from "react";
import { useTaskContext } from "@/lib/task-context";
import TaskBoard from "@/components/TaskBoard";
import { FolderKanban, Search, X } from "@/lib/icons";

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
      <div className="px-3.5 py-2.5 sm:px-5 sm:py-3.5 border-b-[3px] border-black bg-black text-[#FFE600] flex items-center gap-3 shrink-0">
        <FolderKanban size={20} strokeWidth={2.6} className="text-[#FFE600] shrink-0" />
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "16px", letterSpacing: "0.05em" }}>ALL TASKS</div>
          <div style={{ fontSize: "11px", color: "#FFE600AA" }}>{open} open · {state.tasks.length} total</div>
        </div>
      </div>

      <div className="p-3 sm:px-5 sm:py-3 border-b-[3px] border-black bg-[#F5F0E8] flex items-center gap-2 flex-wrap shrink-0">
        <div className="relative w-full sm:w-auto flex-1 sm:flex-initial flex items-center">
          <input
            data-testid="input-all-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all tasks..."
            className="w-full"
            style={{ ...inputStyle, paddingLeft: "30px", minWidth: "160px", cursor: "text" }}
          />
          <Search size={14} strokeWidth={2.4} className="absolute left-2.5 pointer-events-none text-gray-500" />
        </div>
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
            style={{ padding: "6px 14px", border: "2px solid #000", backgroundColor: "#FF0033", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            <X size={12} strokeWidth={2.6} />
            CLEAR FILTERS
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        {filtered.length === 0 ? (
          <div style={{ border: "3px dashed #ccc", padding: "40px", textAlign: "center", color: "#999", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>NO TASKS FOUND</div>
        ) : (
          <TaskBoard tasks={filtered} />
        )}
      </div>
    </div>
  );
}
