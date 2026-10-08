import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Task, User } from "@/lib/task-context";
import { useTaskContext } from "@/lib/task-context";
import { getStatusLabel } from "@/lib/helpers";

const DEFAULT_CATEGORIES = ["Core", "Backend", "Frontend", "Security", "Analytics", "Billing", "Notifications", "Display", "Bugfix", "DevOps"];
const STATUSES: Array<Task["status"]> = ["todo", "progress", "testing", "blocked", "done"];
const PRIORITIES: Array<Task["priority"]> = ["high", "medium", "low"];
const OWNERS: User[] = ["Musab", "Yusha", "Shared"];

const PRIORITY_COLORS: Record<Task["priority"], { bg: string; color: string }> = {
  high: { bg: "#FF0033", color: "#fff" },
  medium: { bg: "#FF8800", color: "#000" },
  low: { bg: "#00CC44", color: "#000" },
};

const STATUS_COLORS: Record<Task["status"], { bg: string; color: string }> = {
  todo: { bg: "#F5F0E8", color: "#000" },
  progress: { bg: "#0055FF", color: "#fff" },
  testing: { bg: "#9B59B6", color: "#fff" },
  blocked: { bg: "#FF0033", color: "#fff" },
  done: { bg: "#00CC44", color: "#000" },
};

const OWNER_COLORS: Record<User, { bg: string; color: string }> = {
  Musab: { bg: "#FFE600", color: "#000" },
  Yusha: { bg: "#0055FF", color: "#fff" },
  Shared: { bg: "#00CC44", color: "#000" },
};

interface EditTaskModalProps {
  task: Task;
  open: boolean;
  onClose: () => void;
}

