import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { dbRef, db, auth, onAuthStateChanged, onValue, set, push, update, remove } from './firebase';
import { seedIfEmpty } from './seed-data';

export type User = "Musab" | "Yusha" | "Shared";
export type Priority = "high" | "medium" | "low";
export type Status = "todo" | "progress" | "testing" | "blocked" | "done";

export interface Comment {
  id: string;
  author: User;
  text: string;
  timestamp: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  owner: User;
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
  user: User;
  startTime: number;
}

export interface AppState {
  tasks: Task[];
  currentUser: "Musab" | "Yusha";
  seenTaskIds: Set<string>;
  activeWorkers: ActiveWorker[];
}

export type Action =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'UPDATE_TASK'; payload: Partial<Task> & { id: string } }
  | { type: 'SET_ACTIVE_WORKER'; payload: { taskId: string; user: User; startTime: number } }
  | { type: 'CLEAR_ACTIVE_WORKER'; payload: string }
  | { type: 'ADD_COMMENT'; payload: { taskId: string; comment: Comment } }
  | { type: 'UPDATE_NOTES'; payload: { taskId: string; notes: string } }
  | { type: 'TOGGLE_PUSHED'; payload: string }
  | { type: 'MARK_SEEN'; payload: string[] }
  | { type: 'SET_CURRENT_USER'; payload: "Musab" | "Yusha" }
  | { type: 'SET_STATE_FROM_FIREBASE'; payload: { tasks: Task[]; activeWorkers: ActiveWorker[]; seenTaskIds: Set<string> } };

const initialState: AppState = {
  tasks: [],
  currentUser: "Musab",
  seenTaskIds: new Set<string>(),
  activeWorkers: []
};

function taskReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE_FROM_FIREBASE':
      return {
        ...state,
        tasks: action.payload.tasks,
        activeWorkers: action.payload.activeWorkers,
        seenTaskIds: action.payload.seenTaskIds,
      };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => {
          if (t.id !== action.payload.id) return t;
          const updated = { ...t, ...action.payload };
          if (action.payload.status === 'done' && t.status !== 'done') {
            updated.doneAt = Date.now();
          } else if (action.payload.status && action.payload.status !== 'done' && t.status === 'done') {
            updated.doneAt = undefined;
          }
          return updated;
        })
      };
    case 'SET_ACTIVE_WORKER':
      return {
        ...state,
        activeWorkers: [
          ...state.activeWorkers.filter(w => w.taskId !== action.payload.taskId && w.user !== action.payload.user),
          action.payload
        ]
      };
    case 'CLEAR_ACTIVE_WORKER':
      return {
        ...state,
        activeWorkers: state.activeWorkers.filter(w => w.taskId !== action.payload)
      };
    case 'ADD_COMMENT':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId
            ? { ...t, comments: [...t.comments, action.payload.comment] }
            : t
        )
      };
    case 'UPDATE_NOTES':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId ? { ...t, notes: action.payload.notes } : t
        )
      };
    case 'TOGGLE_PUSHED':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload ? { ...t, pushedToGitHub: !t.pushedToGitHub } : t
        )
      };
    case 'MARK_SEEN':
      return {
        ...state,
        seenTaskIds: new Set([...state.seenTaskIds, ...action.payload])
      };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    default:
      return state;
  }
}

const TaskContext = createContext<{
  state: AppState;
  dispatch: (action: Action) => void;
} | null>(null);

