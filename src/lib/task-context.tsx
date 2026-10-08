import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { useAuth } from "./auth-context";

export type Priority = "high" | "medium" | "low";
export type Status = "todo" | "progress" | "testing" | "blocked" | "done";

export interface Comment {
  id: string;
  author: string;
  authorId?: string;
  text: string;
  timestamp: number;
}

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  owner: string; // Member name or "Shared"
  assigneeId?: string | null;
  category: string;
  priority: Priority;
  status: Status;
  dueDate: string | null;
  notes: string;
  comments: Comment[];
  pushedToGitHub: boolean;
  assignedBy: string;
  createdAt: number;
  doneAt?: number;
}

export interface ActiveWorker {
  taskId: string;
  user: string;
  startTime: number;
}

export interface AppState {
  tasks: Task[];
  currentUser: string;
  seenTaskIds: Set<string>;
  activeWorkers: ActiveWorker[];
  loading: boolean;
}

export type Action =
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "UPDATE_TASK"; payload: Partial<Task> & { id: string } }
  | { type: "SET_ACTIVE_WORKER"; payload: { taskId: string; user: string; startTime: number } }
  | { type: "CLEAR_ACTIVE_WORKER"; payload: string }
  | { type: "ADD_COMMENT"; payload: { taskId: string; comment: Comment } }
  | { type: "UPDATE_NOTES"; payload: { taskId: string; notes: string } }
  | { type: "TOGGLE_PUSHED"; payload: string }
  | { type: "MARK_SEEN"; payload: string[] }
  | { type: "SET_CURRENT_USER"; payload: string }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: AppState = {
  tasks: [],
  currentUser: "Team Member",
  seenTaskIds: new Set<string>(),
  activeWorkers: [],
  loading: false,
};

function taskReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_TASKS": {
      const activeWorkers: ActiveWorker[] = [];
      const seenTaskIds = new Set<string>();

      action.payload.forEach((t) => {
        if ((t as any).activeWorker) {
          activeWorkers.push({
            taskId: t.id,
            user: (t as any).activeWorker,
            startTime: (t as any).activeWorkerSince || Date.now(),
          });
        }
        if ((t as any).seenBy && (t as any).seenBy[state.currentUser.toLowerCase()]) {
          seenTaskIds.add(t.id);
        }
      });

      return {
        ...state,
        tasks: action.payload,
        activeWorkers,
        seenTaskIds,
        loading: false,
      };
    }
    case "ADD_TASK":
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case "DELETE_TASK":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== action.payload.id) return t;
          const updated = { ...t, ...action.payload };
          if (action.payload.status === "done" && t.status !== "done") {
            updated.doneAt = Date.now();
          } else if (action.payload.status && action.payload.status !== "done" && t.status === "done") {
            updated.doneAt = undefined;
          }
          return updated;
        }),
      };
    case "SET_ACTIVE_WORKER":
      return {
        ...state,
        activeWorkers: [
          ...state.activeWorkers.filter(
            (w) => w.taskId !== action.payload.taskId && w.user !== action.payload.user
          ),
          action.payload,
        ],
      };
    case "CLEAR_ACTIVE_WORKER":
      return {
        ...state,
        activeWorkers: state.activeWorkers.filter((w) => w.taskId !== action.payload),
      };
    case "ADD_COMMENT":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.taskId
            ? { ...t, comments: [...(t.comments || []), action.payload.comment] }
            : t
        ),
      };
    case "UPDATE_NOTES":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.taskId ? { ...t, notes: action.payload.notes } : t
        ),
      };
    case "TOGGLE_PUSHED":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload ? { ...t, pushedToGitHub: !t.pushedToGitHub } : t
        ),
      };
    case "MARK_SEEN":
      return {
        ...state,
        seenTaskIds: new Set([...state.seenTaskIds, ...action.payload]),
      };
    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

const TaskContext = createContext<{
  state: AppState;
  dispatch: (action: Action) => void;
  refreshTasks: () => Promise<void>;
} | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { currentWorkspace, user } = useAuth();
  const [state, reactDispatch] = useReducer(taskReducer, initialState);

  // Sync current user name into task state
  useEffect(() => {
    if (user?.name) {
      reactDispatch({ type: "SET_CURRENT_USER", payload: user.name });
    }
  }, [user?.name]);

  // Fetch tasks whenever active workspace changes
  const fetchTasks = useCallback(async () => {
    if (!currentWorkspace?.id) {
      reactDispatch({ type: "SET_TASKS", payload: [] });
      return;
    }

    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/tasks`);
      if (res.ok) {
        const data = await res.json();
        reactDispatch({ type: "SET_TASKS", payload: data.tasks || [] });
      }
    } catch (e) {
      console.warn("Failed to fetch tasks:", e);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchTasks();
    // Periodic refresh for team collaboration
    const interval = setInterval(fetchTasks, 6000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const dispatch = async (action: Action) => {
    // 1. Optimistic React update
    reactDispatch(action);

    if (!currentWorkspace?.id) return;
    const wsId = currentWorkspace.id;

    // 2. Persist to server API
    try {
      switch (action.type) {
        case "ADD_TASK": {
          await fetch(`/api/workspaces/${wsId}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action.payload),
          });
          break;
        }
        case "DELETE_TASK": {
          await fetch(`/api/workspaces/${wsId}/tasks/${action.payload}`, {
            method: "DELETE",
          });
          break;
        }
        case "UPDATE_TASK": {
          await fetch(`/api/workspaces/${wsId}/tasks/${action.payload.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action.payload),
          });
          break;
        }
        case "SET_ACTIVE_WORKER": {
          await fetch(`/api/workspaces/${wsId}/tasks/${action.payload.taskId}/active-worker`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: true, since: action.payload.startTime }),
          });
          break;
        }
        case "CLEAR_ACTIVE_WORKER": {
          await fetch(`/api/workspaces/${wsId}/tasks/${action.payload}/active-worker`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: false }),
          });
          break;
        }
        case "ADD_COMMENT": {
          await fetch(`/api/workspaces/${wsId}/tasks/${action.payload.taskId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: action.payload.comment.text }),
          });
          break;
        }
        case "UPDATE_NOTES": {
          await fetch(`/api/workspaces/${wsId}/tasks/${action.payload.taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notes: action.payload.notes }),
          });
          break;
        }
        case "TOGGLE_PUSHED": {
          const current = state.tasks.find((t) => t.id === action.payload);
          if (current) {
            await fetch(`/api/workspaces/${wsId}/tasks/${action.payload}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ pushedToGitHub: !current.pushedToGitHub }),
            });
          }
          break;
        }
        case "MARK_SEEN": {
          for (const taskId of action.payload) {
            fetch(`/api/workspaces/${wsId}/tasks/${taskId}/seen`, { method: "POST" }).catch(() => {});
          }
          break;
        }
      }
    } catch (e) {
      console.warn("Failed to sync task change to server:", e);
    }
  };

  return (
    <TaskContext.Provider value={{ state, dispatch, refreshTasks: fetchTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}
