/**
 * Client-Side Persistent Account Vault
 * Ensures user accounts, workspaces, and credentials NEVER get lost or deleted
 * across logouts, browser sessions, or Vercel serverless container cold starts.
 */

export interface VaultAccount {
  id: string;
  name: string;
  email: string;
  color: string;
  roleTitle?: string;
  bioStatus?: string;
  passwordHash?: string;
  createdAt: number;
  lastLoginAt?: number;
  workspaces?: { workspace: any; role: string }[];
  tasks?: any[];
}

const VAULT_STORAGE_KEY = "bloc_accounts_vault_v2";
const LAST_EMAIL_KEY = "bloc_last_active_email";

export function getVaultAccounts(): Record<string, VaultAccount> {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function getVaultAccount(email: string): VaultAccount | null {
  if (!email) return null;
  const accounts = getVaultAccounts();
  const cleanEmail = email.trim().toLowerCase();
  return accounts[cleanEmail] || null;
}

export function saveVaultAccount(data: Partial<VaultAccount> & { email: string }): VaultAccount {
  const cleanEmail = data.email.trim().toLowerCase();
  const accounts = getVaultAccounts();
  const existing = accounts[cleanEmail] || {};

  const updated: VaultAccount = {
    id: data.id || existing.id || `usr_${Date.now()}`,
    name: (data.name !== undefined ? data.name : existing.name) || cleanEmail.split("@")[0],
    email: cleanEmail,
    color: data.color || existing.color || "#FFE600",
    roleTitle: data.roleTitle !== undefined ? data.roleTitle : existing.roleTitle,
    bioStatus: data.bioStatus !== undefined ? data.bioStatus : existing.bioStatus,
    passwordHash: data.passwordHash !== undefined ? data.passwordHash : existing.passwordHash,
    createdAt: existing.createdAt || data.createdAt || Date.now(),
    lastLoginAt: Date.now(),
    workspaces: data.workspaces || existing.workspaces || [],
    tasks: data.tasks || existing.tasks || [],
  };

  accounts[cleanEmail] = updated;

  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(accounts));
    setLastActiveEmail(cleanEmail);
  } catch (e) {
    console.warn("Failed to save to localStorage vault:", e);
  }

  return updated;
}

export function updateVaultAccountWorkspaces(email: string, workspaces: { workspace: any; role: string }[]) {
  if (!email || !Array.isArray(workspaces)) return;
  const cleanEmail = email.trim().toLowerCase();
  const accounts = getVaultAccounts();
  if (accounts[cleanEmail]) {
    accounts[cleanEmail].workspaces = workspaces;
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(accounts));
    } catch {}
  }
}

export function updateVaultAccountTasks(email: string, tasks: any[]) {
  if (!email || !Array.isArray(tasks)) return;
  const cleanEmail = email.trim().toLowerCase();
  const accounts = getVaultAccounts();
  if (accounts[cleanEmail]) {
    accounts[cleanEmail].tasks = tasks;
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(accounts));
    } catch {}
  }
}

export function setLastActiveEmail(email: string): void {
  try {
    if (email) {
      localStorage.setItem(LAST_EMAIL_KEY, email.trim().toLowerCase());
    }
  } catch {}
}

export function getLastActiveEmail(): string {
  try {
    return localStorage.getItem(LAST_EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

export function getSavedAccountsList(): VaultAccount[] {
  const accounts = getVaultAccounts();
  return Object.values(accounts).sort(
    (a, b) => (b.lastLoginAt || b.createdAt || 0) - (a.lastLoginAt || a.createdAt || 0)
  );
}
