import { useTaskContext } from "@/lib/task-context";
import { Task } from "@/lib/task-context";
import TaskBoard from "@/components/TaskBoard";
import { Activity, AlertOctagon, CheckSquare } from "@/lib/icons";

type FilterType = "progress" | "blocked" | "done";

const CONFIG: Record<FilterType, { icon: React.ElementType; label: string; color: string }> = {
  progress: { icon: Activity, label: "IN PROGRESS", color: "#0055FF" },
  blocked: { icon: AlertOctagon, label: "BLOCKED", color: "#FF0033" },
  done: { icon: CheckSquare, label: "DONE", color: "#00CC44" },
};

interface FilteredPageProps {
  filter: FilterType;
}

export default function FilteredPage({ filter }: FilteredPageProps) {
  const { state } = useTaskContext();
  const config = CONFIG[filter];
  const IconComponent = config.icon;
  const tasks = state.tasks.filter((t) => t.status === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="px-3.5 py-2.5 sm:px-5 sm:py-3.5 border-b-[3px] border-black bg-black text-[#FFE600] flex items-center gap-3 shrink-0">
        <div style={{ width: "32px", height: "32px", backgroundColor: config.color, border: "2px solid #FFE600", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <IconComponent size={18} strokeWidth={2.6} />
        </div>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "16px", letterSpacing: "0.05em" }}>{config.label}</div>
          <div style={{ fontSize: "11px", color: "#FFE600AA" }}>{tasks.length} task{tasks.length !== 1 ? "s" : ""}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
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
