"use client";

import React, { useState, useMemo } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import {
  Search,
  Plus,
  Info,
  X,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Users,
  Settings,
} from "lucide-react";
import { Task, TaskStatus, Priority, ProjectStatus } from "@/types/common";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { CreateTaskModal } from "./create-task-modal";
import { TaskDetailModal } from "./task-detail-modal";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/common/avatar";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { statusKey, statusFromColumnTitle, findColumnForTask } from "@/lib/task-status";
import { toast } from "sonner";
import {
  useProjectTasks,
  useReorderTask,
  useUpdateTask,
  useDeleteTask,
  useProjectColumns,
  useCreateColumn,
  useUpdateColumn,
  useDeleteColumn,
  useReorderColumns,
} from "@/features/tasks/hooks/use-tasks";
import { useProject } from "@/features/projects/hooks/use-projects";
import {
  useWorkspaces,
  useWorkspaceMemberOptions,
} from "@/features/workspace/hooks/use-workspaces";

interface ProjectMeta {
  id: string;
  name: string;
  key?: string;
  description?: string | null;
  priority?: Priority;
  status?: ProjectStatus;
  taskCount?: number;
  completedTaskCount?: number;
}

interface KanbanBoardProps {
  projectId?: string;
  project?: ProjectMeta;
}

export interface BoardColumn {
  id: string;
  title: string;
  color: string;
  position?: number;
}

