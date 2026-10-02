"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderKanban,
  Tag,
  Users,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/common/avatar";
import { PriorityBadge, StatusBadge } from "@/components/common/badge-status";
import { TaskDetailModal } from "@/features/tasks/components/task-detail-modal";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";
import {
  useWorkspaces,
  useWorkspaceMembers,
} from "@/features/workspace/hooks/use-workspaces";
import { useProjects } from "@/features/projects/hooks/use-projects";
import {
  useWorkspaceTasks,
  useUpdateTask,
  useDeleteTask,
} from "@/features/tasks/hooks/use-tasks";
import { Task, TaskStatus, Priority } from "@/types/common";
import { MOCK_TASKS, MOCK_USERS, MOCK_WORKSPACE } from "@/lib/mock-data";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export default function GlobalTasksPage() {
  const { activeWorkspace } = useWorkspaces();
  const { data: workspaceMembersData = [] } = useWorkspaceMembers(
    activeWorkspace?.id
  );
  const { data: projects = [] } = useProjects(activeWorkspace?.id);
  const { data: serverTasks, isLoading } = useWorkspaceTasks(
    activeWorkspace?.id
  );

  const mappedMembers = useMemo(() => {
    if (workspaceMembersData && workspaceMembersData.length > 0) {
      return workspaceMembersData
        .filter((m: any) => Boolean(m.user))
        .map((m: any) => ({
          id: m.user.id,
          name:
            m.user.name ||
            `${m.user.first_name || ""} ${m.user.last_name || ""}`.trim() ||
            m.user.email,
          email: m.user.email,
          avatarUrl: m.user.avatar_url || null,
          role: m.role,
        }));
    }
    return MOCK_USERS;
  }, [workspaceMembersData]);

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // Local tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Sync server tasks when a new snapshot arrives (adjusted during render)
  const [syncedTasks, setSyncedTasks] = useState<typeof serverTasks>();
  if (serverTasks !== syncedTasks) {
    setSyncedTasks(serverTasks);
    if (serverTasks) {
      setTasks(serverTasks);
    }
  }

  // Filters
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [filterAssignee, setFilterAssignee] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Filtered task computation
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      // Project
      if (filterProject !== "ALL" && t.projectId !== filterProject) {
        return false;
      }
      // Status
      if (filterStatus !== "ALL" && t.status !== filterStatus) {
        return false;
      }
      // Priority
      if (filterPriority !== "ALL" && t.priority !== filterPriority) {
        return false;
      }
      // Assignee
      if (filterAssignee !== "ALL") {
        if (filterAssignee === "unassigned" && t.assigneeId) return false;
        if (filterAssignee !== "unassigned" && t.assigneeId !== filterAssignee) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, search, filterProject, filterStatus, filterPriority, filterAssignee]);

  // Task metrics
  const totalCount = tasks.length;
  const inProgressCount = tasks.filter(
    (t) => t.status === TaskStatus.IN_PROGRESS
  ).length;
  const inReviewCount = tasks.filter(
    (t) => t.status === TaskStatus.IN_REVIEW
  ).length;
  const doneCount = tasks.filter((t) => t.status === TaskStatus.DONE).length;

  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);

    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        updated.id
      );
    if (isUUID) {
      updateTaskMutation.mutate({
        taskId: updated.id,
        payload: {
          title: updated.title,
          description: updated.description ?? undefined,
          status: updated.status,
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
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        taskId
      );
    if (isUUID) {
      deleteTaskMutation.mutate({ taskId });
    }
  };

  const primaryProjectId = projects[0]?.id || "proj-1";

  return (
    <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">
      {/* ─── Top Header Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#4F46E5]">
              {activeWorkspace?.name || MOCK_WORKSPACE.name}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500">Cross-Project Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-[#4F46E5]" />
            <span>All Workspace Tasks</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-[#4F46E5] hover:bg-[#3525cd] text-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* ─── Metric Pills Overview ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Tasks
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">Active</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 block mb-1">
            In Progress
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              {inProgressCount}
            </span>
            <Clock className="w-4 h-4 text-blue-400 opacity-60" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 block mb-1">
            In Review
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {inReviewCount}
            </span>
            <AlertCircle className="w-4 h-4 text-amber-400 opacity-60" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 block mb-1">
            Completed
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {doneCount}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 opacity-60" />
          </div>
        </div>
      </div>

      {/* ─── Filter & Search Bar ─── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by title, criteria, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Filter */}
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value={TaskStatus.TODO}>Backlog (To Do)</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.IN_REVIEW}>In Review</option>
            <option value={TaskStatus.DONE}>Done</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value={Priority.LOW}>Low</option>
            <option value={Priority.MEDIUM}>Medium</option>
            <option value={Priority.HIGH}>High</option>
            <option value={Priority.URGENT}>Urgent</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-lg text-xs font-semibold transition-colors",
                viewMode === "list"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              )}
              title="Table / List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg text-xs font-semibold transition-colors",
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              )}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Tasks Presentation (List or Grid) ─── */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <CheckSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No matching tasks found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing selected filters, or
            create a new task.
          </p>
          <Button
            onClick={() => {
              setSearch("");
              setFilterProject("ALL");
              setFilterStatus("ALL");
              setFilterPriority("ALL");
              setFilterAssignee("ALL");
            }}
            variant="outline"
            size="sm"
            className="text-xs mt-2"
          >
            Clear Filters
          </Button>
        </div>
      ) : viewMode === "list" ? (
        /* Table View */
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Task</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Assignee</th>
                  <th className="py-3.5 px-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {filteredTasks.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-[#4F46E5] transition-colors block">
                          {t.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400">
                            {t.id.length > 10 ? `#${t.id.slice(0, 8)}` : `#${t.id}`}
                          </span>
                          {t.labels && t.labels.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] font-semibold">
                              #{t.labels[0].name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">
                      {t.project?.name || "Platform Core"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={t.assignee?.avatarUrl ?? undefined}
                          fallback={t.assignee?.name || "Unassigned"}
                          size="xs"
                        />
                        <span className="truncate max-w-[120px]">
                          {t.assignee?.name || "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {t.dueDate
                        ? new Date(t.dueDate).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTask(t)}
              className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-[#4F46E5]/40 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {t.id.length > 10 ? `#${t.id.slice(0, 8)}` : `#${t.id}`}
                  </span>
                  <StatusBadge status={t.status} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#4F46E5] transition-colors line-clamp-2">
                  {t.title}
                </h4>
                {t.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <PriorityBadge priority={t.priority} />
                <div className="flex items-center gap-1.5">
                  <Avatar
                    src={t.assignee?.avatarUrl ?? undefined}
                    fallback={t.assignee?.name || "Unassigned"}
                    size="xs"
                  />
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[100px]">
                    {t.assignee?.name || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Create Task Modal ─── */}
      <CreateTaskModal
        isOpen={createModalOpen}
        defaultStatus={TaskStatus.TODO}
        projectId={primaryProjectId}
        onClose={() => setCreateModalOpen(false)}
        onTaskCreated={(newTask) => setTasks((prev) => [newTask, ...prev])}
      />

      {/* ─── Task Details Modal ─── */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        members={mappedMembers as any}
      />
    </div>
  );
}
