import { useState } from "react";
import { Task, User } from "@/lib/task-context";
import { useTaskContext } from "@/lib/task-context";
import {
  getOwnerStyle,
  getStatusStyle,
  getStatusAccentColor,
  getStatusLabel,
  getPriorityStyle,
  getPriorityIcon,
  isOverdue,
  isDueToday,
  formatDueDate,
  timeAgo,
  timeElapsed,
  generateId,
} from "@/lib/helpers";
import ConfirmPopup from "./ConfirmPopup";
import EditTaskModal from "./EditTaskModal";

const STATUSES: Array<Task["status"]> = ["todo", "progress", "testing", "blocked", "done"];
const PRIORITIES: Array<Task["priority"]> = ["high", "medium", "low"];
const OWNERS: User[] = ["Musab", "Yusha", "Shared"];

interface TaskCardProps {
  task: Task;
  isUnseen?: boolean;
}

export default function TaskCard({ task, isUnseen = false }: TaskCardProps) {
  const { state, dispatch } = useTaskContext();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const activeWorker = state.activeWorkers.find((w) => w.taskId === task.id);
  const isCurrentUserActive = activeWorker?.user === state.currentUser;
  const isSomeoneElseActive = activeWorker && activeWorker.user !== state.currentUser;
  const isMyTask = task.owner === state.currentUser || task.owner === "Shared";
  const isOtherMembersTask = task.owner !== state.currentUser && task.owner !== "Shared";

  const cardClass = isCurrentUserActive ? "card-active" : isUnseen ? "card-unseen" : "";
  const accentColor = getStatusAccentColor(task.status);

  function handleToggleActive() {
    if (isCurrentUserActive) {
      dispatch({ type: "CLEAR_ACTIVE_WORKER", payload: task.id });
    } else {
      dispatch({ type: "SET_ACTIVE_WORKER", payload: { taskId: task.id, user: state.currentUser, startTime: Date.now() } });
    }
  }

  function handleStatusChange(newStatus: Task["status"]) {
    dispatch({ type: "UPDATE_TASK", payload: { id: task.id, status: newStatus } });
  }

  function handlePriorityChange(newPriority: Task["priority"]) {
    dispatch({ type: "UPDATE_TASK", payload: { id: task.id, priority: newPriority } });
  }

  function handleAssign(owner: User) {
    dispatch({ type: "UPDATE_TASK", payload: { id: task.id, owner } });
  }

  function handleDelete() {
    setShowDeleteConfirm(true);
  }

  function confirmDelete() {
    dispatch({ type: "DELETE_TASK", payload: task.id });
    setShowDeleteConfirm(false);
  }

  function cancelDelete() {
    setShowDeleteConfirm(false);
  }

  function handleSendComment() {
    if (!commentText.trim()) return;
    dispatch({
      type: "ADD_COMMENT",
      payload: {
        taskId: task.id,
        comment: { id: generateId(), author: state.currentUser, text: commentText.trim(), timestamp: Date.now() },
      },
    });
    setCommentText("");
  }

  function handleNotesBlur(e: React.FocusEvent<HTMLTextAreaElement>) {
    dispatch({ type: "UPDATE_NOTES", payload: { taskId: task.id, notes: e.target.value } });
  }

  const dueStyle: React.CSSProperties = isOverdue(task.dueDate)
    ? { backgroundColor: "#FF0033", color: "#fff", border: "2px solid #000" }
    : isDueToday(task.dueDate)
    ? { backgroundColor: "#FF8800", color: "#000", border: "2px solid #000" }
    : { backgroundColor: "#F5F0E8", color: "#000", border: "2px solid #000" };

  return (
    <div
      data-testid={`card-task-${task.id}`}
      className={cardClass}
      style={{
        border: "3px solid #000",
        boxShadow: "6px 6px 0 #000",
        backgroundColor: "#F5F0E8",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.1s, box-shadow 0.1s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!cardClass) (e.currentTarget as HTMLDivElement).style.boxShadow = "8px 8px 0 #000";
        (e.currentTarget as HTMLDivElement).style.transform = "translate(-2px, -2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = cardClass ? "" : "6px 6px 0 #000";
        (e.currentTarget as HTMLDivElement).style.transform = "translate(0, 0)";
      }}
    >
      {/* Left accent bar */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "5px", backgroundColor: accentColor }} />

      <div style={{ padding: "12px", paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
        {/* Top row: priority + title + delete */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: getPriorityStyle(task.priority).backgroundColor as string, flexShrink: 0 }}>
            {getPriorityIcon(task.priority)}
          </span>
          <div
            data-testid={`text-task-title-${task.id}`}
            style={{ flex: 1, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "14px", lineHeight: 1.3 }}
          >
            {task.title}
          </div>
          {isMyTask && (
            <button
              data-testid={`button-delete-${task.id}`}
              onClick={handleDelete}
              style={{
                border: "2px solid #000",
                backgroundColor: "#FF0033",
                color: "#fff",
                width: "22px",
                height: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 700,
                flexShrink: 0,
                padding: 0,
              }}
              title="Delete task"
            >
              ✕
            </button>
          )}
        </div>

        {/* Separator */}
        <div style={{ borderTop: "2px solid #000" }} />

        {/* Tags row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" }}>
          <span style={{ ...getOwnerStyle(task.owner), padding: "2px 8px", fontSize: "10px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
            {task.owner.toUpperCase()}
          </span>
          <span style={{ border: "2px solid #000", backgroundColor: "#fff", padding: "2px 8px", fontSize: "10px", fontWeight: 600 }}>
            {task.category}
          </span>
          <span style={{ ...getPriorityStyle(task.priority), padding: "2px 8px", fontSize: "10px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
            {task.priority.toUpperCase()}
          </span>
          <span style={{ ...getStatusStyle(task.status), padding: "2px 8px", fontSize: "10px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
            {getStatusLabel(task.status)}
          </span>
          {task.dueDate && (
            <span
              className={isOverdue(task.dueDate) ? "blink-red" : ""}
              style={{ ...dueStyle, padding: "2px 8px", fontSize: "10px", fontWeight: 600 }}
            >
              DUE {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <div style={{ fontSize: "12px", color: "#444", lineHeight: 1.5 }}>{task.description}</div>
        )}

        {/* Active work button */}
        {isCurrentUserActive ? (
          <button
            data-testid={`button-stop-work-${task.id}`}
            onClick={handleToggleActive}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#00CC44",
              border: "2px solid #000",
              boxShadow: "3px 3px 0 #000",
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span className="pulse-dot" style={{ width: "8px", height: "8px", backgroundColor: "#000", borderRadius: "50%", display: "inline-block" }} />
            YOU'RE ON THIS · CLICK TO STOP
          </button>
        ) : isSomeoneElseActive ? (
          <div style={{ border: "2px dashed #000", padding: "10px", fontSize: "12px", color: "#444", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "8px", height: "8px", backgroundColor: getStatusAccentColor("progress"), borderRadius: "50%" }} />
            <strong>{activeWorker.user}</strong> has been on this for {timeElapsed(activeWorker.startTime)}
          </div>
        ) : isOtherMembersTask ? (
          <div style={{ border: "2px dashed #ccc", padding: "10px", fontSize: "12px", color: "#999", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, textAlign: "center" }}>
            NO ACTIVE WORKER
          </div>
        ) : isMyTask ? (
          <button
            data-testid={`button-start-work-${task.id}`}
            onClick={handleToggleActive}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "transparent",
              border: "2px dashed #000",
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: "12px",
            }}
          >
            🎯 I'M WORKING ON THIS
          </button>
        ) : null}

        {/* Notes */}
        {isMyTask && !isOtherMembersTask ? (
          <textarea
            data-testid={`textarea-notes-${task.id}`}
            defaultValue={task.notes}
            onBlur={handleNotesBlur}
            placeholder="Add notes..."
            rows={2}
            style={{
              width: "100%",
              border: "2px solid #000",
              padding: "8px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              resize: "vertical",
              backgroundColor: "#fffdf5",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = "3px 3px 0 #FFE600"; }}
            onBlurCapture={(e) => { e.currentTarget.style.boxShadow = "none"; }}
          />
        ) : task.notes ? (
          <div style={{ border: "2px dashed #000", padding: "8px", fontSize: "12px", color: "#555", backgroundColor: "#fffdf5" }}>
            {task.notes}
          </div>
        ) : (
          <div style={{ border: "2px dashed #ccc", padding: "8px", fontSize: "12px", color: "#999", backgroundColor: "transparent", fontStyle: "italic" }}>
            No notes
          </div>
        )}

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Card Actions */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <div
              data-testid={`static-status-${task.id}`}
              style={{
                border: "2px solid #000",
                boxShadow: "2px 2px 0 #000",
                padding: "6px 12px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: "11px",
                backgroundColor: "#F5F0E8",
                color: "#000",
                minWidth: "100px",
                textAlign: "center",
              }}
            >
              {getStatusLabel(task.status)}
            </div>
            <div
              data-testid={`static-priority-${task.id}`}
              style={{
                border: "2px solid #000",
                boxShadow: "2px 2px 0 #000",
                padding: "6px 12px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "11px",
                backgroundColor: getPriorityStyle(task.priority).backgroundColor as string,
                color: getPriorityStyle(task.priority).color as string,
                minWidth: "100px",
                textAlign: "center",
              }}
            >
              {getPriorityIcon(task.priority)} {task.priority.toUpperCase()}
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              {OWNERS.map((owner) => (
                <div
                  data-testid={`static-assign-${owner}-${task.id}`}
                  key={owner}
                  style={{
                    padding: "4px 8px",
                    border: "2px solid #000",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: "10px",
                    ...(task.owner === owner ? getOwnerStyle(owner) : { backgroundColor: "#F5F0E8", color: "#000" }),
                    boxShadow: task.owner === owner ? "2px 2px 0 #000" : "none",
                    opacity: task.owner === owner ? 1 : 0.6,
                  }}
                >
                  {owner.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          {/* Card Bottom: comments + edit */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderTop: "2px solid #000", paddingTop: "8px" }}>
          <button
            data-testid={`button-comments-${task.id}`}
            onClick={() => setShowComments((v) => !v)}
            style={{
              padding: "4px 10px",
              border: "2px solid #000",
              backgroundColor: showComments ? "#000" : "#F5F0E8",
              color: showComments ? "#fff" : "#000",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "10px",
              cursor: "pointer",
            }}
          >
            COMMENTS ({task.comments.length})
          </button>
          {isMyTask && (
            <button
              data-testid={`button-edit-${task.id}`}
              onClick={() => setShowEditModal(true)}
              style={{
                padding: "4px 10px",
                border: "2px solid #000",
                backgroundColor: "#000",
                color: "#FFE600",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "10px",
                cursor: "pointer",
              }}
            >
              EDIT
            </button>
          )}
          {task.comments.length > 0 && !showComments && (
            <div style={{ fontSize: "11px", color: "#666", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {task.comments[task.comments.length - 1].text}
            </div>
          )}
        </div>
        </div>

        {/* Comments Panel */}
        {showComments && (
          <div style={{ border: "2px solid #000", backgroundColor: "#fff" }}>
            <div style={{ maxHeight: "150px", overflowY: "auto", padding: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {task.comments.length === 0 ? (
                <div style={{ fontSize: "12px", color: "#888" }}>No comments yet.</div>
              ) : (
                task.comments.map((c) => (
                  <div key={c.id} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <span style={{ ...getOwnerStyle(c.author), padding: "1px 6px", fontSize: "10px", fontWeight: 700, flexShrink: 0 }}>
                      {c.author.substring(0, 1)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px" }}>{c.text}</div>
                      <div style={{ fontSize: "10px", color: "#888" }}>{timeAgo(c.timestamp)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ borderTop: "2px solid #000", display: "flex" }}>
              <input
                data-testid={`input-comment-${task.id}`}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                placeholder="Write a comment..."
                style={{ flex: 1, border: "none", padding: "8px", fontFamily: "'Inter', sans-serif", fontSize: "12px", outline: "none" }}
              />
              <button
                data-testid={`button-send-comment-${task.id}`}
                onClick={handleSendComment}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#000",
                  color: "#FFE600",
                  border: "none",
                  borderLeft: "2px solid #000",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                SEND
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmPopup
        open={showDeleteConfirm}
        title="DELETE TASK"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      <EditTaskModal task={task} open={showEditModal} onClose={() => setShowEditModal(false)} />
    </div>
  );
}
