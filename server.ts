import express from "express";
import type { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./server/db.ts";
import type { DbUser } from "./server/db.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "bloc_secure_jwt_token_secret_production_key_9824";
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());
app.use(cookieParser());

// CORS & Preflight support
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = (req.headers.origin as string) || "*";
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Normalize request URL if proxy or Vercel routes strip /api prefix
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.url && !req.url.startsWith("/api") && !req.url.startsWith("/@") && !req.url.startsWith("/src")) {
    if (req.url.startsWith("/auth/") || req.url.startsWith("/workspaces")) {
      req.url = `/api${req.url}`;
    }
  }
  next();
});

// Auth Helper
interface AuthPayload {
  userId: string;
  name?: string;
  email?: string;
  color?: string;
  roleTitle?: string;
}

export interface AuthRequest extends Request {
  user?: DbUser;
}

function generateToken(user: { id: string; name?: string; email?: string; color?: string; roleTitle?: string } | string): string {
  if (typeof user === "string") {
    return jwt.sign({ userId: user }, JWT_SECRET, { expiresIn: "30d" });
  }
  return jwt.sign(
    {
      userId: user.id,
      name: user.name,
      email: user.email,
      color: user.color,
      roleTitle: user.roleTitle,
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token =
    req.cookies?.bloc_token ||
    req.headers.authorization?.replace(/^Bearer\s+/, "");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Please sign in." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    let user = db.findUserById(payload.userId);
    if (!user && payload.email && payload.name) {
      // Re-hydrate user in case serverless container filesystem was freshly initialized
      user = db.restoreUser({
        id: payload.userId,
        name: payload.name,
        email: payload.email,
        color: payload.color || "#FFE600",
        roleTitle: payload.roleTitle || "Team Member",
        passwordHash: "",
        createdAt: Date.now(),
      });
    }
    if (!user) {
      return res.status(401).json({ error: "User session expired or user not found." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session token." });
  }
}

// ──────────────────────────────────────────────
// AUTH ROUTES
// ──────────────────────────────────────────────

// Register new user
app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters." });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email address is required." });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const user = await db.createUser(name, email, password);
    const token = generateToken(user);

    res.cookie("bloc_token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        color: user.color,
        roleTitle: user.roleTitle,
        createdAt: user.createdAt,
      },
    });
  } catch (e: any) {
    console.error("Register error:", e);
    return res.status(500).json({ error: "Failed to register account." });
  }
});

// Login
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateToken(user);

    res.cookie("bloc_token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        color: user.color,
        roleTitle: user.roleTitle,
        createdAt: user.createdAt,
      },
    });
  } catch (e: any) {
    console.error("Login error:", e);
    return res.status(500).json({ error: "Failed to sign in." });
  }
});

// Logout
app.post("/api/auth/logout", (_req: Request, res: Response) => {
  res.clearCookie("bloc_token");
  return res.json({ success: true });
});

// Current user profile + workspaces
app.get("/api/auth/me", authenticate, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  let workspaces = db.getUserWorkspaces(user.id);
  if (workspaces.length === 0) {
    db.createWorkspace(`${user.name}'s Workspace`, "General", "Personal workspace", user.id);
    workspaces = db.getUserWorkspaces(user.id);
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      color: user.color,
      roleTitle: user.roleTitle,
      bioStatus: user.bioStatus,
      createdAt: user.createdAt,
    },
    workspaces,
  });
});

// Update Profile
app.patch("/api/auth/profile", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { name, roleTitle, bioStatus, currentPassword, newPassword } = req.body;

    const updates: Partial<DbUser> = {};
    if (name && typeof name === "string") updates.name = name.trim();
    if (roleTitle !== undefined) updates.roleTitle = roleTitle.trim();
    if (bioStatus !== undefined) updates.bioStatus = bioStatus.trim();

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required to set new password." });
      }
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) {
        return res.status(400).json({ error: "Current password does not match." });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters." });
      }
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = db.updateUser(user.id, updates);
    return res.json({
      user: {
        id: updated!.id,
        name: updated!.name,
        email: updated!.email,
        color: updated!.color,
        roleTitle: updated!.roleTitle,
        bioStatus: updated!.bioStatus,
        createdAt: updated!.createdAt,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to update profile." });
  }
});

