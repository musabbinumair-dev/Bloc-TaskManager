import { useState, useRef, useEffect } from "react";
import { useTaskContext } from "@/lib/task-context";
import { Task, User } from "@/lib/task-context";
import { generateId, getStatusLabel } from "@/lib/helpers";
import { useToastNotification } from "@/components/ToastContainer";

const DEFAULT_CATEGORIES = ["Core", "Backend", "Frontend", "Security", "Analytics", "Billing", "Notifications", "Display", "Bugfix", "DevOps"];
const STATUSES: Array<Task["status"]> = ["todo", "progress", "testing", "blocked", "done"];

export default function AddTaskPage() {
  const { state, dispatch } = useTaskContext();
  const { showToast } = useToastNotification();

  // Derive categories from existing tasks in Firebase, merged with defaults
  const dbCategories = [...new Set(state.tasks.map((t) => t.category).filter(Boolean))];
  const allCategories = [...new Set([...dbCategories, ...DEFAULT_CATEGORIES])].sort();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState<User>(state.currentUser);
  const [category, setCategory] = useState("Frontend");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [status, setStatus] = useState<Task["status"]>("todo");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const newTask: Task = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      owner,
      category,
      priority,
      status,
      dueDate,
      notes: "",
      comments: [],
      pushedToGitHub: false,
      assignedBy: state.currentUser,
      createdAt: Date.now(),
    };
    dispatch({ type: "ADD_TASK", payload: newTask });
    showToast(`Task "${newTask.title}" added!`, "success");
    setTitle("");
    setDescription("");
    setOwner(state.currentUser);
    setCategory("Frontend");
    setPriority("medium");
    setStatus("todo");
    setDueDate(null);
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
      <div
        ref={calRef}
        data-testid="calendar-picker"
        style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          zIndex: 100,
          border: "3px solid #000",
          boxShadow: "6px 6px 0 #000",
          backgroundColor: "#F5F0E8",
          padding: "12px",
          minWidth: "240px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <button onClick={() => setCalMonth(new Date(year, month - 1, 1))} style={{ border: "2px solid #000", backgroundColor: "#F5F0E8", width: "28px", height: "28px", cursor: "pointer", fontWeight: 700 }}>←</button>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "13px" }}>{monthNames[month]} {year}</span>
          <button onClick={() => setCalMonth(new Date(year, month + 1, 1))} style={{ border: "2px solid #000", backgroundColor: "#F5F0E8", width: "28px", height: "28px", cursor: "pointer", fontWeight: 700 }}>→</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} style={{ textAlign: "center", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "10px", color: "#888", padding: "2px 0" }}>{d}</div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const isSelected = selectedDate && selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day;
            return (
              <button
                key={day}
                data-testid={`calendar-day-${day}`}
                onClick={() => {
                  const d = new Date(year, month, day);
                  setDueDate(d.toISOString());
                  setShowCalendar(false);
                }}
                style={{
                  border: "2px solid #000",
                  backgroundColor: isSelected ? "#000" : isToday ? "#FFE600" : "#F5F0E8",
                  color: isSelected ? "#fff" : "#000",
                  fontWeight: isToday || isSelected ? 700 : 400,
                  cursor: "pointer",
                  padding: "4px 0",
                  fontSize: "12px",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", border: "3px solid #000", boxShadow: "4px 4px 0 #000", backgroundColor: "#000", color: "#FFE600", marginBottom: "20px" }}>
        <span style={{ fontSize: "20px" }}>＋</span>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "18px", letterSpacing: "0.05em" }}>ADD NEW TASK</div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ border: "3px solid #000", boxShadow: "6px 6px 0 #000", backgroundColor: "#F5F0E8", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Row 1: title + description */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", marginBottom: "6px" }}>TASK TITLE *</label>
              <input
                data-testid="input-task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                required
                style={{ width: "100%", padding: "10px 12px", border: "2px solid #000", boxShadow: "2px 2px 0 #000", backgroundColor: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", marginBottom: "6px" }}>SHORT DESCRIPTION</label>
              <input
                data-testid="input-task-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                style={{ width: "100%", padding: "10px 12px", border: "2px solid #000", boxShadow: "2px 2px 0 #000", backgroundColor: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Row 2: owner + category + priority + due date + submit */}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div>
              <label style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", marginBottom: "6px" }}>OWNER</label>
              <select
                data-testid="select-task-owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value as User)}
                style={{ padding: "10px 12px", border: "2px solid #000", boxShadow: "2px 2px 0 #000", backgroundColor: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "13px", cursor: "pointer", outline: "none" }}
              >
                <option value="Musab">Musab</option>
                <option value="Yusha">Yusha</option>
                <option value="Shared">Shared</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", marginBottom: "6px" }}>CATEGORY</label>
              <select
                data-testid="input-task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ padding: "10px 12px", border: "2px solid #000", boxShadow: "2px 2px 0 #000", backgroundColor: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "13px", outline: "none", cursor: "pointer", minWidth: "140px" }}
              >
                {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", marginBottom: "6px" }}>PRIORITY</label>
              <select
                data-testid="select-task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task["priority"])}
                style={{ padding: "10px 12px", border: "2px solid #000", boxShadow: "2px 2px 0 #000", backgroundColor: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "13px", cursor: "pointer", outline: "none" }}
              >
                <option value="high">HIGH</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", marginBottom: "6px" }}>STATUS</label>
              <select
                data-testid="select-task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Task["status"])}
                style={{ padding: "10px 12px", border: "2px solid #000", boxShadow: "2px 2px 0 #000", backgroundColor: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "13px", cursor: "pointer", outline: "none" }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{getStatusLabel(s)}</option>
                ))}
              </select>
            </div>

            <div style={{ position: "relative" }}>
              <label style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", marginBottom: "6px" }}>DUE DATE</label>
              <button
                data-testid="button-due-date"
                type="button"
                onClick={() => setShowCalendar((v) => !v)}
                style={{
                  padding: "10px 12px",
                  border: "2px solid #000",
                  boxShadow: "2px 2px 0 #000",
                  backgroundColor: dueDate ? "#FFE600" : "#fff",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: "pointer",
                  minWidth: "120px",
                }}
              >
                {dueDate ? new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "PICK DATE"}
              </button>
              {showCalendar && renderCalendar()}
            </div>

            {dueDate && (
              <button
                data-testid="button-clear-due-date"
                type="button"
                onClick={() => setDueDate(null)}
                style={{ padding: "10px 12px", border: "2px solid #000", backgroundColor: "#F5F0E8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "12px", cursor: "pointer", alignSelf: "flex-end" }}
              >
                CLEAR DATE
              </button>
            )}

            <button
              data-testid="button-add-task"
              type="submit"
              style={{
                padding: "10px 24px",
                backgroundColor: "#000",
                color: "#FFE600",
                border: "2px solid #000",
                boxShadow: "4px 4px 0 #FFE600",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.05em",
                cursor: "pointer",
                alignSelf: "flex-end",
                marginLeft: "auto",
              }}
            >
              ADD TASK →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
