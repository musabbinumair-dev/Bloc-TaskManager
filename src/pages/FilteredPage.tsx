import { useTaskContext } from "@/lib/task-context";
import { Task } from "@/lib/task-context";
import TaskBoard from "@/components/TaskBoard";

type FilterType = "progress" | "blocked" | "done";

const CONFIG: Record<FilterType, { icon: string; label: string; color: string }> = {
  progress: { icon: "▶", label: "IN PROGRESS", color: "#0055FF" },
  blocked: { icon: "✕", label: "BLOCKED", color: "#FF0033" },
  done: { icon: "✓", label: "DONE", color: "#00CC44" },
};

interface FilteredPageProps {
  filter: FilterType;
}

export default function FilteredPage({ filter }: FilteredPageProps) {
  const { state } = useTaskContext();
  const config = CONFIG[filter];
  const tasks = state.tasks.filter((t) => t.status === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "3px solid #000", backgroundColor: "#000", color: "#FFE600", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <div style={{ width: "36px", height: "36px", backgroundColor: config.color, border: "3px solid #FFE600", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#fff" }}>
          {config.icon}
        </div>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "18px", letterSpacing: "0.05em" }}>{config.label}</div>
          <div style={{ fontSize: "12px", color: "#FFE600AA" }}>{tasks.length} task{tasks.length !== 1 ? "s" : ""}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {tasks.length === 0 ? (
          <div style={{ border: "3px dashed #ccc", padding: "40px", textAlign: "center", color: "#999", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
            NO TASKS IN THIS VIEW
          </div>
        ) : (
          <TaskBoard tasks={tasks} />
        )}
      </div>
    </div>
  );
}
