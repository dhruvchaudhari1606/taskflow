"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  Paperclip,
  AlignLeft,
  GripVertical,
} from "lucide-react";
import { Task, Priority } from "@/types/common";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  task: Task;
  onSelectTask?: (task: Task) => void;
  isOverlay?: boolean;
}

export function KanbanCard({
  task,
  onSelectTask,
  isOverlay = false,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  // Determine avatar color from name initials
  const getInitials = (name?: string) => {
    if (!name) return "TF";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (name?: string) => {
    const colors = [
      "bg-amber-600 text-white",
      "bg-blue-600 text-white",
      "bg-indigo-600 text-white",
      "bg-emerald-600 text-white",
      "bg-rose-600 text-white",
      "bg-purple-600 text-white",
    ];
    let hash = 0;
    const str = name || "User";
    for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
    return colors[hash % colors.length];
  };

  // Format priority tags like in the reference screenshot
  const renderPriorityBadge = () => {
    if (task.priority === Priority.URGENT) {
      return (
        <span className="px-2 py-0.5 rounded-sm bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
          URGENT
        </span>
      );
    }
    if (task.priority === Priority.HIGH) {
      return (
        <span className="px-2 py-0.5 rounded-sm bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
          HIGH
        </span>
      );
    }
    if (task.priority === Priority.MEDIUM) {
      return (
        <span className="px-2 py-0.5 rounded-sm bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-[10px] font-semibold tracking-wide">
          Enhancement
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-sm bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30 text-[10px] font-semibold tracking-wide">
        Query
      </span>
    );
  };

  // Subtask completion simulation (e.g. 4/4 or 1/8)
  const subtasksTotal = (task.id.charCodeAt(task.id.length - 1) % 8) + 1;
  const subtasksDone = (task.id.charCodeAt(0) % subtasksTotal);
  const isSubtasksDone = subtasksTotal > 1 && subtasksDone === subtasksTotal;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative bg-white dark:bg-[#151c29] rounded-xl p-2.5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs hover:border-[#4F46E5]/60 hover:shadow-md transition-all select-none cursor-grab active:cursor-grabbing",
        isDragging && "opacity-35 ring-2 ring-[#4F46E5] scale-[1.02]",
        isOverlay &&
          "shadow-2xl ring-2 ring-[#4F46E5] rotate-1 cursor-grabbing z-50 bg-white dark:bg-[#1e293b]"
      )}
      onClick={() => onSelectTask?.(task)}
    >
      {/* Top Tag Header */}
      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
        {renderPriorityBadge()}

        {task.labels &&
          task.labels.map((label) => (
            <span
              key={label.id}
              className="px-1.5 py-0.5 rounded-sm text-[10px] font-bold tracking-wide uppercase"
              style={{
                backgroundColor: `${label.color}20`,
                color: label.color,
                border: `1px solid ${label.color}40`,
              }}
            >
              {label.name}
            </span>
          ))}
      </div>

      {/* Task Title */}
      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#4F46E5] dark:group-hover:text-white leading-snug line-clamp-2 mb-1.5 transition-colors">
        {task.title}
      </h4>

      {/* Task Description Snippet (if available) */}
      {task.description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Card Footer: Meta Icons on Left & Assignee Avatar on Right */}
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800/70 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Description indicator icon */}
          {task.description && (
            <span className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors" title="Has description">
              <AlignLeft className="w-3.5 h-3.5" />
            </span>
          )}

          {/* Subtasks counter (matching reference) */}
          <span
            className={cn(
              "flex items-center gap-1 text-[10px] font-medium px-1 py-0.5 rounded",
              isSubtasksDone
                ? "bg-emerald-50 dark:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40 font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
            title="Subtasks progress"
          >
            <CheckSquare className="w-3 h-3" />
            <span>
              {subtasksDone}/{subtasksTotal}
            </span>
          </span>

          {/* Comments count */}
          <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
            <MessageSquare className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <span>1</span>
          </span>

          {/* Attachments if any */}
          {task.id.length % 2 === 0 && (
            <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
              <Paperclip className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>1</span>
            </span>
          )}
        </div>

        {/* Assignee Avatar Pill matching reference */}
        {task.assignee ? (
          task.assignee.avatarUrl ? (
            <img
              src={task.assignee.avatarUrl}
              alt={task.assignee.name}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/20"
            />
          ) : (
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shadow-xs",
                getAvatarBg(task.assignee.name)
              )}
              title={task.assignee.name}
            >
              {getInitials(task.assignee.name)}
            </div>
          )
        ) : (
          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[9px] font-bold">
            RP
          </div>
        )}
      </div>
    </div>
  );
}