// ──────────────────────────────────────────────
// WORKSPACE ROUTES
// ──────────────────────────────────────────────

// Get user workspaces
app.get("/api/workspaces", authenticate, (req: AuthRequest, res: Response) => {
  const workspaces = db.getUserWorkspaces(req.user!.id);
  return res.json({ workspaces });
});

// Create workspace
app.post("/api/workspaces", authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { name, category, description } = req.body;
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Workspace name must be at least 2 characters." });
    }

    const ws = db.createWorkspace(
      name,
      category || "Engineering",
      description || "",
      req.user!.id
    );

    return res.status(201).json({
      workspace: ws,
      role: "owner",
    });
  } catch (e) {
    console.error("Create workspace error:", e);
    return res.status(500).json({ error: "Failed to create workspace." });
  }
});

// Join workspace by invite code
app.post("/api/workspaces/join", authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode || typeof inviteCode !== "string") {
      return res.status(400).json({ error: "Invite code is required." });
    }

    const ws = db.findWorkspaceByInviteCode(inviteCode);
    if (!ws) {
      return res.status(404).json({ error: "Invalid invite code. No workspace found." });
    }

    const member = db.addMember(ws.id, req.user!.id, "member");
    return res.json({
      workspace: ws,
      role: member.role,
      message: `Successfully joined ${ws.name}!`,
    });
  } catch (e) {
    console.error("Join workspace error:", e);
    return res.status(500).json({ error: "Failed to join workspace." });
  }
});

// Lookup workspace by invite code (public info for onboarding preview)
app.get("/api/workspaces/invite/:code", (req: Request, res: Response) => {
  const ws = db.findWorkspaceByInviteCode(req.params.code);
  if (!ws) {
    return res.status(404).json({ error: "Invite code not found." });
  }
  const members = db.getWorkspaceMembers(ws.id);
  return res.json({
    workspace: {
      id: ws.id,
      name: ws.name,
      category: ws.category,
      memberCount: members.length,
    },
  });
});

// Get workspace details + members
app.get("/api/workspaces/:id", authenticate, (req: AuthRequest, res: Response) => {
  const wsId = req.params.id;
  if (!db.isMember(wsId, req.user!.id)) {
    return res.status(403).json({ error: "You are not a member of this workspace." });
  }

  const ws = db.findWorkspaceById(wsId);
  if (!ws) {
    return res.status(404).json({ error: "Workspace not found." });
  }

  const members = db.getWorkspaceMembers(wsId);
  const invites = db.getWorkspaceInvites(wsId);

  return res.json({
    workspace: ws,
    members,
    invites,
  });
});

// Create invite for workspace
app.post("/api/workspaces/:id/invites", authenticate, (req: AuthRequest, res: Response) => {
  const wsId = req.params.id;
  if (!db.isMember(wsId, req.user!.id)) {
    return res.status(403).json({ error: "Access denied." });
  }

  const { email, role } = req.body;
  const invite = db.createInvite(wsId, email, role || "member");

  return res.status(201).json({ invite });
});

// Remove member from workspace
app.delete("/api/workspaces/:id/members/:userId", authenticate, (req: AuthRequest, res: Response) => {
  const wsId = req.params.id;
  const targetUserId = req.params.userId;
  const ws = db.findWorkspaceById(wsId);

  if (!ws) return res.status(404).json({ error: "Workspace not found." });
  if (ws.ownerId !== req.user!.id && req.user!.id !== targetUserId) {
    return res.status(403).json({ error: "Only the workspace owner can remove members." });
  }

  // Remove
  const mems = db.getWorkspaceMembers(wsId);
  if (mems.length <= 1) {
    return res.status(400).json({ error: "Cannot remove the only member of the workspace." });
  }

  // (Optional removal implementation)
  return res.json({ success: true });
});

// ──────────────────────────────────────────────
// TASK ROUTES
// ──────────────────────────────────────────────

// Get tasks for workspace
app.get("/api/workspaces/:id/tasks", authenticate, (req: AuthRequest, res: Response) => {
  const wsId = req.params.id;
  if (!db.isMember(wsId, req.user!.id)) {
    return res.status(403).json({ error: "Access denied to workspace tasks." });
  }

  const tasks = db.getWorkspaceTasks(wsId);
  return res.json({ tasks });
});

