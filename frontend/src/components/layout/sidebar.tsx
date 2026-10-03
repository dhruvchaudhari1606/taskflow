"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  ChevronDown,
  ChevronsLeft,
  Pin,
  LogOut,
  Sparkles,
  Check,
  Plus,
  Building2,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Avatar } from "@/components/common/avatar";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { clearDemoAuthSession } from "@/lib/auth/demo-auth";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useWorkspaces, useCreateWorkspace } from "@/features/workspace/hooks/use-workspaces";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { pickFeaturedProject, projectProgress } from "@/features/projects/utils";

interface SidebarProps {
  pinned?: boolean;
  onHide?: () => void;
  onExpand?: () => void;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  badge?: string;
}

export function Sidebar({
  pinned = true,
  onHide,
  onExpand,
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [createWsModalOpen, setCreateWsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const workspaceMenuRef = useRef<HTMLDivElement>(null);

  // Close workspace menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        workspaceMenuRef.current &&
        !workspaceMenuRef.current.contains(e.target as Node)
      ) {
        setWorkspaceMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setWorkspaceMenuOpen(false);
      }
    };

    if (workspaceMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [workspaceMenuOpen]);

  const { user } = useCurrentUser();
  const { clearAuth } = useAuthStore();
  const { workspaces, activeWorkspace, selectWorkspace } = useWorkspaces();
  const { data: projects = [] } = useProjects(activeWorkspace?.id);
  const createWorkspaceMutation = useCreateWorkspace();

  const handleSignOut = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore if session already invalid
    }
    clearAuth();
    clearDemoAuthSession();
    router.push(ROUTES.LOGIN);
  };

  const handleCreateWorkspaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    createWorkspaceMutation.mutate(
      { name: newWsName.trim() },
      {
        onSuccess: () => {
          setNewWsName("");
          setCreateWsModalOpen(false);
          setWorkspaceMenuOpen(false);
        },
      }
    );
  };

  // Featured project for the bottom widget (busiest project, with real progress)
  const activeProject = pickFeaturedProject(projects);
  const activeProgress = activeProject ? projectProgress(activeProject) : 0;

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: ROUTES.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      label: "Projects",
      href: ROUTES.PROJECTS,
      icon: FolderKanban,
      count: projects.length,
    },
    {
      label: "Tasks",
      href: ROUTES.TASKS,
      icon: CheckSquare,
    },
    {
      label: "Team",
      href: ROUTES.TEAM,
      icon: Users,
    },
    {
      label: "Settings",
      href: ROUTES.SETTINGS,
      icon: Settings,
    },
  ];

  const wsInitials = (activeWorkspace?.name || "TF")
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "h-screen flex flex-col justify-between bg-white dark:bg-[#111827] border-r border-slate-200/80 dark:border-[#334155] transition-all duration-200",
        pinned
          ? "sticky top-0 z-40 w-64 shrink-0"
          : cn(
              "fixed top-0 bottom-0 left-0 z-50 w-64 shadow-2xl",
              isHovered ? "translate-x-0" : "-translate-x-full pointer-events-none"
            )
      )}
    >
      {/* Top Section */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand & Single Action Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-[#334155]">
          <Logo size="md" href={ROUTES.DASHBOARD} textClassName="text-lg" />

          {pinned ? (
            onHide && (
              <button
                onClick={onHide}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-colors cursor-pointer"
                title="Hide sidebar"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            )
          ) : (
            onExpand && (
              <button
                onClick={onExpand}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#4F46E5] dark:hover:text-[#818cf8] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                title="Pin sidebar open"
              >
                <Pin className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        {/* Workspace Switcher */}
        <div className="p-3 relative" ref={workspaceMenuRef}>
          <div
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-[#faf8ff] dark:bg-[#0f172a] border border-slate-100 dark:border-[#334155] cursor-pointer hover:border-[#4F46E5]/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {wsInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-[#f8fafc] truncate">
                  {activeWorkspace?.name || "Workspace"}
                </span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 transition-transform duration-200",
                    workspaceMenuOpen && "rotate-180"
                  )}
                />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-[#94a3b8] truncate block">
                {projects.length} {projects.length === 1 ? "Project" : "Projects"}
              </span>
            </div>
          </div>

          {/* Workspace Dropdown Menu */}
          {workspaceMenuOpen && (
            <div className="absolute left-3 right-3 top-16 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] rounded-xl shadow-xl p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Your Workspaces
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto py-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      selectWorkspace(ws);
                      setWorkspaceMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer",
                      ws.id === activeWorkspace?.id
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1e293b]"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded bg-[#4F46E5]/20 text-[#4F46E5] dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {ws.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate">{ws.name}</span>
                    </div>
                    {ws.id === activeWorkspace?.id && (
                      <Check className="w-3.5 h-3.5 shrink-0 text-[#4F46E5]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCreateWsModalOpen(true);
                    setWorkspaceMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-[#4F46E5] dark:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== ROUTES.DASHBOARD && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                  isActive
                    ? "bg-[#e2dfff] text-[#3525cd] shadow-xs dark:bg-[#312E81]/50 dark:text-[#818cf8] dark:border dark:border-indigo-500/30"
                    : "text-slate-600 dark:text-[#94a3b8] hover:bg-slate-100/80 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-[#f8fafc]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-[#3525cd] dark:text-[#818cf8]" : "text-slate-500 dark:text-[#94a3b8]"
                  )}
                />
                <div className="flex-1 flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[#4F46E5] text-[10px] font-bold text-white uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === "number" && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.count}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Project Health & Profile */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {/* Project Target Widget */}
        {activeProject && (
          <Link
            href={ROUTES.project(activeProject.id)}
            title={`Open ${activeProject.name} board`}
            className="block p-3 rounded-xl bg-[#faf8ff] dark:bg-[#0f172a] border border-slate-100 dark:border-[#334155] hover:border-[#4F46E5]/50 transition-colors space-y-2"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-[#f8fafc]">
              <span className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#818cf8] shrink-0" />
                <span className="truncate">{activeProject.name}</span>
              </span>
              <span className="text-[#4F46E5] dark:text-[#818cf8] text-[11px] font-mono">
                {activeProject.key}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-[#334155] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#4F46E5] dark:bg-[#818cf8] h-full rounded-full transition-all duration-500"
                style={{ width: `${activeProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-[#94a3b8]">
              <span>
                {activeProject.completedTaskCount ?? 0} / {activeProject.taskCount ?? 0} tasks done
              </span>
              <span className="font-semibold text-[#4F46E5] dark:text-[#818cf8]">
                {activeProgress}%
              </span>
            </div>
          </Link>
        )}

        {/* User Account / Sign Out */}
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
              name={user?.name || activeWorkspace?.name}
              fallback={user?.name || activeWorkspace?.name}
              alt={user?.name || activeWorkspace?.name || "User"}
              src={user?.avatarUrl ?? undefined}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-[#f8fafc] truncate">
                {user?.name || activeWorkspace?.name || "Authenticated User"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-[#94a3b8] truncate">
                {user?.email || "team@taskflow.test"}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal: Create Workspace */}
      {createWsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
              <Building2 className="w-5 h-5 text-[#4F46E5]" />
              <span>Create Workspace</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Each workspace provides an isolated space for your team, projects, and Kanban boards.
            </p>
            <form onSubmit={handleCreateWorkspaceSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="Engineering Core"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateWsModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createWorkspaceMutation.isPending || !newWsName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#4F46E5] text-white hover:bg-[#3b32c6] disabled:opacity-50"
                >
                  {createWorkspaceMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
