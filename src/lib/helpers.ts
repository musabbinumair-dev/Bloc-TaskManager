import { User, Status, Priority } from "./task-context";

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

export function getOwnerStyle(owner: User): React.CSSProperties {
  if (owner === "Musab") return { backgroundColor: "#FFE600", color: "#000", border: "2px solid #000" };
  if (owner === "Yusha") return { backgroundColor: "#0055FF", color: "#fff", border: "2px solid #000" };
  return { backgroundColor: "#00CC44", color: "#000", border: "2px solid #000" };
}

export function getOwnerBg(owner: User): string {
  if (owner === "Musab") return "#FFE600";
  if (owner === "Yusha") return "#0055FF";
  return "#00CC44";
}

export function getOwnerTextColor(owner: User): string {
  if (owner === "Yusha") return "#fff";
  return "#000";
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

// Need React for CSSProperties type
import React from "react";
