import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel
  ? path.join("/tmp", "bloc-data")
  : path.resolve(__dirname, "../data");
const DB_FILE = path.join(DATA_DIR, "bloc.json");

export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  color: string;
  roleTitle?: string;
  bioStatus?: string;
  createdAt: number;
}

export interface DbWorkspace {
  id: string;
  name: string;
  category: string;
  description: string;
  inviteCode: string;
  ownerId: string;
  createdAt: number;
}

export interface DbWorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: number;
}

export interface DbComment {
  id: string;
  author: string;
  authorId?: string;
  text: string;
  timestamp: number;
}

export interface DbTask {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  owner: string; // User name or "Shared"
  assigneeId?: string | null;
  category: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "progress" | "testing" | "blocked" | "done";
  dueDate: string | null;
  notes: string;
  comments: DbComment[];
  pushedToGitHub: boolean;
  assignedBy: string;
  createdAt: number;
  doneAt?: number;
  activeWorker?: string | null;
  activeWorkerSince?: number | null;
  seenBy: Record<string, boolean>;
}

export interface DbInvite {
  id: string;
  workspaceId: string;
  code: string;
  email?: string;
  role: "member" | "admin";
  createdAt: number;
}

export interface DatabaseSchema {
  users: DbUser[];
  workspaces: DbWorkspace[];
  members: DbWorkspaceMember[];
  tasks: DbTask[];
  invites: DbInvite[];
}

const BRUTALIST_COLORS = [
  "#FFE600", // Yellow
  "#0055FF", // Blue
  "#00CC44", // Green
  "#FF0033", // Red
  "#9D00FF", // Purple
  "#FF6600", // Orange
  "#00D0E8", // Cyan
  "#FF00AA", // Pink
];

