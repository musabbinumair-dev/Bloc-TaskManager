import { Status, Priority } from "./task-context";
import React from "react";

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function timeElapsed(startTime: number): string {
  const diff = Date.now() - startTime;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h ${mins % 60}m`;
  return `${mins}m`;
}

const BRUTALIST_PALETTE = [
  { bg: "#FFE600", text: "#000" }, // Yellow
  { bg: "#0055FF", text: "#fff" }, // Blue
  { bg: "#00CC44", text: "#000" }, // Green
  { bg: "#FF0033", text: "#fff" }, // Red
  { bg: "#9D00FF", text: "#fff" }, // Purple
  { bg: "#FF8800", text: "#000" }, // Orange
  { bg: "#00D0E8", text: "#000" }, // Cyan
  { bg: "#FF00AA", text: "#fff" }, // Pink
];

export function getOwnerPalette(owner: string): { bg: string; text: string } {
  if (!owner || owner.toLowerCase() === "shared") {
    return { bg: "#00CC44", text: "#000" };
  }
  let hash = 0;
  for (let i = 0; i < owner.length; i++) {
    hash = owner.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BRUTALIST_PALETTE.length;
  return BRUTALIST_PALETTE[index];
}

export function getOwnerStyle(owner: string): React.CSSProperties {
  const p = getOwnerPalette(owner);
  return { backgroundColor: p.bg, color: p.text, border: "2px solid #000" };
}

export function getOwnerBg(owner: string): string {
  return getOwnerPalette(owner).bg;
}

export function getOwnerTextColor(owner: string): string {
  return getOwnerPalette(owner).text;
}

export function getStatusStyle(status: Status): React.CSSProperties {
  const map: Record<Status, React.CSSProperties> = {
    todo: { backgroundColor: "#CCCCCC", color: "#000", border: "2px solid #000" },
    progress: { backgroundColor: "#0055FF", color: "#fff", border: "2px solid #000" },
    testing: { backgroundColor: "#9D00FF", color: "#fff", border: "2px solid #000" },
    blocked: { backgroundColor: "#FF0033", color: "#fff", border: "2px solid #000" },
    done: { backgroundColor: "#00CC44", color: "#000", border: "2px solid #000" },
  };
  return map[status];
}

export function getStatusAccentColor(status: Status): string {
  const map: Record<Status, string> = {
    todo: "#CCCCCC",
    progress: "#0055FF",
    testing: "#9D00FF",
    blocked: "#FF0033",
    done: "#00CC44",
  };
  return map[status];
}

export function getStatusLabel(status: Status): string {
  const map: Record<Status, string> = {
    todo: "TO DO",
    progress: "IN PROGRESS",
    testing: "IN TESTING",
    blocked: "BLOCKED",
    done: "DONE",
  };
  return map[status];
}

export function getPriorityStyle(priority: Priority): React.CSSProperties {
  const map: Record<Priority, React.CSSProperties> = {
    high: { backgroundColor: "#FF0033", color: "#fff", border: "2px solid #000" },
    medium: { backgroundColor: "#FF8800", color: "#000", border: "2px solid #000" },
    low: { backgroundColor: "#00AA44", color: "#fff", border: "2px solid #000" },
  };
  return map[priority];
}

export function getPriorityIcon(priority: Priority): string {
  if (priority === "high") return "▲▲";
  if (priority === "medium") return "▲";
  return "▼";
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
}

export function isDueToday(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const d = new Date(dueDate);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
}

export function formatDueDate(dueDate: string): string {
  const d = new Date(dueDate);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDate(dueDate: string): string {
  const d = new Date(dueDate);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
