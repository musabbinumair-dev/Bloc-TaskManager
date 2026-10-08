import { useState } from "react";
import { useTaskContext } from "@/lib/task-context";
import { Task } from "@/lib/task-context";
import { getOwnerStyle, getStatusStyle, getStatusLabel, getPriorityStyle, isOverdue, isDueToday, formatDueDate, timeElapsed } from "@/lib/helpers";

type SortCol = "title" | "owner" | "category" | "priority" | "status" | "dueDate" | "activeWorker" | null;
type SortDir = "asc" | "desc";

const STATUS_ORDER: Record<Task["status"], number> = { blocked: 0, progress: 1, testing: 2, todo: 3, done: 4 };
const PRIORITY_ORDER: Record<Task["priority"], number> = { high: 0, medium: 1, low: 2 };

export default function TableViewPage() {
  const { state } = useTaskContext();
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  }

  const sorted = [...state.tasks].sort((a, b) => {
    if (!sortCol) {
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    }
    let v = 0;
    if (sortCol === "title") v = a.title.localeCompare(b.title);
    else if (sortCol === "owner") v = a.owner.localeCompare(b.owner);
    else if (sortCol === "category") v = a.category.localeCompare(b.category);
    else if (sortCol === "priority") v = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    else if (sortCol === "status") v = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    else if (sortCol === "dueDate") {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      v = da - db;
    } else if (sortCol === "activeWorker") {
      const aw = (t: Task) => state.activeWorkers.find((w) => w.taskId === t.id)?.user ?? "";
      v = aw(a).localeCompare(aw(b));
    }
    return sortDir === "asc" ? v : -v;
  });

  // Group by status when no sort
  const groupedByStatus = sortCol === null;
  const statuses: Task["status"][] = ["blocked", "progress", "testing", "todo", "done"];

  function SortIcon({ col }: { col: SortCol }) {
    if (sortCol !== col) return <span style={{ color: "#ccc" }}>↕</span>;
    return <span>{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const thStyle: React.CSSProperties = {
    padding: "10px 12px",
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "11px",
    letterSpacing: "0.08em",
    textAlign: "left",
    borderRight: "2px solid #000",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    backgroundColor: "#000",
    color: "#FFE600",
  };

  const tdStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRight: "2px solid #000",
    fontSize: "12px",
    verticalAlign: "middle",
  };

  function renderRow(task: Task) {
    const activeWorker = state.activeWorkers.find((w) => w.taskId === task.id);
    const dueStyle: React.CSSProperties = isOverdue(task.dueDate)
      ? { backgroundColor: "#FF0033", color: "#fff", border: "2px solid #000", padding: "1px 6px", fontWeight: 700, fontSize: "10px" }
      : isDueToday(task.dueDate)
      ? { backgroundColor: "#FF8800", color: "#000", border: "2px solid #000", padding: "1px 6px", fontWeight: 700, fontSize: "10px" }
      : { padding: "1px 6px", fontSize: "11px" };

    return (
      <tr key={task.id} data-testid={`row-table-${task.id}`} style={{ borderBottom: "2px solid #000", backgroundColor: "#F5F0E8" }}>
        <td style={tdStyle}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "13px" }}>{task.title}</span>
        </td>
        <td style={tdStyle}>
          <span style={{ ...getOwnerStyle(task.owner), padding: "2px 8px", fontSize: "10px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
            {task.owner.toUpperCase()}
          </span>
        </td>
        <td style={tdStyle}>
          <span style={{ border: "2px solid #000", backgroundColor: "#fff", padding: "2px 8px", fontSize: "10px", fontWeight: 600 }}>{task.category}</span>
        </td>
        <td style={tdStyle}>
          <span style={{ ...getPriorityStyle(task.priority), padding: "2px 8px", fontSize: "10px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
            {task.priority.toUpperCase()}
          </span>
        </td>
        <td style={tdStyle}>
          <span style={{ ...getStatusStyle(task.status), padding: "2px 8px", fontSize: "10px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
            {getStatusLabel(task.status)}
          </span>
        </td>
        <td style={tdStyle}>
          {task.dueDate ? (
            <span style={dueStyle} className={isOverdue(task.dueDate) ? "blink-red" : ""}>
              {formatDueDate(task.dueDate)}
            </span>
          ) : (
            <span style={{ color: "#aaa", fontSize: "11px" }}>—</span>
          )}
        </td>
        <td style={{ ...tdStyle, borderRight: "none" }}>
          {activeWorker ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="pulse-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#00CC44", flexShrink: 0, display: "inline-block" }} />
              <span style={{ ...getOwnerStyle(activeWorker.user as any), padding: "1px 6px", fontSize: "10px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                {activeWorker.user}
              </span>
              <span style={{ fontSize: "10px", color: "#666" }}>· {timeElapsed(activeWorker.startTime)}</span>
            </div>
          ) : (
            <span style={{ color: "#ccc", fontSize: "11px" }}>—</span>
          )}
        </td>
      </tr>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "3px solid #000", backgroundColor: "#000", color: "#FFE600", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <span style={{ fontSize: "20px" }}>⊞</span>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "18px", letterSpacing: "0.05em" }}>TABLE VIEW</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "3px solid #000", minWidth: "800px" }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
            <tr>
              {[
                { col: "title" as SortCol, label: "TASK TITLE" },
                { col: "owner" as SortCol, label: "OWNER" },
                { col: "category" as SortCol, label: "CATEGORY" },
                { col: "priority" as SortCol, label: "PRIORITY" },
                { col: "status" as SortCol, label: "STATUS" },
                { col: "dueDate" as SortCol, label: "DUE" },
                { col: "activeWorker" as SortCol, label: "ACTIVE WORKER" },
              ].map(({ col, label }) => (
                <th key={col} style={thStyle} onClick={() => handleSort(col)}>
                  {label} <SortIcon col={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedByStatus
              ? statuses.map((status) => {
                  const rows = sorted.filter((t) => t.status === status);
                  if (rows.length === 0) return null;
                  return [
                    <tr key={`group-${status}`}>
                      <td
                        colSpan={7}
                        style={{
                          padding: "6px 12px",
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 700,
                          fontSize: "11px",
                          letterSpacing: "0.08em",
                          backgroundColor: "#333",
                          color: "#fff",
                          borderBottom: "2px solid #000",
                        }}
                      >
                        {getStatusLabel(status)} ({rows.length})
                      </td>
                    </tr>,
                    ...rows.map(renderRow),
                  ];
                })
              : sorted.map(renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
