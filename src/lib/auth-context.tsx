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
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<{ workspace: Workspace; role: string }[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch current user & workspaces
  const refreshMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setWorkspaces(data.workspaces || []);

        // Pick current workspace if none or if current workspace is not in the list
        if (data.workspaces && data.workspaces.length > 0) {
          const savedWsId = localStorage.getItem("bloc_current_workspace_id");
          const found = data.workspaces.find((w: any) => w.workspace.id === savedWsId);
          if (found) {
            setCurrentWorkspace(found.workspace);
          } else {
            setCurrentWorkspace(data.workspaces[0].workspace);
            localStorage.setItem("bloc_current_workspace_id", data.workspaces[0].workspace.id);
          }
        } else {
          setCurrentWorkspace(null);
        }
      } else {
        setUser(null);
        setWorkspaces([]);
        setCurrentWorkspace(null);
      }
    } catch (e) {
      setUser(null);
      setWorkspaces([]);
      setCurrentWorkspace(null);
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
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentWorkspace(data.workspace);
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
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to log in" };
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
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to create account" };
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
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to update profile" };
      }
      setUser(data.user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Failed to update profile" };
    }
  };

  const createWorkspace = async (name: string, category: string, description?: string) => {
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to create workspace" };
      }
      localStorage.setItem("bloc_current_workspace_id", data.workspace.id);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to join workspace" };
      }
      localStorage.setItem("bloc_current_workspace_id", data.workspace.id);
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
    }
  };

  const createInvite = async (email?: string, role: "member" | "admin" = "member") => {
    if (!currentWorkspace) return { success: false, error: "No workspace selected" };
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to create invite" };
      }
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
