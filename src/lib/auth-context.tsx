import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  color: string;
  roleTitle?: string;
  bioStatus?: string;
  createdAt: number;
}

export interface Workspace {
  id: string;
  name: string;
  category: string;
  description: string;
  inviteCode: string;
  ownerId: string;
  createdAt: number;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  color: string;
  roleTitle?: string;
  role: "owner" | "admin" | "member";
  joinedAt: number;
}

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  code: string;
  email?: string;
  role: "member" | "admin";
  createdAt: number;
}

export interface AuthContextType {
  user: User | null;
  workspaces: { workspace: Workspace; role: string }[];
  currentWorkspace: Workspace | null;
  currentRole: string;
  members: WorkspaceMember[];
  invites: WorkspaceInvite[];
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; roleTitle?: string; bioStatus?: string; currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; error?: string }>;
  createWorkspace: (name: string, category: string, description?: string) => Promise<{ success: boolean; workspace?: Workspace; error?: string }>;
  joinWorkspace: (inviteCode: string) => Promise<{ success: boolean; workspace?: Workspace; error?: string }>;
  selectWorkspace: (workspaceId: string) => void;
  createInvite: (email?: string, role?: "member" | "admin") => Promise<{ success: boolean; invite?: WorkspaceInvite; error?: string }>;
  refreshWorkspace: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("bloc_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [workspaces, setWorkspaces] = useState<{ workspace: Workspace; role: string }[]>(() => {
    try {
      const saved = localStorage.getItem("bloc_workspaces");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(() => {
    try {
      const savedWs = localStorage.getItem("bloc_current_workspace");
      if (savedWs) return JSON.parse(savedWs);
      const savedList = localStorage.getItem("bloc_workspaces");
      if (savedList) {
        const list = JSON.parse(savedList);
        return list[0]?.workspace || null;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem("bloc_user") && Boolean(localStorage.getItem("bloc_token"));
  });

  const getHeaders = (extra?: Record<string, string>): Record<string, string> => {
    const headers: Record<string, string> = { ...extra };
    const token = localStorage.getItem("bloc_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const safeParseResponse = async (
    res: Response,
    fallbackErrorMessage = "Request failed"
  ): Promise<{ ok: boolean; data: any; error?: string }> => {
    const contentType = res.headers.get("content-type") || "";
    let data: any = null;

    if (contentType.includes("application/json")) {
      try {
        data = await res.json();
      } catch (err: any) {
        return {
          ok: false,
          data: null,
          error: "Server returned invalid response. Please try again.",
        };
      }
    } else {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        data: null,
        error:
          res.status === 404
            ? "API service unavailable. Please check deployment."
            : text && text.length < 100
            ? text
            : `${fallbackErrorMessage} (${res.status})`,
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        data,
        error: data?.error || `${fallbackErrorMessage} (${res.status})`,
      };
    }

    return { ok: true, data };
  };

  // Fetch current user & workspaces
  const refreshMe = useCallback(async () => {
    try {
      const token = localStorage.getItem("bloc_token");
      const headers = getHeaders();
      const res = await fetch("/api/auth/me", { headers });

      // Guard against non-JSON responses (e.g. static HTML fallback)
      const contentType = res.headers.get("content-type");
      if (contentType && !contentType.includes("application/json")) {
        console.warn("Auth endpoint returned non-JSON response");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("bloc_user", JSON.stringify(data.user));
        setWorkspaces(data.workspaces || []);
        localStorage.setItem("bloc_workspaces", JSON.stringify(data.workspaces || []));

        // Pick current workspace if none or if current workspace is not in the list
        if (data.workspaces && data.workspaces.length > 0) {
          const savedWsId = localStorage.getItem("bloc_current_workspace_id");
          const found = data.workspaces.find((w: any) => w.workspace.id === savedWsId);
          if (found) {
            setCurrentWorkspace(found.workspace);
            localStorage.setItem("bloc_current_workspace", JSON.stringify(found.workspace));
          } else {
            setCurrentWorkspace(data.workspaces[0].workspace);
            localStorage.setItem("bloc_current_workspace_id", data.workspaces[0].workspace.id);
            localStorage.setItem("bloc_current_workspace", JSON.stringify(data.workspaces[0].workspace));
          }
        } else {
          setCurrentWorkspace(null);
          localStorage.removeItem("bloc_current_workspace");
          localStorage.removeItem("bloc_current_workspace_id");
        }
      } else if (res.status === 401 && token) {
        // Real session expiration
        localStorage.removeItem("bloc_token");
        localStorage.removeItem("bloc_user");
        localStorage.removeItem("bloc_workspaces");
        localStorage.removeItem("bloc_current_workspace");
        localStorage.removeItem("bloc_current_workspace_id");
        setUser(null);
        setWorkspaces([]);
        setCurrentWorkspace(null);
      }
    } catch (e) {
      console.warn("Failed to refresh user session:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch active workspace details (members, invites)
  const refreshWorkspace = useCallback(async () => {
    if (!currentWorkspace) {
      setMembers([]);
      setInvites([]);
      return;
    }
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}`, {
        headers: getHeaders(),
      });
      const contentType = res.headers.get("content-type");
      if (contentType && !contentType.includes("application/json")) return;

      if (res.ok) {
        const data = await res.json();
        setCurrentWorkspace(data.workspace);
        localStorage.setItem("bloc_current_workspace", JSON.stringify(data.workspace));
        setMembers(data.members || []);
        setInvites(data.invites || []);
      }
    } catch (e) {
      console.warn("Failed to refresh workspace:", e);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    if (currentWorkspace?.id) {
      refreshWorkspace();
    }
  }, [currentWorkspace?.id, refreshWorkspace]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const parsed = await safeParseResponse(res, "Failed to log in");
      if (!parsed.ok) {
        return { success: false, error: parsed.error || "Failed to log in" };
      }
      const data = parsed.data;
      if (data.token) {
        localStorage.setItem("bloc_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("bloc_user", JSON.stringify(data.user));
      }
      setUser(data.user);
      await refreshMe();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const parsed = await safeParseResponse(res, "Failed to create account");
      if (!parsed.ok) {
        return { success: false, error: parsed.error || "Failed to create account" };
      }
      const data = parsed.data;
      if (data.token) {
        localStorage.setItem("bloc_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("bloc_user", JSON.stringify(data.user));
      }
      setUser(data.user);
      await refreshMe();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: getHeaders(),
      });
    } catch {}
    localStorage.removeItem("bloc_token");
    localStorage.removeItem("bloc_user");
    localStorage.removeItem("bloc_workspaces");
    localStorage.removeItem("bloc_current_workspace");
    localStorage.removeItem("bloc_current_workspace_id");
    setUser(null);
    setWorkspaces([]);
    setCurrentWorkspace(null);
    setMembers([]);
    setInvites([]);
  };

  const updateProfile = async (updates: {
    name?: string;
    roleTitle?: string;
    bioStatus?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(updates),
      });
      const parsed = await safeParseResponse(res, "Failed to update profile");
      if (!parsed.ok) {
        return { success: false, error: parsed.error || "Failed to update profile" };
      }
      const data = parsed.data;
      setUser(data.user);
      localStorage.setItem("bloc_user", JSON.stringify(data.user));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Failed to update profile" };
    }
  };

  const createWorkspace = async (name: string, category: string, description?: string) => {
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ name, category, description }),
      });
      const parsed = await safeParseResponse(res, "Failed to create workspace");
      if (!parsed.ok) {
        return { success: false, error: parsed.error || "Failed to create workspace" };
      }
      const data = parsed.data;
      localStorage.setItem("bloc_current_workspace_id", data.workspace.id);
      localStorage.setItem("bloc_current_workspace", JSON.stringify(data.workspace));
      setCurrentWorkspace(data.workspace);
      await refreshMe();
      return { success: true, workspace: data.workspace };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const joinWorkspace = async (inviteCode: string) => {
    try {
      const res = await fetch("/api/workspaces/join", {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ inviteCode }),
      });
      const parsed = await safeParseResponse(res, "Failed to join workspace");
      if (!parsed.ok) {
        return { success: false, error: parsed.error || "Failed to join workspace" };
      }
      const data = parsed.data;
      localStorage.setItem("bloc_current_workspace_id", data.workspace.id);
      localStorage.setItem("bloc_current_workspace", JSON.stringify(data.workspace));
      setCurrentWorkspace(data.workspace);
      await refreshMe();
      return { success: true, workspace: data.workspace };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const selectWorkspace = (workspaceId: string) => {
    const found = workspaces.find((w) => w.workspace.id === workspaceId);
    if (found) {
      setCurrentWorkspace(found.workspace);
      localStorage.setItem("bloc_current_workspace_id", found.workspace.id);
      localStorage.setItem("bloc_current_workspace", JSON.stringify(found.workspace));
    }
  };

  const createInvite = async (email?: string, role: "member" | "admin" = "member") => {
    if (!currentWorkspace) return { success: false, error: "No workspace selected" };
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/invites`, {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ email, role }),
      });
      const parsed = await safeParseResponse(res, "Failed to create invite");
      if (!parsed.ok) {
        return { success: false, error: parsed.error || "Failed to create invite" };
      }
      const data = parsed.data;
      setInvites((prev) => [data.invite, ...prev]);
      return { success: true, invite: data.invite };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const currentRole =
    workspaces.find((w) => w.workspace.id === currentWorkspace?.id)?.role || "member";

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        currentWorkspace,
        currentRole,
        members,
        invites,
        loading,
        login,
        register,
        logout,
        updateProfile,
        createWorkspace,
        joinWorkspace,
        selectWorkspace,
        createInvite,
        refreshWorkspace,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
