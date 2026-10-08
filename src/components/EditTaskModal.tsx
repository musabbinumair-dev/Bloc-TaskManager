import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Task } from "@/lib/task-context";
import { useAuth } from "@/lib/auth-context";
import { useTaskContext } from "@/lib/task-context";
import { getStatusLabel, getOwnerPalette } from "@/lib/helpers";
import {
  Pencil,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  getCategoryIcon,
  getPriorityIconComponent,
  getStatusIconComponent,
  getOwnerIconComponent,
} from "@/lib/icons";

const DEFAULT_CATEGORIES = ["Core", "Backend", "Frontend", "Security", "Analytics", "Billing", "Notifications", "Display", "Bugfix", "DevOps"];
const STATUSES: Array<Task["status"]> = ["todo", "progress", "testing", "blocked", "done"];
const PRIORITIES: Array<Task["priority"]> = ["high", "medium", "low"];

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

interface EditTaskModalProps {
  task: Task;
  open: boolean;
  onClose: () => void;
}

export default function EditTaskModal({ task, open, onClose }: EditTaskModalProps) {
  const { members } = useAuth();
  const { state, dispatch } = useTaskContext();

  const dynamicOwners = [...new Set([...members.map((m) => m.name), "Shared"])];
  const dbCategories = [...new Set(state.tasks.map((t) => t.category).filter(Boolean))];
  const allCategories = [...new Set([...dbCategories, ...DEFAULT_CATEGORIES])].sort();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [owner, setOwner] = useState<string>(task.owner);
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
      setClosing(false);
    }
  }, [open, task]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  if (!open) return null;

  function handleClose() {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
    }, 180);
  }

  function handleSave() {
    if (!title.trim()) return;
    dispatch({
      type: "UPDATE_TASK",
      payload: {
        id: task.id,
        title: title.trim(),
        description: description.trim(),
        owner,
        category,
        priority,
        status,
        dueDate,
      },
    });
    handleClose();
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
          maxWidth: "94vw",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "#000", color: "#FFE600", position: "sticky", top: 0, zIndex: 10 }}>
          <Pencil size={15} strokeWidth={2.6} className="text-[#FFE600]" />
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "13px", letterSpacing: "0.08em", flex: 1 }}>EDIT TASK</div>
          <button onClick={handleClose}
            style={{ border: "2px solid #FFE600", backgroundColor: "transparent", color: "#FFE600", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={14} strokeWidth={2.6} />
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <label style={lbl}>OWNER</label>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {dynamicOwners.map((o, idx) => {
                  const active = owner === o;
                  const palette = getOwnerPalette(o);
                  return (
                    <button key={`modal-owner-${o}-${idx}`} onClick={() => setOwner(o)}
                      style={{ padding: "4px 10px", border: "2px solid #000", boxShadow: active ? `3px 3px 0 #000` : "none", backgroundColor: active ? palette.bg : "#F5F0E8", color: active ? palette.text : "#555", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "10px", letterSpacing: "0.04em", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      {getOwnerIconComponent(o, 11)}
                      {o.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label style={lbl}>PRIORITY</label>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {PRIORITIES.map((p) => {
                  const active = priority === p;
                  const c = PRIORITY_COLORS[p];
                  return (
                    <button key={p} onClick={() => setPriority(p)}
                      style={{ padding: "4px 10px", border: "2px solid #000", boxShadow: active ? `3px 3px 0 ${c.bg}` : "none", backgroundColor: active ? c.bg : "#F5F0E8", color: active ? c.color : "#888", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "10px", letterSpacing: "0.04em", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      {getPriorityIconComponent(p, 11)}
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
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {STATUSES.map((s) => {
                const active = status === s;
                const c = STATUS_COLORS[s];
                return (
                  <button key={s} onClick={() => setStatus(s)}
                    style={{ padding: "4px 10px", border: "2px solid #000", boxShadow: active ? `3px 3px 0 ${c.bg === "#F5F0E8" ? "#000" : c.bg}` : "none", backgroundColor: active ? c.bg : "#F5F0E8", color: active ? c.color : "#888", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "10px", letterSpacing: "0.04em", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    {getStatusIconComponent(s, 11)}
                    {getStatusLabel(s)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={lbl}>CATEGORY</label>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {allCategories.map((c) => {
                const active = category === c;
                return (
                  <button key={c} onClick={() => setCategory(c)}
                    style={{ padding: "3px 8px", border: "2px solid #000", backgroundColor: active ? "#000" : "#fff", color: active ? "#FFE600" : "#333", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "10px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    {getCategoryIcon(c, 10)}
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 14px", borderTop: "2px solid #000", backgroundColor: "#EDE8DF", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button onClick={handleClose}
            style={{ padding: "6px 14px", border: "2px solid #000", backgroundColor: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", cursor: "pointer" }}>
            CANCEL
          </button>
          <button onClick={handleSave}
            style={{ padding: "6px 18px", border: "2px solid #000", boxShadow: "2px 2px 0 #000", backgroundColor: "#000", color: "#FFE600", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.06em", cursor: "pointer" }}>
            SAVE CHANGES
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
