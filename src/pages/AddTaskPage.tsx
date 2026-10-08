import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTaskContext } from "@/lib/task-context";
import { Task } from "@/lib/task-context";
import { generateId, getStatusLabel } from "@/lib/helpers";
import { useToastNotification } from "@/components/ToastContainer";
import {
  PlusSquare,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  getCategoryIcon,
  getPriorityIconComponent,
  getStatusIconComponent,
  getOwnerIconComponent,
} from "@/lib/icons";

const DEFAULT_CATEGORIES = ["Core", "Backend", "Frontend", "Security", "Analytics", "Billing", "Notifications", "Display", "Bugfix", "DevOps"];
const STATUSES: Array<Task["status"]> = ["todo", "progress", "testing", "blocked", "done"];

export default function AddTaskPage() {
  const { user, members } = useAuth();
  const { state, dispatch } = useTaskContext();
  const { showToast } = useToastNotification();

  const ownerOptions = [...new Set([...members.map((m) => m.name), "Shared"])];

  // Derive categories from existing tasks in database, merged with defaults
  const dbCategories = [...new Set(state.tasks.map((t) => t.category).filter(Boolean))];
  const allCategories = [...new Set([...dbCategories, ...DEFAULT_CATEGORIES])].sort();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState<string>(user?.name || "Shared");
  const [category, setCategory] = useState("Frontend");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [status, setStatus] = useState<Task["status"]>("todo");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.name && !owner) {
      setOwner(user.name);
    }
  }, [user?.name]);

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
      workspaceId: "",
      title: title.trim(),
      description: description.trim(),
      owner: owner || user?.name || "Shared",
      category,
      priority,
      status,
      dueDate,
      notes: "",
      comments: [],
      pushedToGitHub: false,
      assignedBy: user?.name || "Member",
      createdAt: Date.now(),
    };
    dispatch({ type: "ADD_TASK", payload: newTask });
    showToast(`Task "${newTask.title}" added!`, "success");
    setTitle("");
    setDescription("");
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
          <button onClick={() => setCalMonth(new Date(year, month - 1, 1))} style={{ border: "2px solid #000", backgroundColor: "#F5F0E8", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronLeft size={14} strokeWidth={2.6} />
          </button>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "13px" }}>{monthNames[month]} {year}</span>
          <button onClick={() => setCalMonth(new Date(year, month + 1, 1))} style={{ border: "2px solid #000", backgroundColor: "#F5F0E8", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronRight size={14} strokeWidth={2.6} />
          </button>
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
    <div className="p-3 sm:p-5">
      {/* Page header */}
      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-[3px] border-black bg-black text-[#FFE600] flex items-center gap-3 mb-4 shadow-[4px_4px_0_#000]">
        <PlusSquare size={20} strokeWidth={2.6} className="text-[#FFE600] shrink-0" />
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "16px", letterSpacing: "0.05em" }}>ADD NEW TASK</div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="border-[3px] border-black bg-[#F5F0E8] p-3.5 sm:p-6 flex flex-col gap-4 shadow-[5px_5px_0_#000]">
          {/* Row 1: title + description */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 sm:flex-[2]">
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
            <div className="flex-1">
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

          {/* Row 2: owner + category + priority + status + due date + submit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-3 items-end">
            <div className="w-full lg:w-auto">
              <label style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", marginBottom: "6px" }}>
                {getOwnerIconComponent(owner, 12)}
                <span>OWNER</span>
              </label>
              <select
                data-testid="select-task-owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full lg:w-auto"
                style={{ padding: "10px 12px", border: "2px solid #000", boxShadow: "2px 2px 0 #000", backgroundColor: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "13px", cursor: "pointer", outline: "none" }}
              >
                {ownerOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="w-full lg:w-auto">
              <label style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", marginBottom: "6px" }}>
                {getCategoryIcon(category, 12)}
                <span>CATEGORY</span>
              </label>
              <select
                data-testid="input-task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full lg:w-auto"
                style={{ padding: "10px 12px", border: "2px solid #000", boxShadow: "2px 2px 0 #000", backgroundColor: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "13px", outline: "none", cursor: "pointer", minWidth: "130px" }}
              >
                {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="w-full lg:w-auto">
              <label style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", marginBottom: "6px" }}>
                {getPriorityIconComponent(priority, 12)}
                <span>PRIORITY</span>
              </label>
              <select
                data-testid="select-task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task["priority"])}
                className="w-full lg:w-auto"
                style={{ padding: "10px 12px", border: "2px solid #000", boxShadow: "2px 2px 0 #000", backgroundColor: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "13px", cursor: "pointer", outline: "none" }}
              >
                <option value="high">HIGH</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
            </div>

            <div className="w-full lg:w-auto">
              <label style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", marginBottom: "6px" }}>
                {getStatusIconComponent(status, 12)}
                <span>STATUS</span>
              </label>
              <select
                data-testid="select-task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Task["status"])}
                className="w-full lg:w-auto"
                style={{ padding: "10px 12px", border: "2px solid #000", boxShadow: "2px 2px 0 #000", backgroundColor: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "13px", cursor: "pointer", outline: "none" }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{getStatusLabel(s)}</option>
                ))}
              </select>
            </div>

            <div className="w-full lg:w-auto relative">
              <label style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", marginBottom: "6px" }}>DUE DATE</label>
              <div className="flex gap-2">
                <button
                  data-testid="button-due-date"
                  type="button"
                  onClick={() => setShowCalendar((v) => !v)}
                  className="flex-1 lg:flex-initial"
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
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Calendar size={13} strokeWidth={2.4} />
                  {dueDate ? new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "PICK DATE"}
                </button>
                {dueDate && (
                  <button
                    data-testid="button-clear-due-date"
                    type="button"
                    onClick={() => setDueDate(null)}
                    style={{ padding: "10px 12px", border: "2px solid #000", backgroundColor: "#F5F0E8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <X size={12} strokeWidth={2.6} />
                    CLEAR
                  </button>
                )}
              </div>
              {showCalendar && renderCalendar()}
            </div>

            <div className="col-span-full lg:ml-auto w-full lg:w-auto pt-2 lg:pt-0">
              <button
                data-testid="button-add-task"
                type="submit"
                className="w-full lg:w-auto"
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#000",
                  color: "#FFE600",
                  border: "2px solid #000",
                  boxShadow: "4px 4px 0 #FFE600",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "13px",
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  minHeight: "44px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Plus size={16} strokeWidth={3} />
                ADD TASK
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
