import React from "react";
import {
  LayoutDashboard,
  Plus,
  PlusSquare,
  User,
  Users,
  Share2,
  FolderKanban,
  ListTodo,
  Play,
  PlayCircle,
  Ban,
  AlertOctagon,
  Check,
  CheckSquare,
  CheckCircle2,
  Table,
  LogOut,
  Menu,
  X,
  Search,
  Calendar,
  Flame,
  Trophy,
  AlertTriangle,
  Pencil,
  Trash2,
  MessageSquare,
  RotateCcw,
  Cpu,
  Server,
  Monitor,
  Shield,
  BarChart3,
  CreditCard,
  Bell,
  Tv,
  Bug,
  GitBranch,
  Activity,
  Clock,
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Zap,
  Target,
  FileText,
  SlidersHorizontal,
  Filter,
  Terminal,
  Palette,
  Layers,
  Settings,
  KeyRound,
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  Sliders,
  Volume2,
  VolumeX,
  Download,
  RefreshCw,
  Save,
  CheckCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export {
  LayoutDashboard,
  Plus,
  PlusSquare,
  User,
  Users,
  Share2,
  FolderKanban,
  ListTodo,
  Play,
  PlayCircle,
  Ban,
  AlertOctagon,
  Check,
  CheckSquare,
  CheckCircle2,
  Table,
  LogOut,
  Menu,
  X,
  Search,
  Calendar,
  Flame,
  Trophy,
  AlertTriangle,
  Pencil,
  Trash2,
  MessageSquare,
  RotateCcw,
  Cpu,
  Server,
  Monitor,
  Shield,
  BarChart3,
  CreditCard,
  Bell,
  Tv,
  Bug,
  GitBranch,
  Activity,
  Clock,
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Zap,
  Target,
  FileText,
  SlidersHorizontal,
  Filter,
  Terminal,
  Palette,
  Layers,
  Settings,
  KeyRound,
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  Sliders,
  Volume2,
  VolumeX,
  Download,
  RefreshCw,
  Save,
  CheckCircle,
  ExternalLink,
  Sparkles,
};

/**
 * Returns a theme-matching Category Icon component based on category name.
 */
export function getCategoryIcon(category: string, size: number = 13) {
  const strokeWidth = 2.4;
  const props = { size, strokeWidth, className: "shrink-0" };

  switch (category?.toLowerCase()) {
    case "core":
      return <Cpu {...props} />;
    case "backend":
      return <Server {...props} />;
    case "frontend":
      return <Monitor {...props} />;
    case "security":
      return <Shield {...props} />;
    case "analytics":
      return <BarChart3 {...props} />;
    case "billing":
      return <CreditCard {...props} />;
    case "notifications":
      return <Bell {...props} />;
    case "display":
      return <Tv {...props} />;
    case "bugfix":
      return <Bug {...props} />;
    case "devops":
      return <GitBranch {...props} />;
    default:
      return <FolderKanban {...props} />;
  }
}

/**
 * Returns a theme-matching Priority Icon component
 */
export function getPriorityIconComponent(priority: "high" | "medium" | "low", size: number = 13) {
  const strokeWidth = 2.6;
  const props = { size, strokeWidth, className: "shrink-0" };

  switch (priority) {
    case "high":
      return <ChevronsUp {...props} />;
    case "medium":
      return <ChevronUp {...props} />;
    case "low":
      return <ChevronDown {...props} />;
    default:
      return <ChevronUp {...props} />;
  }
}

/**
 * Returns a theme-matching Status Icon component
 */
export function getStatusIconComponent(status: string, size: number = 13) {
  const strokeWidth = 2.4;
  const props = { size, strokeWidth, className: "shrink-0" };

  switch (status?.toLowerCase()) {
    case "todo":
      return <Clock {...props} />;
    case "progress":
      return <Activity {...props} />;
    case "testing":
      return <FlaskConical {...props} />;
    case "blocked":
      return <AlertOctagon {...props} />;
    case "done":
      return <Check {...props} />;
    default:
      return <Clock {...props} />;
  }
}

/**
 * Returns a theme-matching Owner Icon component based on owner name
 */
export function getOwnerIconComponent(owner: string, size: number = 13) {
  const strokeWidth = 2.4;
  const props = { size, strokeWidth, className: "shrink-0" };

  switch (owner?.toLowerCase()) {
    case "musab":
      return <Terminal {...props} />;
    case "yusha":
      return <Palette {...props} />;
    case "shared":
      return <Users {...props} />;
    default:
      return <User {...props} />;
  }
}
