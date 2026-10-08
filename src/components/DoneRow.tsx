import { Task } from "@/lib/task-context";
import { useTaskContext } from "@/lib/task-context";
import { getOwnerStyle, timeAgo } from "@/lib/helpers";

interface DoneRowProps {
  task: Task;
}

export default function DoneRow({ task }: DoneRowProps) {
  const { state, dispatch } = useTaskContext();
  const isOtherMembersTask = task.owner !== state.currentUser && task.owner !== "Shared";

  function handleTogglePushed() {
    if (isOtherMembersTask) return;
    dispatch({ type: "TOGGLE_PUSHED", payload: task.id });
  }

  function handleUndo() {
    if (isOtherMembersTask) return;
    dispatch({ type: "UPDATE_TASK", payload: { id: task.id, status: "todo", doneAt: undefined } });
  }

  const completedTime = task.doneAt ? timeAgo(task.doneAt) : timeAgo(task.createdAt);

  return (
    <div
      data-testid={`row-done-${task.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        border: "2px solid #000",
        backgroundColor: "#F5F0E8",
        boxShadow: "3px 3px 0 #000",
      }}
    >
      {/* Green check */}
      <div style={{ width: "20px", height: "20px", backgroundColor: "#00CC44", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "12px", fontWeight: 700 }}>
        ✓
      </div>
      {/* Title strikethrough */}
      <div style={{ flex: 1, minWidth: 0, textDecoration: "line-through", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "13px", color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {task.title}
      </div>
      {/* Completed time ago — fixed width */}
      <span style={{ fontSize: "10px", color: "#888", flexShrink: 0, width: "52px", textAlign: "right", fontFamily: "'Space Grotesk', sans-serif" }}>
        {completedTime}
      </span>
      {/* Owner badge */}
      <span style={{ ...getOwnerStyle(task.owner), padding: "2px 0", fontSize: "10px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0, width: "52px", textAlign: "center", display: "inline-block" }}>
        {task.owner.toUpperCase()}
      </span>
      {/* Category */}
      <span style={{ border: "2px solid #000", padding: "2px 0", fontSize: "10px", fontWeight: 600, backgroundColor: "#fff", flexShrink: 0, width: "72px", textAlign: "center", display: "inline-block" }}>
        {task.category}
      </span>
      {/* Pushed to GitHub toggle */}
      <button
        data-testid={`button-pushed-done-${task.id}`}
        onClick={handleTogglePushed}
        disabled={isOtherMembersTask}
        style={{
          border: "2px solid #000",
          padding: "2px 6px",
          fontSize: "10px",
          fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          backgroundColor: task.pushedToGitHub ? "#fff" : "#333",
          color: task.pushedToGitHub ? "#000" : "#fff",
          cursor: isOtherMembersTask ? "not-allowed" : "pointer",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          opacity: isOtherMembersTask ? 0.6 : 1,
        }}
      >
        <svg viewBox="0 0 16 16" width="12" height="12" style={{ flexShrink: 0 }}>
          <path fill={task.pushedToGitHub ? "#000" : "#fff"} d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        {task.pushedToGitHub ? "Pushed to GitHub" : "Push to GitHub"}
      </button>
      {/* Undo button */}
      <button
        onClick={handleUndo}
        disabled={isOtherMembersTask}
        title={isOtherMembersTask ? "Cannot undo other member's task" : "Move back to todo"}
        style={{
          border: "2px solid #000",
          padding: "2px 6px",
          fontSize: "10px",
          fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          backgroundColor: "#FF0033",
          color: "#fff",
          cursor: isOtherMembersTask ? "not-allowed" : "pointer",
          flexShrink: 0,
          opacity: isOtherMembersTask ? 0.6 : 1,
        }}
      >
        UNDO
      </button>
    </div>
  );
}
