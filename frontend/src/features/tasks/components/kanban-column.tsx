"use client";

import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Edit2, MoreHorizontal, LayoutTemplate, Trash2 } from "lucide-react";
import { Task, TaskStatus } from "@/types/common";
import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  onAddTask?: (status: TaskStatus | string) => void;
  onSelectTask?: (task: Task) => void;
  onUpdateTitle?: (columnId: string, newTitle: string) => void;
  onDeleteColumn?: (columnId: string) => void;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  color,
  onAddTask,
  onSelectTask,
  onUpdateTitle,
  onDeleteColumn,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "Column",
      status: id,
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  // Reset the draft when the column is renamed elsewhere
  const [syncedTitle, setSyncedTitle] = useState(title);
  if (title !== syncedTitle) {
    setSyncedTitle(title);
    setEditTitle(title);
  }

  const handleSaveTitle = () => {
    setIsEditing(false);
    if (editTitle.trim() && editTitle.trim() !== title) {
      onUpdateTitle?.(id, editTitle.trim());
    } else {
      setEditTitle(title);
    }
  };

  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col flex-1 min-w-[260px] sm:min-w-[280px] max-w-[380px] xl:max-w-[420px] bg-slate-100/90 dark:bg-[#0c131f] rounded-xl p-2 border border-slate-200/80 dark:border-slate-800/90 shadow-xs transition-colors h-fit max-h-[calc(100vh-7.75rem)]",
        isOver && "bg-indigo-50/80 dark:bg-[#162032] border-[#4F46E5] dark:border-[#818cf8]"
      )}
    >
      {/* Column Header matching reference UI (Editable Title, Card Count & Menu) */}
      <div className="flex items-center justify-between px-1.5 py-1 mb-0.5 gap-2 shrink-0">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />

          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditTitle(title);
                }
              }}
              autoFocus
              className="text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-[#4F46E5] outline-none w-full shadow-2xs"
            />
          ) : (
            <h3
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white truncate cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-800/60 px-1.5 py-0.5 rounded-md transition-colors group flex items-center gap-1"
              title="Click to rename list"
            >
              <span>{title}</span>
              <Edit2 className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
          )}
        </div>

        {/* Count & Menu dots matching reference */}
        <div className="flex items-center gap-1 shrink-0 text-slate-500 dark:text-slate-400">
          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 select-none px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800/60">
            {tasks.length}
          </span>
          <button
            type="button"
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Rename list"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="w-3 h-3" />
          </button>
          {onDeleteColumn && (
            <button
              type="button"
              className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Delete list"
              onClick={() => onDeleteColumn(id)}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Cards List with SortableContext (Uses ultra-thin custom scrollbar to save space) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 px-0.5 py-0.5 min-h-0 pr-1">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onSelectTask={onSelectTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div
            onClick={() => onAddTask?.(id as TaskStatus)}
            className="h-16 rounded-lg border border-dashed border-slate-300 dark:border-slate-700/60 flex flex-col items-center justify-center text-xs text-slate-500 hover:border-[#4F46E5]/60 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors bg-white/50 dark:bg-slate-900/20"
          >
            <Plus className="w-3.5 h-3.5 mb-0.5 text-slate-400" />
            <span>Drop cards or click to add</span>
          </div>
        )}
      </div>

      {/* Footer "+ Add a card" button with template icon matching reference */}
      <div className="pt-1.5 mt-0.5 border-t border-slate-200/80 dark:border-slate-800/60 shrink-0">
        <button
          onClick={() => onAddTask?.(id as TaskStatus)}
          className="w-full py-1 px-2 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5 rounded-lg transition-all cursor-pointer group"
        >
          <span className="flex items-center gap-1.5">
            <Plus className="w-3 h-3 group-hover:scale-110 transition-transform" />
            <span>Add a card</span>
          </span>
          <LayoutTemplate className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
        </button>
      </div>
    </div>
  );
}