export function getRandomColor(): string {
  return BRUTALIST_COLORS[Math.floor(Math.random() * BRUTALIST_COLORS.length)];
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BLOC-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

class Database {
  private data: DatabaseSchema = {
    users: [],
    workspaces: [],
    members: [],
    tasks: [],
    invites: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (e) {
      console.error("Failed to load database file, initializing empty:", e);
      this.data = {
        users: [],
        workspaces: [],
        members: [],
        tasks: [],
        invites: [],
      };
      this.save();
    }
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), "utf-8");
      fs.renameSync(tmpFile, DB_FILE);
    } catch (e) {
      console.error("Failed to save database file:", e);
    }
  }

  // --- Users ---
  public findUserByEmail(email: string): DbUser | undefined {
    return this.data.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
  }

  public findUserById(id: string): DbUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public async createUser(name: string, email: string, passwordPlain: string): Promise<DbUser> {
    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    const user: DbUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      color: getRandomColor(),
      roleTitle: "Team Member",
      createdAt: Date.now(),
    };
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<DbUser>): DbUser | undefined {
    const user = this.findUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates);
    this.save();
    return user;
  }

  // --- Workspaces ---
  public createWorkspace(
    name: string,
    category: string,
    description: string,
    ownerId: string
  ): DbWorkspace {
    const workspaceId = `ws_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const inviteCode = generateInviteCode();
    const ws: DbWorkspace = {
      id: workspaceId,
      name: name.trim(),
      category: category.trim() || "General",
      description: description.trim() || "",
      inviteCode,
      ownerId,
      createdAt: Date.now(),
    };
    this.data.workspaces.push(ws);

    // Add owner as a member with 'owner' role
    this.data.members.push({
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      workspaceId,
      userId: ownerId,
      role: "owner",
      joinedAt: Date.now(),
    });

    this.save();
    return ws;
  }

  public findWorkspaceById(id: string): DbWorkspace | undefined {
    return this.data.workspaces.find((w) => w.id === id);
  }

  public findWorkspaceByInviteCode(code: string): DbWorkspace | undefined {
    return this.data.workspaces.find(
      (w) => w.inviteCode.toUpperCase() === code.trim().toUpperCase()
    );
  }

  public getUserWorkspaces(userId: string): { workspace: DbWorkspace; role: string }[] {
    const memberships = this.data.members.filter((m) => m.userId === userId);
    return memberships
      .map((m) => {
        const ws = this.findWorkspaceById(m.workspaceId);
        return ws ? { workspace: ws, role: m.role } : null;
      })
      .filter(Boolean) as { workspace: DbWorkspace; role: string }[];
  }

  public getWorkspaceMembers(workspaceId: string): {
    id: string;
    userId: string;
    name: string;
    email: string;
    color: string;
    roleTitle?: string;
    role: "owner" | "admin" | "member";
    joinedAt: number;
  }[] {
    const memberships = this.data.members.filter((m) => m.workspaceId === workspaceId);
    const seenUserIds = new Set<string>();
    const result: any[] = [];
    for (const m of memberships) {
      if (seenUserIds.has(m.userId)) continue;
      seenUserIds.add(m.userId);
      const user = this.findUserById(m.userId);
      if (!user) continue;
      result.push({
        id: m.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        color: user.color,
        roleTitle: user.roleTitle,
        role: m.role,
        joinedAt: m.joinedAt,
      });
    }
    return result;
  }

  public isMember(workspaceId: string, userId: string): boolean {
    return this.data.members.some(
      (m) => m.workspaceId === workspaceId && m.userId === userId
    );
  }

  public addMember(
    workspaceId: string,
    userId: string,
    role: "owner" | "admin" | "member" = "member"
  ): DbWorkspaceMember {
    const existing = this.data.members.find(
      (m) => m.workspaceId === workspaceId && m.userId === userId
    );
    if (existing) return existing;

    const mem: DbWorkspaceMember = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      workspaceId,
      userId,
      role,
      joinedAt: Date.now(),
    };
    this.data.members.push(mem);
    this.save();
    return mem;
  }

  // --- Invites ---
  public createInvite(
    workspaceId: string,
    email?: string,
    role: "member" | "admin" = "member"
  ): DbInvite {
    const invite: DbInvite = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      workspaceId,
      code: generateInviteCode(),
      email: email?.trim().toLowerCase(),
      role,
      createdAt: Date.now(),
    };
    this.data.invites.push(invite);
    this.save();
    return invite;
  }

  public getWorkspaceInvites(workspaceId: string): DbInvite[] {
    return this.data.invites.filter((i) => i.workspaceId === workspaceId);
  }

  // --- Tasks ---
  public getWorkspaceTasks(workspaceId: string): DbTask[] {
    return this.data.tasks.filter((t) => t.workspaceId === workspaceId);
  }

  public createTask(taskData: Omit<DbTask, "id" | "createdAt" | "seenBy">): DbTask {
    const task: DbTask = {
      ...taskData,
      id: `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      seenBy: {},
      comments: taskData.comments || [],
    };
    this.data.tasks.push(task);
    this.save();
    return task;
  }

  public updateTask(
    taskId: string,
    workspaceId: string,
    updates: Partial<DbTask>
  ): DbTask | undefined {
    const task = this.data.tasks.find(
      (t) => t.id === taskId && t.workspaceId === workspaceId
    );
    if (!task) return undefined;
    Object.assign(task, updates);
    this.save();
    return task;
  }

  public deleteTask(taskId: string, workspaceId: string): boolean {
    const initialLen = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter(
      (t) => !(t.id === taskId && t.workspaceId === workspaceId)
    );
    if (this.data.tasks.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public addComment(
    taskId: string,
    workspaceId: string,
    comment: DbComment
  ): DbTask | undefined {
    const task = this.data.tasks.find(
      (t) => t.id === taskId && t.workspaceId === workspaceId
    );
    if (!task) return undefined;
    task.comments = task.comments || [];
    task.comments.push(comment);
    this.save();
    return task;
  }

  public setActiveWorker(
    taskId: string,
    workspaceId: string,
    workerName: string | null,
    sinceTime?: number | null
  ): DbTask | undefined {
    const task = this.data.tasks.find(
      (t) => t.id === taskId && t.workspaceId === workspaceId
    );
    if (!task) return undefined;
    task.activeWorker = workerName;
    task.activeWorkerSince = workerName ? sinceTime || Date.now() : null;
    this.save();
    return task;
  }

  public markSeen(taskId: string, workspaceId: string, userId: string): void {
    const task = this.data.tasks.find(
      (t) => t.id === taskId && t.workspaceId === workspaceId
    );
    if (task) {
      task.seenBy = task.seenBy || {};
      task.seenBy[userId] = true;
      this.save();
    }
  }
}

export const db = new Database();