export function KanbanBoard({
  projectId = "proj-1",
  project,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const { data: serverColumns, isLoading: columnsLoading } =
    useProjectColumns(projectId);
  const createColumnMutation = useCreateColumn(projectId);
  const updateColumnMutation = useUpdateColumn(projectId);
  const deleteColumnMutation = useDeleteColumn(projectId);
  const reorderColumnsMutation = useReorderColumns(projectId);

  // Sync columns from backend whenever a new server snapshot arrives.
  // Adjusting state during render (instead of in an effect) avoids an extra
  // commit: https://react.dev/learn/you-might-not-need-an-effect
  const [syncedColumns, setSyncedColumns] = useState<typeof serverColumns>();
  if (serverColumns !== syncedColumns) {
    setSyncedColumns(serverColumns);
    if (serverColumns && serverColumns.length > 0) {
      setColumns(
        serverColumns.map((col) => ({
          id: col.id,
          title: col.name,
          color: col.color,
          position: col.position,
        }))
      );
    }
  }

  const { data: serverTasks } = useProjectTasks(projectId);
  const reorderTaskMutation = useReorderTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // Local copy enables optimistic drag-and-drop; re-sync on new server data
  const [syncedTasks, setSyncedTasks] = useState<typeof serverTasks>();
  if (serverTasks !== syncedTasks) {
    setSyncedTasks(serverTasks);
    if (serverTasks) {
      setTasks(serverTasks);
    }
  }

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus | string>(
    TaskStatus.TODO
  );

  // Client mount state to guarantee zero SSR hydration mismatches
  const isMounted = useHydrated();

  // Top project info slide-down visibility (Requirement 2)
  const [showProjectInfo, setShowProjectInfo] = useState(false);

  // New list creation state (Requirement 3)
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssigneeId, setFilterAssigneeId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("ALL");

  // Sensors config: 4px activation constraint lets direct clicks open task details
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Derived project attributes
  const projectName = project?.name || "Project Board";
  const projectKey = project?.key || "";
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.DONE).length;
  const totalTasks = tasks.length;
  const completionPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Dynamically extract assignees from current tasks for filtering
  const assignees = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; avatarUrl?: string | null }
    >();
    tasks.forEach((t) => {
      if (t.assignee && t.assigneeId) {
        map.set(t.assigneeId, {
          id: t.assigneeId,
          name: t.assignee.name,
          avatarUrl: t.assignee.avatarUrl,
        });
      }
    });
    return Array.from(map.values());
  }, [tasks]);

  // Full workspace member list (with emails) for the task detail assignee picker
  const { activeWorkspace } = useWorkspaces();
  const { data: projectData } = useProject(projectId);
  const memberOptions = useWorkspaceMemberOptions(
    projectData?.workspace_id || activeWorkspace?.id
  );

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      // Assignee
      if (filterAssigneeId && task.assigneeId !== filterAssigneeId) {
        return false;
      }
      // Priority
      if (filterPriority !== "ALL" && task.priority !== filterPriority) {
        return false;
      }
      return true;
    });
  }, [tasks, searchQuery, filterAssigneeId, filterPriority]);

  // Tasks grouped dynamically by column ID or status
  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = {};
    columns.forEach((col) => {
      map[col.id] = [];
    });

    if (columns.length === 0) return map;

    filteredTasks.forEach((t) => {
      // 1. Direct columnId match
      if (t.columnId && map[t.columnId]) {
        map[t.columnId].push(t);
        return;
      }
      // 2. Status matches column id
      if (t.status && map[t.status]) {
        map[t.status].push(t);
        return;
      }
      // 3. Status matches column title ("To Do" ↔ "TODO", "In Progress" ↔ "IN_PROGRESS")
      const matched = columns.find((col) => statusKey(col.title) === statusKey(t.status));
      if (matched && map[matched.id]) {
        map[matched.id].push(t);
        return;
      }

      // 4. Fallback to first column
      map[columns[0].id]?.push(t);
    });

    return map;
  }, [filteredTasks, columns]);

  // Rename column handler (persisted to backend)
  const handleUpdateColumnTitle = (columnId: string, newTitle: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, title: newTitle } : c))
    );
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
    const isColUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(columnId);

    if (isUUID && isColUUID) {
      updateColumnMutation.mutate({
        columnId,
        payload: { name: newTitle },
      });
    } else {
      toast.success(`List renamed to "${newTitle}"`);
    }
  };

  // Add new column handler (persisted to backend)
  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    const title = newColumnTitle.trim();
    const palette = [
      "#4F46E5",
      "#0891b2",
      "#7c3aed",
      "#db2777",
      "#ea580c",
      "#059669",
      "#2563eb",
    ];
    const color = palette[columns.length % palette.length];
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);

    if (isUUID) {
      try {
        const newCol = await createColumnMutation.mutateAsync({
          name: title,
          color,
          position: (columns.length + 1) * 1000,
        });
        setColumns((prev) => [
          ...prev,
          {
            id: newCol.id,
            title: newCol.name,
            color: newCol.color,
            position: newCol.position,
          },
        ]);
        setNewColumnTitle("");
        setIsAddingColumn(false);
      } catch {
        // Error toast handled by mutation
      }
    } else {
      const newId = `list-${Date.now()}`;
      setColumns((prev) => [...prev, { id: newId, title, color }]);
      setNewColumnTitle("");
      setIsAddingColumn(false);
      toast.success(`New list "${title}" created`);
    }
  };

  // Delete column handler (persisted to backend)
  const handleDeleteColumn = (columnId: string) => {
    const colToDelete = columns.find((c) => c.id === columnId);
    setColumns((prev) => prev.filter((c) => c.id !== columnId));

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
    const isColUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(columnId);

    if (isUUID && isColUUID) {
      deleteColumnMutation.mutate(columnId);
    } else {
      toast.success(`List "${colToDelete?.title || "Column"}" deleted`);
    }
  };

  // Drag Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || activeData.type !== "Task") return;

    // Moving over a column directly
    if (overData && overData.type === "Column") {
      const targetColId = overData.status as string;
      const targetCol = columns.find((c) => c.id === targetColId);
      const newStatus = targetCol ? statusFromColumnTitle(targetCol.title) : targetColId;

      setTasks((prev) => {
        return prev.map((t) => {
          if (t.id === activeId) {
            return {
              ...t,
              columnId: targetColId,
              status: newStatus as any,
            };
          }
          return t;
        });
      });
      return;
    }

    // Moving over another task
    if (overData && overData.type === "Task") {
      const activeTaskItem = tasks.find((t) => t.id === activeId);
      const overTaskItem = tasks.find((t) => t.id === overId);

      if (
        activeTaskItem &&
        overTaskItem &&
        (activeTaskItem.columnId !== overTaskItem.columnId ||
          activeTaskItem.status !== overTaskItem.status)
      ) {
        setTasks((prev) => {
          return prev.map((t) => {
            if (t.id === activeId) {
              return {
                ...t,
                columnId: overTaskItem.columnId,
                status: overTaskItem.status,
              };
            }
            return t;
          });
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskItem = tasks.find((t) => t.id === activeId);
    if (!activeTaskItem) return;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeId);

    const targetCol = findColumnForTask(columns, activeTaskItem);
    const finalColumnId = targetCol?.id || activeTaskItem.columnId || undefined;
    const finalStatus = targetCol
      ? statusFromColumnTitle(targetCol.title)
      : activeTaskItem.status;

    if (activeId === overId) {
      if (isUUID) {
        reorderTaskMutation.mutate({
          taskId: activeId,
          payload: {
            status: finalStatus,
            column_id: finalColumnId,
            position: 1000,
          },
        });
      }
      return;
    }

    setTasks((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId);
      const overIndex = prev.findIndex((t) => t.id === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        const reordered = arrayMove(prev, activeIndex, overIndex);
        if (isUUID) {
          const targetPos = (overIndex + 1) * 1000;
          reorderTaskMutation.mutate({
            taskId: activeId,
            payload: {
              status: finalStatus,
              column_id: finalColumnId,
              position: targetPos,
            },
          });
        }
        return reordered;
      }
      return prev;
    });
  };

  const handleOpenCreateModal = (status?: TaskStatus | string) => {
    if (columns.length === 0) {
      setIsAddingColumn(true);
      toast.info("Please create a list first before adding tasks.");
      return;
    }
    const targetStatus = status || columns[0]?.id || TaskStatus.TODO;
    setCreateDefaultStatus(targetStatus);
    setCreateModalOpen(true);
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(updated.id);
    if (isUUID) {
      updateTaskMutation.mutate({
        taskId: updated.id,
        payload: {
          title: updated.title,
          description: updated.description ?? undefined,
          status: updated.status,
          column_id: updated.columnId || undefined,
          priority: updated.priority,
          assignee_id: updated.assigneeId || null,
          due_date: updated.dueDate || null,
          tags: updated.labels?.map((l) => l.name) || [],
        },
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(taskId);
    if (isUUID) {
      deleteTaskMutation.mutate({ taskId, projectId });
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterAssigneeId(null);
    setFilterPriority("ALL");
  };

  const hasActiveFilters =
    searchQuery !== "" || filterAssigneeId !== null || filterPriority !== "ALL";

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 space-y-1.5 overflow-hidden">
      {/* ─── Compact Filter Toolbar with Project Name on Left & Info Toggle (Requirement 2 & 3) ─── */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#334155] shadow-xs">
        {/* Left Section: Back link, Project Title, Key & Info Icon (Requirement 2 & 3) */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={ROUTES.PROJECTS}
            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Projects list"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-1.5 min-w-0">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight truncate max-w-[180px] sm:max-w-xs md:max-w-sm">
              {projectName}
            </h2>

            {projectKey && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#e2dfff] dark:bg-indigo-950/70 text-[#3525cd] dark:text-indigo-300 uppercase tracking-wider shrink-0">
                {projectKey}
              </span>
            )}

            {/* Info Icon Button (Requirement 2: Toggle top project info) */}
            <button
              onClick={() => setShowProjectInfo(!showProjectInfo)}
              className={cn(
                "p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0",
                showProjectInfo &&
                  "text-[#4F46E5] dark:text-[#818cf8] bg-indigo-50 dark:bg-indigo-950/60"
              )}
              title={showProjectInfo ? "Hide project details" : "Show project details"}
            >
              <Info className="w-3.5 h-3.5" />
            </button>

            {/* Project Settings Link */}
            <Link
              href={`/projects/${projectId}/settings`}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Project Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Section: Search & Filters Toolbar */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Search */}
          <div className="relative w-40 sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7.5 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-[#334155] bg-[#faf8ff] dark:bg-[#0f172a] text-slate-900 dark:text-[#f8fafc] placeholder:text-slate-400 dark:placeholder:text-[#94a3b8] focus:outline-none focus:ring-1.5 focus:ring-[#4F46E5]/40"
            />
          </div>

          {/* Member Filter Avatars */}
          {assignees.length > 0 && (
            <div className="hidden md:flex items-center gap-1 pl-1.5 border-l border-slate-200 dark:border-[#334155]">
              {assignees.map((user) => {
                const isSelected = filterAssigneeId === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() =>
                      setFilterAssigneeId(isSelected ? null : user.id)
                    }
                    className={`p-0.5 rounded-full transition-all cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-[#4F46E5] dark:ring-[#818cf8] scale-105"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    title={`Filter by ${user.name}`}
                  >
                    <Avatar
                      src={user.avatarUrl ?? undefined}
                      fallback={user.name}
                      size="xs"
                      alt={user.name}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Priority Dropdown */}
          <div className="flex items-center">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-xs bg-[#faf8ff] dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] rounded-lg px-2 py-1 text-slate-700 dark:text-[#f8fafc] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value={Priority.URGENT}>Urgent</option>
              <option value={Priority.HIGH}>High</option>
              <option value={Priority.MEDIUM}>Medium</option>
              <option value={Priority.LOW}>Low</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-1.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* + New Task Button */}
          <Button
            onClick={() => handleOpenCreateModal(TaskStatus.TODO)}
            className="h-7.5 px-2.5 bg-[#4F46E5] hover:bg-[#3525cd] text-white rounded-lg shadow-xs font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* ─── Top Slide-Down Project Details Drawer (Requirement 2: only appears on info icon click) ─── */}
      {showProjectInfo && (
        <div className="shrink-0 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#334155] shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                  {project?.status || "ACTIVE"} PROJECT
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#e2dfff] dark:bg-[#4F46E5]/20 text-[#3525cd] dark:text-[#a5b4fc] text-[10px] font-bold">
                  {project?.priority || "HIGH"} PRIORITY
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Target: End of Quarter
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                {project?.description ||
                  "High-priority delivery focused on cross-functional alignment, high-velocity task management, and responsive edge execution."}
              </p>
            </div>

            {/* Right: Progress bar & Close button */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex flex-col items-end">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {completionPercent}% Shipped
                </div>
                <div className="text-[11px] text-slate-400">
                  {completedTasks} / {totalTasks} Tasks Complete
                </div>
                <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                  <div
                    className="bg-[#4F46E5] h-full rounded-full transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>

              {/* Team Avatars */}
              {assignees.length > 0 && (
                <div className="hidden sm:flex items-center -space-x-2 pl-2">
                  {assignees.map((user) => (
                    <Avatar
                      key={user.id}
                      src={user.avatarUrl ?? undefined}
                      fallback={user.name}
                      size="sm"
                      className="border-2 border-white dark:border-[#131b2e]"
                    />
                  ))}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowProjectInfo(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close project info"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Drag and Drop Full-Screen Responsive Kanban Surface (Requirement 1 & 5) ─── */}
      {isMounted ? (
        <DndContext
          id="kanban-board-dnd"
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {columnsLoading && columns.length === 0 ? (
            <div className="flex-1 w-full flex gap-3 overflow-x-auto custom-scrollbar pb-2 pt-0.5 items-start min-h-0">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-64 sm:w-72 h-80 rounded-xl bg-slate-100/90 dark:bg-[#0c131f] border border-slate-200/80 dark:border-slate-800 p-3 space-y-3 animate-pulse shrink-0"
                >
                  <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-1/2" />
                  <div className="h-20 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg" />
                  <div className="h-20 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg" />
                </div>
              ))}
            </div>
          ) : columns.length === 0 ? (
            <div className="flex-1 flex flex-col items-start justify-start p-4 sm:p-6 min-h-[300px]">
              <div className="w-full max-w-xs">
                {isAddingColumn ? (
                  <div className="bg-white dark:bg-[#0c131f] rounded-xl p-3 border border-slate-200 dark:border-slate-700/80 space-y-3 shadow-md animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Add New List
                      </span>
                      <button
                        onClick={() => {
                          setIsAddingColumn(false);
                          setNewColumnTitle("");
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter list title..."
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddColumn();
                        if (e.key === "Escape") {
                          setIsAddingColumn(false);
                          setNewColumnTitle("");
                        }
                      }}
                      autoFocus
                      className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162032] text-slate-900 dark:text-white focus:outline-none focus:ring-1.5 focus:ring-[#4F46E5] shadow-2xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddColumn}
                        className="h-8 px-4 text-xs font-bold bg-[#4F46E5] hover:bg-[#3525cd] text-white rounded-lg shadow-xs cursor-pointer"
                      >
                        Add list
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsAddingColumn(false);
                          setNewColumnTitle("");
                        }}
                        className="h-8 px-3 text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingColumn(true)}
                    className="w-full h-11 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800/90 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 flex items-center justify-center gap-2 px-4 text-xs font-bold text-slate-800 dark:text-white shadow-xs hover:shadow transition-all cursor-pointer group"
                  >
                    <Plus className="w-4 h-4 text-[#4F46E5] dark:text-[#818cf8] group-hover:scale-110 transition-transform" />
                    <span>Add list</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full flex gap-2.5 overflow-x-auto custom-scrollbar pb-1 pt-0.5 items-start min-h-0">
              {columns.map((col) => (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  color={col.color}
                  tasks={tasksByStatus[col.id] || []}
                  onAddTask={handleOpenCreateModal}
                  onSelectTask={(task) => setSelectedTask(task)}
                  onUpdateTitle={handleUpdateColumnTitle}
                  onDeleteColumn={handleDeleteColumn}
                />
              ))}

              {/* Add Another List Section at the End */}
              <div className="shrink-0 w-60 sm:w-68">
                {isAddingColumn ? (
                  <div className="bg-white dark:bg-[#0c131f] rounded-xl p-2.5 border border-slate-200 dark:border-slate-700/80 space-y-2 animate-in fade-in duration-150 shadow-md">
                    <input
                      type="text"
                      placeholder="Enter list title..."
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddColumn();
                        if (e.key === "Escape") {
                          setIsAddingColumn(false);
                          setNewColumnTitle("");
                        }
                      }}
                      autoFocus
                      className="w-full px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162032] text-slate-900 dark:text-white focus:outline-none focus:ring-1.5 focus:ring-[#4F46E5] shadow-2xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        onClick={handleAddColumn}
                        className="h-7 px-3 text-xs font-bold bg-[#4F46E5] hover:bg-[#3525cd] text-white rounded-lg shadow-xs cursor-pointer"
                      >
                        Add list
                      </Button>
                      <button
                        onClick={() => {
                          setIsAddingColumn(false);
                          setNewColumnTitle("");
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingColumn(true)}
                    className="w-full h-9 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 flex items-center gap-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    <span>Add another list</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Floating Drag Overlay */}
          <DragOverlay>
            {activeTask ? (
              <KanbanCard task={activeTask} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="flex-1 w-full flex gap-3 overflow-x-auto custom-scrollbar pb-2 pt-0.5 items-start min-h-0">
          <div className="w-64 h-32 rounded-xl bg-slate-200/70 dark:bg-[#0c131f] border border-slate-300/80 dark:border-slate-800 animate-pulse" />
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={createModalOpen}
        defaultStatus={createDefaultStatus}
        projectId={projectId}
        columns={columns}
        onClose={() => setCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        members={memberOptions}
        columns={columns}
      />
    </div>
  );
}
