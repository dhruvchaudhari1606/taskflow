"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  ChevronRight,
  Sparkles,
  Command,
  Check,
  CheckCircle2,
  FolderPlus,
  UserPlus,
  ExternalLink,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/common/avatar";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/auth-store";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { useProjects } from "@/features/projects/hooks/use-projects";

interface HeaderProps {
  onOpenNewTaskModal?: () => void;
  onOpenNewProjectModal?: () => void;
  onOpenInviteModal?: () => void;
  sidebarPinned?: boolean;
  onExpandSidebar?: () => void;
}

export function Header({
  onOpenNewTaskModal,
  onOpenNewProjectModal,
  onOpenInviteModal,
  sidebarPinned = false,
  onExpandSidebar,
}: HeaderProps) {
  const pathname = usePathname();
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (createMenuRef.current && !createMenuRef.current.contains(target)) {
        setCreateMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCreateMenuOpen(false);
        setNotificationsOpen(false);
      }
    };

    if (createMenuOpen || notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [createMenuOpen, notificationsOpen]);

  const { user } = useCurrentUser();
  const { activeWorkspace } = useWorkspaces();
  const { data: serverProjects = [] } = useProjects(activeWorkspace?.id);

  // Derive breadcrumbs based on current path
  const getBreadcrumbs = () => {
    if (pathname.startsWith("/projects/")) {
      const parts = pathname.split("/");
      const currentProjId = parts[2];
      const foundProject = serverProjects.find((p) => p.id === currentProjId);
      const projLabel = foundProject?.name || "Board";
      return [
        { label: "Projects", href: ROUTES.PROJECTS },
        { label: projLabel, href: pathname },
      ];
    }
    if (pathname === ROUTES.PROJECTS) {
      return [{ label: "Projects", href: ROUTES.PROJECTS }];
    }
    if (pathname === ROUTES.TEAM) {
      return [{ label: "Team Members", href: ROUTES.TEAM }];
    }
    if (pathname === ROUTES.SETTINGS) {
      return [{ label: "Workspace Settings", href: ROUTES.SETTINGS }];
    }
    return [{ label: "Overview", href: ROUTES.DASHBOARD }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-14 px-4 sm:px-6 bg-white dark:bg-[#131b2e] border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Breadcrumbs & Context Pill */}
      <div className="flex items-center gap-3">
        {!sidebarPinned && onExpandSidebar && (
          <button
            onClick={onExpandSidebar}
            className="p-1.5 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}
        <nav className="flex items-center gap-2 text-xs font-semibold">
          <Link
            href={ROUTES.DASHBOARD}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {activeWorkspace?.name || "Workspace"}
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-slate-900 dark:text-white font-bold">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Right: Search, Quick Add, Notifications & User */}
      <div className="flex items-center gap-3">
        {/* Quick Search Trigger */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs text-slate-400 hover:border-[#4F46E5]/40 cursor-pointer transition-colors w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="flex-1 truncate">Search tasks, projects...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-500">
            ⌘K
          </kbd>
        </div>

        {/* Global Create Button Dropdown */}
        <div className="relative" ref={createMenuRef}>
          <Button
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
            className="h-9 px-3.5 bg-[#4F46E5] hover:bg-[#3525cd] text-white rounded-xl shadow-xs font-semibold text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </Button>

          {createMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#131b2e] rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setCreateMenuOpen(false)}
            >
              <button
                onClick={() => {
                  setCreateMenuOpen(false);
                  onOpenNewTaskModal?.();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
              >
                <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                <span>New Task</span>
              </button>
              <button
                onClick={() => {
                  setCreateMenuOpen(false);
                  onOpenNewProjectModal?.();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
              >
                <FolderPlus className="w-4 h-4 text-[#0051d5]" />
                <span>New Project</span>
              </button>
              <button
                onClick={() => {
                  setCreateMenuOpen(false);
                  onOpenInviteModal?.();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
              >
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>Invite Member</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4F46E5] ring-2 ring-white dark:ring-[#131b2e]" />
          </button>

          {notificationsOpen && (
            <div
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#131b2e] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setNotificationsOpen(false)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Notifications
                </span>
                <span className="text-[10px] font-semibold text-[#4F46E5]">
                  Mark all read
                </span>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2 rounded-lg bg-[#faf8ff] dark:bg-slate-800/40 text-xs space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Alex Rivera moved task
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    &quot;JWT refresh rotation&quot; was submitted for code review.
                  </p>
                  <span className="text-[10px] text-slate-400">12m ago</span>
                </div>
                <div className="p-2 rounded-lg text-xs space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Elena Chen left a comment
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    &quot;Tested with axe-core, AA passes.&quot;
                  </p>
                  <span className="text-[10px] text-slate-400">35m ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Avatar */}
        <Link href={ROUTES.SETTINGS} title={user?.name || "Settings"}>
          <Avatar
            name={user?.name || activeWorkspace?.name}
            fallback={user?.name || activeWorkspace?.name}
            alt={user?.name || activeWorkspace?.name || "User"}
            src={user?.avatarUrl ?? undefined}
            size="sm"
            className="ring-2 ring-slate-100 dark:ring-slate-800 cursor-pointer hover:ring-[#4F46E5]/50 transition-all"
          />
        </Link>
      </div>
    </header>
  );
}
