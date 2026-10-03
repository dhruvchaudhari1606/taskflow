"use client";

import React, { useMemo, useState } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Users,
  FolderKanban,
  ArrowRight,
  Plus,
  Flame,
  CheckSquare,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/common/avatar";
import {
  MOCK_PROJECTS,
  MOCK_TASKS,
  MOCK_ACTIVITY,
  MOCK_USERS,
} from "@/lib/mock-data";
import { ROUTES } from "@/constants/routes";
import {
  useWorkspaces,
  useWorkspaceMemberOptions,
} from "@/features/workspace/hooks/use-workspaces";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { pickFeaturedProject } from "@/features/projects/utils";
import { useWorkspaceTasks } from "@/features/tasks/hooks/use-tasks";
import { Priority, TaskStatus } from "@/types/common";
import { TaskDetailModal } from "@/features/tasks/components/task-detail-modal";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { TeamWorkloadChart } from "@/features/dashboard/components/team-workload-chart";
import {
  TASK_STATUS_SERIES,
  statusSeries,
  type TaskStatusKey,
} from "@/features/dashboard/task-status-series";

// Lower rank sorts first in "Sprint Priority Tasks"
const PRIORITY_RANK: Record<Priority, number> = {
  [Priority.URGENT]: 0,
  [Priority.HIGH]: 1,
  [Priority.MEDIUM]: 2,
  [Priority.LOW]: 3,
};