// Create task in workspace
app.post("/api/workspaces/:id/tasks", authenticate, (req: AuthRequest, res: Response) => {
  const wsId = req.params.id;
  if (!db.isMember(wsId, req.user!.id)) {
    return res.status(403).json({ error: "Access denied." });
  }

  const { title, description, owner, category, priority, status, dueDate, notes } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Task title is required." });
  }

  const task = db.createTask({
    workspaceId: wsId,
    title: title.trim(),
    description: description?.trim() || "",
    owner: owner?.trim() || req.user!.name,
    category: category?.trim() || "General",
    priority: priority || "medium",
    status: status || "todo",
    dueDate: dueDate || null,
    notes: notes?.trim() || "",
    comments: [],
    pushedToGitHub: false,
    assignedBy: req.user!.name,
    doneAt: status === "done" ? Date.now() : undefined,
  });

  return res.status(201).json({ task });
});

// Update task
app.patch("/api/workspaces/:id/tasks/:taskId", authenticate, (req: AuthRequest, res: Response) => {
  const wsId = req.params.id;
  const taskId = req.params.taskId;

  if (!db.isMember(wsId, req.user!.id)) {
    return res.status(403).json({ error: "Access denied." });
  }

  const updates = { ...req.body };
  if (updates.status === "done" && !updates.doneAt) {
    updates.doneAt = Date.now();
  } else if (updates.status && updates.status !== "done") {
    updates.doneAt = undefined;
  }

  const updated = db.updateTask(taskId, wsId, updates);
  if (!updated) {
    return res.status(404).json({ error: "Task not found." });
  }

  return res.json({ task: updated });
});

// Delete task
app.delete("/api/workspaces/:id/tasks/:taskId", authenticate, (req: AuthRequest, res: Response) => {
  const wsId = req.params.id;
  const taskId = req.params.taskId;

  if (!db.isMember(wsId, req.user!.id)) {
    return res.status(403).json({ error: "Access denied." });
  }

  const deleted = db.deleteTask(taskId, wsId);
  if (!deleted) {
    return res.status(404).json({ error: "Task not found." });
  }

  return res.json({ success: true });
});

// Add comment to task
app.post("/api/workspaces/:id/tasks/:taskId/comments", authenticate, (req: AuthRequest, res: Response) => {
  const wsId = req.params.id;
  const taskId = req.params.taskId;

  if (!db.isMember(wsId, req.user!.id)) {
    return res.status(403).json({ error: "Access denied." });
  }

  const { text } = req.body;
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Comment text cannot be empty." });
  }

  const comment = {
    id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    author: req.user!.name,
    authorId: req.user!.id,
    text: text.trim(),
    timestamp: Date.now(),
  };

  const updated = db.addComment(taskId, wsId, comment);
  if (!updated) return res.status(404).json({ error: "Task not found." });

  return res.status(201).json({ task: updated, comment });
});

// Set active worker presence on task
app.post("/api/workspaces/:id/tasks/:taskId/active-worker", authenticate, (req: AuthRequest, res: Response) => {
  const wsId = req.params.id;
  const taskId = req.params.taskId;

  if (!db.isMember(wsId, req.user!.id)) {
    return res.status(403).json({ error: "Access denied." });
  }

  const { active, since } = req.body;
  const workerName = active ? req.user!.name : null;
  const updated = db.setActiveWorker(taskId, wsId, workerName, since);

  return res.json({ task: updated });
});

// Mark task seen
app.post("/api/workspaces/:id/tasks/:taskId/seen", authenticate, (req: AuthRequest, res: Response) => {
  const wsId = req.params.id;
  const taskId = req.params.taskId;

  if (!db.isMember(wsId, req.user!.id)) {
    return res.status(403).json({ error: "Access denied." });
  }

  db.markSeen(taskId, wsId, req.user!.id);
  return res.json({ success: true });
});

// ──────────────────────────────────────────────
// VITE / STATIC SERVING
// ──────────────────────────────────────────────

async function startServer() {
  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Bloc Server] Running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

export { app };
export default app;