function capitalizeOwner(raw: string): User {
  if (!raw) return 'Musab';
  const lower = raw.toLowerCase();
  if (lower === 'yusha') return 'Yusha';
  if (lower === 'shared') return 'Shared';
  return 'Musab';
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, reactDispatch] = useReducer(taskReducer, initialState);

  useEffect(() => {
    let unsubTasks: () => void = () => {};
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        const username = user.email.split('@')[0];
        let name: "Musab" | "Yusha" = "Musab";
        if (username.toLowerCase() === "yusha") name = "Yusha";
        reactDispatch({ type: 'SET_CURRENT_USER', payload: name });

        unsubTasks = onValue(dbRef('tasks'), async (snap) => {
          const data = snap.val();
          if (!data || Object.keys(data).length === 0) {
            await seedIfEmpty();
          } else {
            const tasksArray: Task[] = [];
            const activeWorkers: ActiveWorker[] = [];
            const seenTaskIds = new Set<string>();

            Object.values(data).forEach((t: any) => {
              const commentsArray: Comment[] = t.comments ? Object.values(t.comments) : [];
              tasksArray.push({
                id: t.id,
                title: t.title || '',
                description: t.description || t.desc || '',
                owner: capitalizeOwner(t.owner),
                category: t.category || t.cat || '',
                priority: t.priority as Priority,
                status: t.status as Status,
                dueDate: t.dueDate || t.due || null,
                notes: t.notes || '',
                comments: commentsArray,
                pushedToGitHub: t.pushedToGitHub || t.pushed || false,
                assignedBy: t.assignedBy || '',
                createdAt: t.createdAt || Date.now(),
                doneAt: t.doneAt || undefined,
              });

              if (t.activeWorker) {
                activeWorkers.push({
                  taskId: t.id,
                  user: capitalizeOwner(t.activeWorker),
                  startTime: t.activeWorkerSince || Date.now()
                });
              }

              if (t.seenBy && t.seenBy[name.toLowerCase()]) {
                seenTaskIds.add(t.id);
              }
            });

            reactDispatch({ 
              type: 'SET_STATE_FROM_FIREBASE', 
              payload: { tasks: tasksArray, activeWorkers, seenTaskIds } 
            });
          }
        });
      }
    });

    return () => {
      unsubAuth();
      unsubTasks();
    };
  }, []);

  const dispatch = async (action: Action) => {
    // Optimistic UI update
    reactDispatch(action);

    // Firebase sync
    try {
      switch (action.type) {
        case 'ADD_TASK': {
          const newRef = push(dbRef('tasks'));
          const taskToSave = { ...action.payload, id: newRef.key };
          await set(newRef, taskToSave);
          break;
        }
        case 'DELETE_TASK': {
          await remove(dbRef(`tasks/${action.payload}`));
          break;
        }
        case 'UPDATE_TASK': {
          const currentTask = state.tasks.find(t => t.id === action.payload.id);
          const updates: Record<string, any> = { ...action.payload };

          // When marking as done, set doneAt timestamp
          if (action.payload.status === 'done' && currentTask?.status !== 'done') {
            updates.doneAt = Date.now();
            updates.doneBy = state.currentUser;
          }

          // When undoing from done, explicitly null out doneAt/doneBy (undefined is ignored by Firebase)
          if (action.payload.status && action.payload.status !== 'done' && currentTask?.status === 'done') {
            updates.doneAt = null;
            updates.doneBy = null;
          }

          // Remove undefined values since Firebase ignores them
          Object.keys(updates).forEach(key => {
            if (updates[key] === undefined) updates[key] = null;
          });

          await update(dbRef(`tasks/${action.payload.id}`), updates);
          break;
        }
        case 'SET_ACTIVE_WORKER': {
          await update(dbRef(`tasks/${action.payload.taskId}`), {
            activeWorker: action.payload.user,
            activeWorkerSince: action.payload.startTime
          });
          break;
        }
        case 'CLEAR_ACTIVE_WORKER': {
          await update(dbRef(`tasks/${action.payload}`), {
            activeWorker: null,
            activeWorkerSince: null
          });
          break;
        }
        case 'ADD_COMMENT': {
          const commentRef = dbRef(`tasks/${action.payload.taskId}/comments/${action.payload.comment.id}`);
          await set(commentRef, action.payload.comment);
          break;
        }
        case 'UPDATE_NOTES': {
          await update(dbRef(`tasks/${action.payload.taskId}`), { notes: action.payload.notes });
          break;
        }
        case 'TOGGLE_PUSHED': {
          const task = state.tasks.find(t => t.id === action.payload);
          if (task) {
            await update(dbRef(`tasks/${action.payload}`), { pushedToGitHub: !task.pushedToGitHub });
          }
          break;
        }
        case 'MARK_SEEN': {
          const updates: any = {};
          action.payload.forEach(id => {
            updates[`tasks/${id}/seenBy/${state.currentUser.toLowerCase()}`] = true;
          });
          await update(dbRef('/'), updates);
          break;
        }
      }
    } catch (e) {
      console.error("Firebase update error:", e);
    }
  };

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