export default function DashboardPage() {
  // Charts are client-only; render them after hydration
  const mounted = useHydrated();

  const { activeWorkspace } = useWorkspaces();
  const { data: serverProjects } = useProjects(activeWorkspace?.id);
  const { data: serverTasks } = useWorkspaceTasks(activeWorkspace?.id);
  const memberOptions = useWorkspaceMemberOptions(activeWorkspace?.id);

  const [selectedTask, setSelectedTask] = useState<any>(null);

  // The offline demo session (lib/auth/demo-auth) uses a mock workspace id
  // ("ws-…"). Only then is mock data shown; real workspaces show real data,
  // including empty states, never placeholder numbers.
  const isDemoWorkspace = Boolean(activeWorkspace?.id?.startsWith("ws-"));

  // Live projects
  const displayProjects = useMemo(() => {
    if (serverProjects && serverProjects.length > 0) {
      return serverProjects.map((sp) => ({
        id: sp.id,
        name: sp.name,
        key: sp.key,
        description: sp.description || "Active project delivery track",
        priority: Priority.HIGH,
        taskCount: sp.taskCount || 0,
        completedTaskCount: sp.completedTaskCount || 0,
      }));
    }
    return [];
  }, [serverProjects]);

  // Live tasks (mock tasks only for the offline demo workspace)
  const tasks = useMemo(
    () => (isDemoWorkspace ? MOCK_TASKS : serverTasks ?? []),
    [isDemoWorkspace, serverTasks]
  );

  // Derived task counts
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === TaskStatus.IN_PROGRESS
  );
  const doneTasks = tasks.filter((t) => t.status === TaskStatus.DONE);
  const inReviewTasks = tasks.filter((t) => t.status === TaskStatus.IN_REVIEW);
  const todoTasks = tasks.filter((t) => t.status === TaskStatus.TODO);

  const completionPercent =
    totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  // Workspace team members count
  const memberCount = isDemoWorkspace ? MOCK_USERS.length : memberOptions.length;

  const workspaceName = activeWorkspace?.name || "Your workspace";
  // "Go to Sprint Board" opens the busiest project; undefined until projects load
  const primaryProjectId = isDemoWorkspace
    ? MOCK_PROJECTS[0]?.id
    : pickFeaturedProject(displayProjects)?.id;

  // Priority list: open work first, most urgent first
  const priorityTasks = useMemo(
    () =>
      [...tasks]
        .sort(
          (a, b) =>
            Number(a.status === TaskStatus.DONE) -
              Number(b.status === TaskStatus.DONE) ||
            PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
        )
        .slice(0, 5),
    [tasks]
  );

  // Task Status Distribution for Donut Chart
  const statusCounts: Record<TaskStatusKey, number> = {
    todo: todoTasks.length,
    inProgress: inProgressTasks.length,
    inReview: inReviewTasks.length,
    done: doneTasks.length,
  };
  const statusDistribution = TASK_STATUS_SERIES.map((s) => ({
    name: s.label,
    value: statusCounts[s.key],
    color: s.color,
  })).filter((item) => item.value > 0);

  // Live activity from real comments and task updates, newest first
  const liveActivity = useMemo(() => {
    if (isDemoWorkspace) {
      return MOCK_ACTIVITY.map((a) => ({
        id: a.id,
        user: a.user,
        message: a.message,
        time: a.createdAt,
      }));
    }

    const events: Array<{
      id: string;
      user: { name: string; avatarUrl?: string | null };
      message: string;
      at: string;
    }> = [];

    tasks.forEach((t) => {
      t.comments?.forEach((c) => {
        events.push({
          id: `comm-${c.id}`,
          user: { name: c.author.name, avatarUrl: c.author.avatarUrl ?? null },
          message: `commented on "${t.title}": "${truncate(c.content, 45)}"`,
          at: c.createdAt,
        });
      });

      const author = t.assignee || t.createdBy;
      const action =
        t.status === TaskStatus.DONE
          ? "completed"
          : t.status === TaskStatus.IN_PROGRESS
          ? "is working on"
          : t.status === TaskStatus.IN_REVIEW
          ? "requested review for"
          : "added";
      events.push({
        id: `task-${t.id}`,
        user: { name: author?.name || "Team member", avatarUrl: author?.avatarUrl ?? null },
        message: `${action} "${t.title}"`,
        at: t.updatedAt,
      });
    });

    return events
      .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
      .slice(0, 6)
      .map(({ at, ...e }) => ({ ...e, time: formatRelativeTime(at) }));
  }, [isDemoWorkspace, tasks]);

  return (
    <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#4F46E5]">
              {workspaceName}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500">Live Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Sprint Overview & Execution
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href={ROUTES.TASKS}>
            <Button
              variant="outline"
              className="text-xs font-semibold h-10 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-2xs"
            >
              <CheckSquare className="w-4 h-4 text-slate-500" />
              <span>All Tasks</span>
            </Button>
          </Link>
          {primaryProjectId ? (
            <Link href={ROUTES.project(primaryProjectId)}>
              <Button className="bg-[#4F46E5] hover:bg-[#3525cd] text-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm flex items-center gap-2">
                <span>Go to Sprint Board</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            // Projects still loading (or none yet): no link to a placeholder board
            <Button
              disabled
              className="bg-[#4F46E5] text-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm flex items-center gap-2 opacity-60"
            >
              <span>Go to Sprint Board</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Hero Sprint Health Highlight Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#334155] shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
              Sprint Execution Progress: {workspaceName}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              Active Sprint
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
            Real-time PostgreSQL telemetry • Sub-second board drag & drop and
            instant comment threads across {displayProjects.length} active{" "}
            {displayProjects.length === 1 ? "project" : "projects"}.
          </p>
        </div>

        {/* Progress Metrics Pill Ring */}
        <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-start pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-[#334155]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-[#4F46E5] dark:text-[#818CF8]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${completionPercent}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute font-bold text-xs text-slate-900 dark:text-[#F8FAFC]">
                {completionPercent}%
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">
                {doneTasks.length} / {totalTasks} Tasks
              </p>
              <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                Completed on schedule
              </p>
            </div>
          </div>

          <div className="hidden sm:block h-10 w-px bg-slate-200 dark:bg-[#334155]" />

          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">
              {inProgressTasks.length} In Progress
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Live DB Sync Active
            </p>
          </div>
        </div>
      </div>

      {/* 4 Quick Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs space-y-2 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#94A3B8]">
            <span className="text-xs font-semibold">Total Workspace Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-[#e2dfff] dark:bg-indigo-950/70 border border-transparent dark:border-indigo-800/40 text-[#3525cd] dark:text-[#818CF8] flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
              {totalTasks}
            </p>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              {displayProjects.length} Projects
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-[#94A3B8]">
            PostgreSQL Registry
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs space-y-2 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#94A3B8]">
            <span className="text-xs font-semibold">In Active Development</span>
            <div className="w-8 h-8 rounded-lg bg-[#dbe1ff] dark:bg-sky-950/70 border border-transparent dark:border-sky-800/40 text-[#0051d5] dark:text-[#38BDF8] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
              {inProgressTasks.length}
            </p>
            <span className="text-xs font-semibold text-[#0051d5] dark:text-[#38BDF8]">
              {inReviewTasks.length} in review
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-[#94A3B8]">
            Assigned to team
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs space-y-2 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#94A3B8]">
            <span className="text-xs font-semibold">Completed & Shipped</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-transparent dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
              {doneTasks.length}
            </p>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {completionPercent}% rate
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-[#94A3B8]">
            Verified delivery
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs space-y-2 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#94A3B8]">
            <span className="text-xs font-semibold">Active Team Seats</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 border border-transparent dark:border-purple-800/40 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
              {memberCount}
            </p>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              100% active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-[#94A3B8]">
            Collaborating in workspace
          </p>
        </div>
      </div>

      {/* Main Grid: Velocity Area Chart & Task Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Team Workload (real tasks per member by status) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
              Team Workload
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Tasks assigned to each member, by workflow stage
            </p>
          </div>
          <TeamWorkloadChart
            tasks={tasks}
            members={isDemoWorkspace ? MOCK_USERS : memberOptions}
            mounted={mounted}
          />
        </div>

        {/* Right 4 Cols: Status Distribution Donut Chart */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[#4F46E5] dark:text-[#818CF8]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                Task Distribution
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
              Live breakdown across active stages
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center relative">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    // Surface-colored edge instead of Recharts' default white stroke (visible in dark mode)
                    stroke="var(--chart-surface)"
                    strokeWidth={2}
                  >
                    {statusDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      color: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                {totalTasks}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Tasks
              </span>
            </div>
          </div>

          {/* Status Breakdown Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-[#334155]">
            {TASK_STATUS_SERIES.map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {s.label}: <strong>{statusCounts[s.key]}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Grid: Real-Time Activity & Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Live Activity Feed */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#4F46E5] dark:text-[#818CF8]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                Live Activity & Discussions
              </h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Synchronized
            </span>
          </div>

          <div className="space-y-3.5">
            {liveActivity.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-[#94A3B8] p-2">
                No activity yet. Task updates and comments will appear here.
              </p>
            )}
            {liveActivity.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 text-xs p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <Avatar
                  src={act.user.avatarUrl ?? undefined}
                  fallback={act.user.name}
                  size="sm"
                />
                <div className="flex-1 space-y-0.5">
                  <p className="text-slate-800 dark:text-[#F8FAFC] leading-snug">
                    <span className="font-bold text-slate-900 dark:text-[#818CF8]">
                      {act.user.name}
                    </span>{" "}
                    {act.message}
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-[#94A3B8]">
                    {act.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 6 Cols: Recent High-Priority Tasks */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                Sprint Priority Tasks
              </h3>
            </div>
            <Link
              href={ROUTES.TASKS}
              className="text-[11px] font-bold text-[#4F46E5] dark:text-[#818CF8] hover:underline"
            >
              View All ({tasks.length})
            </Link>
          </div>

          <div className="space-y-2.5">
            {priorityTasks.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-[#94A3B8] p-2">
                No tasks yet. Create one from a project board.
              </p>
            )}
            {priorityTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTask(t)}
                className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-indigo-400/50 dark:hover:border-indigo-500/50 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-500 border border-slate-200/80 dark:border-slate-700 shrink-0">
                    {t.key ?? (t.id.length > 10 ? `#${t.id.slice(0, 6)}` : `#${t.id}`)}
                  </span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors">
                    {t.title}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Stage badge: swatch from the shared status ramp + readable text
                      (light ramp steps can't carry white text, so the color sits in the dot) */}
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                    <span
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: statusSeries(t.status)?.color }}
                    />
                    {statusSeries(t.status)?.label ?? t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Projects Showcase Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
              Active Projects in {workspaceName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Select any project to launch its live Kanban board
            </p>
          </div>
          <Link href={ROUTES.PROJECTS}>
            <Button
              variant="outline"
              className="text-xs h-9 rounded-xl border-slate-200 dark:border-[#334155] dark:bg-[#111827] dark:text-[#F8FAFC]"
            >
              All Projects
            </Button>
          </Link>
        </div>

        {displayProjects.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 mx-auto flex items-center justify-center">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              No Projects Created Yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              There are currently no active projects in this workspace. Create your first project to start tracking initiatives and viewing Kanban boards.
            </p>
            <Link href={ROUTES.PROJECTS}>
              <Button className="mt-2 text-xs h-9 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#3525cd] text-white">
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Create Project</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {displayProjects.map((proj) => {
              const completionPercent = Math.round(
                ((proj.completedTaskCount ?? 0) / (proj.taskCount || 1)) * 100
              );

              return (
                <Link
                  key={proj.id}
                  href={`/projects/${proj.id}`}
                  className="group p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] hover:border-[#4F46E5] dark:hover:border-[#818CF8] hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#faf8ff] dark:bg-[#0f172a] text-[#4F46E5] dark:text-[#818CF8] border border-slate-100 dark:border-[#334155]">
                      {proj.key || "CORE"}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 dark:text-[#64748b] group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors group-hover:translate-x-1" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors">
                      {proj.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-[#94A3B8] line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-[#94A3B8]">
                      <span>{completionPercent}% Completed</span>
                      <span>
                        {proj.completedTaskCount} / {proj.taskCount} tasks
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-[#0f172a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4F46E5] dark:bg-[#818CF8] rounded-full transition-all duration-300"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        members={isDemoWorkspace ? MOCK_USERS : memberOptions}
      />
    </div>
  );
}
