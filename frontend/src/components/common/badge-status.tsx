import React from "react";
import { cn } from "@/lib/utils";
import { TaskStatus, Priority, ProjectStatus, Role } from "@/types/common";

// ─── Priority Badge ──────────────────────────────────────────────────────────

const priorityConfig: Record<
  Priority,
  { label: string; bg: string; text: string; dot: string }
> = {
  [Priority.URGENT]: {
    label: "Urgent",
    bg: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
  [Priority.HIGH]: {
    label: "High",
    bg: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 ring-1 ring-orange-200 dark:ring-orange-800",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  [Priority.MEDIUM]: {
    label: "Medium",
    bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  [Priority.LOW]: {
    label: "Low",
    bg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700",
    text: "text-slate-600 dark:text-slate-400",
    dot: "bg-slate-400",
  },
};

export function PriorityBadge({
  priority,
  showDot = true,
  className,
}: {
  priority: Priority;
  showDot?: boolean;
  className?: string;
}) {
  const config = priorityConfig[priority] || priorityConfig[Priority.LOW];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide transition-colors",
        config.bg,
        className
      )}
    >
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />}
      {config.label}
    </span>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────

const statusConfig: Record<
  TaskStatus,
  { label: string; bg: string; dot: string }
> = {
  [TaskStatus.TODO]: {
    label: "To Do",
    bg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700",
    dot: "bg-slate-400",
  },
  [TaskStatus.IN_PROGRESS]: {
    label: "In Progress",
    bg: "bg-[#dbe1ff] text-[#003ea8] dark:bg-blue-950/60 dark:text-blue-200 ring-1 ring-blue-200 dark:ring-blue-800",
    dot: "bg-[#0051d5]",
  },
  [TaskStatus.IN_REVIEW]: {
    label: "In Review",
    bg: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800",
    dot: "bg-amber-500",
  },
  [TaskStatus.DONE]: {
    label: "Done",
    bg: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800",
    dot: "bg-emerald-500",
  },
};

export function StatusBadge({
  status,
  showDot = true,
  className,
}: {
  status: TaskStatus | string;
  showDot?: boolean;
  className?: string;
}) {
  const config =
    (statusConfig as Record<string, { label: string; bg: string; dot: string }>)[
      status
    ] || {
      label: typeof status === "string" ? status.replace(/_/g, " ") : "Todo",
      bg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-800",
      dot: "bg-[#4F46E5]",
    };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide transition-colors",
        config.bg,
        className
      )}
    >
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />}
      {config.label}
    </span>
  );
}

// ─── Role Badge ──────────────────────────────────────────────────────────────

const roleConfig: Record<Role, { label: string; bg: string }> = {
  [Role.OWNER]: {
    label: "Owner",
    bg: "bg-purple-50 text-purple-700 ring-1 ring-purple-200 dark:bg-purple-950/50 dark:text-purple-300",
  },
  [Role.ADMIN]: {
    label: "Admin",
    bg: "bg-[#e2dfff] text-[#3525cd] ring-1 ring-[#c3c0ff] dark:bg-indigo-950/50 dark:text-indigo-300",
  },
  [Role.MEMBER]: {
    label: "Member",
    bg: "bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300",
  },
};

export function RoleBadge({
  role,
  className,
}: {
  role: Role;
  className?: string;
}) {
  const config = roleConfig[role] || roleConfig[Role.MEMBER];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide",
        config.bg,
        className
      )}
    >
      {config.label}
    </span>
  );
}