export default function EditTaskModal({ task, open, onClose }: EditTaskModalProps) {
  const { state, dispatch } = useTaskContext();
  const dbCategories = [...new Set(state.tasks.map((t) => t.category).filter(Boolean))];
  const allCategories = [...new Set([...dbCategories, ...DEFAULT_CATEGORIES])].sort();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [owner, setOwner] = useState<User>(task.owner);
  const [category, setCategory] = useState(task.category);
  const [priority, setPriority] = useState<Task["priority"]>(task.priority);
  const [status, setStatus] = useState<Task["status"]>(task.status);
  const [dueDate, setDueDate] = useState<string | null>(task.dueDate);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(task.dueDate ? new Date(task.dueDate) : new Date());
  const [closing, setClosing] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description);
      setOwner(task.owner);
      setCategory(task.category);
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate);
      setCalMonth(task.dueDate ? new Date(task.dueDate) : new Date());
      setShowCalendar(false);
      setClosing(false);
    }
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleClose() {
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 180);
  }

  function handleSave() {
    if (!title.trim()) return;
    dispatch({
      type: "UPDATE_TASK",
      payload: { id: task.id, title: title.trim(), description: description.trim(), owner, category, priority, status, dueDate },
    });
    handleClose();
  }

  function renderCalendar() {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const selectedDate = dueDate ? new Date(dueDate) : null;
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
      <div ref={calRef} style={{ position: "absolute", bottom: "calc(100% + 2px)", left: 0, zIndex: 200, border: "2px solid #000", boxShadow: "4px 4px 0 #000", backgroundColor: "#F5F0E8", padding: "8px", minWidth: "210px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <button onClick={() => setCalMonth(new Date(year, month - 1, 1))} style={{ border: "2px solid #000", backgroundColor: "#F5F0E8", width: "24px", height: "24px", cursor: "pointer", fontWeight: 700, fontSize: "11px" }}>←</button>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px" }}>{monthNames[month]} {year}</span>
          <button onClick={() => setCalMonth(new Date(year, month + 1, 1))} style={{ border: "2px solid #000", backgroundColor: "#F5F0E8", width: "24px", height: "24px", cursor: "pointer", fontWeight: 700, fontSize: "11px" }}>→</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px" }}>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} style={{ textAlign: "center", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "9px", color: "#888", padding: "2px 0" }}>{d}</div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const isSelected = selectedDate && selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day;
            return (
              <button key={day} onClick={() => { setDueDate(new Date(year, month, day).toISOString()); setShowCalendar(false); }}
                style={{ border: "1px solid #000", backgroundColor: isSelected ? "#000" : isToday ? "#FFE600" : "#F5F0E8", color: isSelected ? "#fff" : "#000", fontWeight: isToday || isSelected ? 700 : 400, cursor: "pointer", padding: "3px 0", fontSize: "11px", fontFamily: "'Inter', sans-serif" }}>
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!open) return null;

  const animStyle = document.getElementById("edit-modal-anim");
  if (!animStyle) {
    const style = document.createElement("style");
    style.id = "edit-modal-anim";
    style.textContent = `
      @keyframes editModalIn { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes editModalOut { from { opacity: 1; } to { opacity: 0; transform: translateY(8px) scale(0.98); } }
    `;
    document.head.appendChild(style);
  }

  const lbl: React.CSSProperties = { display: "block", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "10px", letterSpacing: "0.1em", marginBottom: "4px", color: "#444" };

  const modalContent = (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: closing ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.5)", transition: "background-color 0.18s" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          border: "3px solid #000",
          boxShadow: "8px 8px 0 #000",
          backgroundColor: "#F5F0E8",
          width: "520px",
          maxWidth: "92vw",
          animation: closing ? "editModalOut 0.18s ease forwards" : "editModalIn 0.25s cubic-bezier(0.22,1,0.36,1) forwards",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "#000", color: "#FFE600" }}>
          <span style={{ fontSize: "14px" }}>✎</span>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "13px", letterSpacing: "0.08em", flex: 1 }}>EDIT TASK</div>
          <button onClick={handleClose}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FF0033"; e.currentTarget.style.borderColor = "#FF0033"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "#FFE600"; e.currentTarget.style.color = "#FFE600"; }}
            style={{ border: "2px solid #FFE600", backgroundColor: "transparent", color: "#FFE600", width: "24px", height: "24px", cursor: "pointer", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Title */}
          <div>
            <label style={lbl}>TASK TITLE *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: "7px 10px", border: "2px solid #000", boxShadow: "2px 2px 0 #000", backgroundColor: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* Description */}
          <div>
            <label style={lbl}>DESCRIPTION</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: "7px 10px", border: "2px solid #000", boxShadow: "2px 2px 0 #000", backgroundColor: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* Owner + Priority row */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div>
              <label style={lbl}>OWNER</label>
              <div style={{ display: "flex", gap: "4px" }}>
                {OWNERS.map((o) => {
                  const active = owner === o;
                  const c = OWNER_COLORS[o];
                  return (
                    <button key={o} onClick={() => setOwner(o)}
                      style={{ padding: "4px 10px", border: "2px solid #000", boxShadow: active ? `3px 3px 0 ${c.bg === "#FFE600" ? "#000" : c.bg}` : "none", backgroundColor: active ? c.bg : "#F5F0E8", color: active ? c.color : "#888", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "10px", letterSpacing: "0.04em", cursor: "pointer", transition: "all 0.12s" }}>
                      {o.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label style={lbl}>PRIORITY</label>
              <div style={{ display: "flex", gap: "4px" }}>
                {PRIORITIES.map((p) => {
                  const active = priority === p;
                  const c = PRIORITY_COLORS[p];
                  return (
                    <button key={p} onClick={() => setPriority(p)}
                      style={{ padding: "4px 10px", border: "2px solid #000", boxShadow: active ? `3px 3px 0 ${c.bg}` : "none", backgroundColor: active ? c.bg : "#F5F0E8", color: active ? c.color : "#888", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "10px", letterSpacing: "0.04em", cursor: "pointer", transition: "all 0.12s" }}>
                      {p.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={lbl}>STATUS</label>
            <div style={{ display: "flex", gap: "4px" }}>
              {STATUSES.map((s) => {
                const active = status === s;
                const c = STATUS_COLORS[s];
                return (
                  <button key={s} onClick={() => setStatus(s)}
                    style={{ padding: "4px 10px", border: "2px solid #000", boxShadow: active ? `3px 3px 0 ${c.bg === "#F5F0E8" ? "#000" : c.bg}` : "none", backgroundColor: active ? c.bg : "#F5F0E8", color: active ? c.color : "#888", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "10px", letterSpacing: "0.04em", cursor: "pointer", transition: "all 0.12s" }}>
                    {getStatusLabel(s)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category + Due Date */}
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
            <div>
              <label style={lbl}>CATEGORY</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                style={{ padding: "7px 10px", border: "2px solid #000", boxShadow: "2px 2px 0 #000", backgroundColor: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "11px", cursor: "pointer", outline: "none", minWidth: "120px" }}>
                {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ position: "relative" }}>
              <label style={lbl}>DUE DATE</label>
              <button type="button" onClick={() => setShowCalendar((v) => !v)}
                style={{ padding: "7px 10px", border: "2px solid #000", boxShadow: "2px 2px 0 #000", backgroundColor: dueDate ? "#FFE600" : "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "11px", cursor: "pointer", minWidth: "100px" }}>
                {dueDate ? new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "PICK DATE"}
              </button>
              {showCalendar && renderCalendar()}
            </div>
            {dueDate && (
              <button type="button" onClick={() => setDueDate(null)}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FF0033"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F5F0E8"; e.currentTarget.style.color = "#000"; }}
                style={{ padding: "7px 10px", border: "2px solid #000", backgroundColor: "#F5F0E8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "10px", cursor: "pointer", transition: "all 0.12s" }}>
                CLEAR
              </button>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", borderTop: "2px solid #000", paddingTop: "12px", marginTop: "2px" }}>
            <button onClick={handleClose}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#000"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F5F0E8"; e.currentTarget.style.color = "#000"; }}
              style={{ padding: "8px 18px", border: "2px solid #000", boxShadow: "2px 2px 0 #000", backgroundColor: "#F5F0E8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", cursor: "pointer", transition: "all 0.12s" }}>
              CANCEL
            </button>
            <button onClick={handleSave}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-1px,-1px)"; e.currentTarget.style.boxShadow = "5px 5px 0 #FFE600"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translate(0,0)"; e.currentTarget.style.boxShadow = "3px 3px 0 #FFE600"; }}
              style={{ padding: "8px 22px", backgroundColor: "#000", color: "#FFE600", border: "2px solid #000", boxShadow: "3px 3px 0 #FFE600", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.05em", cursor: "pointer", transition: "all 0.12s" }}>
              SAVE CHANGES
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
