import { Task } from "@/lib/task-context";
import { useTaskContext } from "@/lib/task-context";
import TaskCard from "./TaskCard";
import DoneRow from "./DoneRow";
import { getStatusAccentColor } from "@/lib/helpers";

const ORDER: Task["status"][] = ["blocked", "progress", "testing", "todo", "done"];
const LABELS: Record<Task["status"], string> = {
  blocked: "BLOCKED",
  progress: "IN PROGRESS",
  testing: "IN TESTING",
  todo: "TO DO",
  done: "DONE",
};
const BADGE_COLORS: Record<Task["status"], string> = {
  blocked: "#FF0033",
  progress: "#0055FF",
  testing: "#9D00FF",
  todo: "#AAAAAA",
  done: "#00CC44",
};

interface TaskBoardProps {
  tasks: Task[];
  showNewAssignments?: boolean;
  showCurrentlyActive?: boolean;
}

export default function TaskBoard({ tasks, showNewAssignments = false, showCurrentlyActive = false }: TaskBoardProps) {
  const { state, dispatch } = useTaskContext();

  // New assignments: assigned to current user by someone else and not yet seen
  const newlyAssigned = showNewAssignments
    ? tasks.filter(
        (t) =>
          (t.owner === state.currentUser || t.owner === "Shared") &&
          t.assignedBy !== state.currentUser &&
          !state.seenTaskIds.has(t.id) &&
          t.status !== "done"
      )
    : [];

  // Currently active: tasks current user is working on
  const currentlyActive = showCurrentlyActive
    ? tasks.filter((t) => state.activeWorkers.some((w) => w.taskId === t.id && w.user === state.currentUser))
    : [];

  // Mark newly assigned as seen when viewed
  if (newlyAssigned.length > 0) {
    const unseenIds = newlyAssigned.map((t) => t.id).filter((id) => !state.seenTaskIds.has(id));
    if (unseenIds.length > 0) {
      setTimeout(() => dispatch({ type: "MARK_SEEN", payload: unseenIds }), 2000);
    }
  }

  const newlyAssignedIds = new Set(newlyAssigned.map((t) => t.id));
  const currentlyActiveIds = new Set(currentlyActive.map((t) => t.id));

  const grouped: Record<Task["status"], Task[]> = {
    todo: [],
    progress: [],
    testing: [],
    blocked: [],
    done: [],
  };
  tasks.forEach((t) => {
    if (!newlyAssignedIds.has(t.id) && !currentlyActiveIds.has(t.id)) {
      grouped[t.status].push(t);
    }
  });

  // Sort done tasks by doneAt (or createdAt) descending - newest first
  grouped.done.sort((a, b) => {
    const aTime = a.doneAt ?? a.createdAt;
    const bTime = b.doneAt ?? b.createdAt;
    return bTime - aTime;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* New Assignments Banner */}
      {newlyAssigned.length > 0 && (
        <Section
          label={`🔔 NEW TASKS ASSIGNED TO YOU (${newlyAssigned.length})`}
          color="#FF00AA"
          tasks={newlyAssigned}
          isUnseen
          isDone={false}
        />
      )}

      {/* Currently Active Banner */}
      {currentlyActive.length > 0 && (
        <Section
          label={`🔥 YOU'RE CURRENTLY ON THIS`}
          color="#00CC44"
          tasks={currentlyActive}
          isUnseen={false}
          isDone={false}
        />
      )}

      {/* Regular status sections */}
      {ORDER.filter((s) => s !== "done").map((status) =>
        grouped[status].length > 0 ? (
          <Section
            key={status}
            label={LABELS[status]}
            color={BADGE_COLORS[status]}
            tasks={grouped[status]}
            isUnseen={false}
            isDone={false}
          />
        ) : null
      )}

      {/* Done section */}
      {grouped.done.length > 0 && (
        <Section
          label="DONE"
          color="#00CC44"
          tasks={grouped.done}
          isUnseen={false}
          isDone
        />
      )}
    </div>
  );
}

function Section({
  label,
  color,
  tasks,
  isUnseen,
  isDone,
}: {
  label: string;
  color: string;
  tasks: Task[];
  isUnseen: boolean;
  isDone: boolean;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <div
          style={{
            backgroundColor: "#000",
            color: "#fff",
            padding: "4px 12px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "12px",
            letterSpacing: "0.08em",
            border: "2px solid #000",
          }}
        >
          {label}
        </div>
        <div
          style={{
            backgroundColor: color,
            color: color === "#0055FF" || color === "#9D00FF" || color === "#FF0033" || color === "#FF00AA" ? "#fff" : "#000",
            padding: "4px 10px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "12px",
            border: "2px solid #000",
            boxShadow: "2px 2px 0 #FFE600",
          }}
        >
          {tasks.length}
        </div>
      </div>
      {isDone ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {tasks.map((t) => (
            <DoneRow key={t.id} task={t} />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} isUnseen={isUnseen} />
          ))}
        </div>
      )}
    </div>
  );
}
