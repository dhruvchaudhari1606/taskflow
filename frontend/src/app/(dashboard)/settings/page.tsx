"use client";

import React, { useState } from "react";
import {
  Building,
  CreditCard,
  Trash2,
  Check,
  Save,
  Palette,
  Sun,
  Moon,
  Laptop,
  Copy,
  ExternalLink,
  Users,
  AlertTriangle,
  Layers,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/common/theme-provider";
import {
  useWorkspaces,
  useUpdateWorkspace,
  useDeleteWorkspace,
  useWorkspaceMembers,
  useWorkspaceInvitations,
  useCurrentWorkspaceRole,
} from "@/features/workspace/hooks/use-workspaces";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { RoleBadge } from "@/components/common/badge-status";
import { MOCK_WORKSPACE } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { workspaceUrl, PLAN_SEAT_LIMIT } from "@/constants/app";

export default function SettingsPage() {
  const { activeWorkspace } = useWorkspaces();
  const { data: members = [] } = useWorkspaceMembers(activeWorkspace?.id);
  const { data: invitations = [] } = useWorkspaceInvitations(activeWorkspace?.id);
  const { data: projects = [] } = useProjects(activeWorkspace?.id);
  const currentRole = useCurrentWorkspaceRole(activeWorkspace?.id);

  // Real usage figures (same seat formula as the Team page: members + pending invites)
  const seatsUsed = members.length + invitations.length;
  const seatPercent = Math.min(Math.round((seatsUsed / PLAN_SEAT_LIMIT) * 100), 100);
  const totalTasks = projects.reduce((sum, p) => sum + (p.taskCount ?? 0), 0);
  const completedTasks = projects.reduce((sum, p) => sum + (p.completedTaskCount ?? 0), 0);
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const updateWorkspaceMutation = useUpdateWorkspace();
  const deleteWorkspaceMutation = useDeleteWorkspace();

  const [workspaceName, setWorkspaceName] = useState(
    activeWorkspace?.name || MOCK_WORKSPACE.name
  );
  const [workspaceSlug, setWorkspaceSlug] = useState(
    activeWorkspace?.slug || MOCK_WORKSPACE.slug
  );
  const [description, setDescription] = useState(
    activeWorkspace?.description ||
      "Primary engineering and high-velocity product delivery workspace."
  );
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [sprintCycle, setSprintCycle] = useState("2_weeks");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  // Sync workspace fields when the active workspace loads (adjusted during render rather than in an effect)
  const [syncedDeps, setSyncedDeps] = useState<unknown[] | null>(null);
  if (!syncedDeps || syncedDeps[0] !== activeWorkspace) {
    setSyncedDeps([activeWorkspace]);
    if (activeWorkspace) {
      setWorkspaceName(activeWorkspace.name);
      setWorkspaceSlug(activeWorkspace.slug);
      if (activeWorkspace.description) {
        setDescription(activeWorkspace.description);
      }
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace?.id) return;

    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        activeWorkspace.id
      );

    if (isUUID) {
      updateWorkspaceMutation.mutate({
        workspaceId: activeWorkspace.id,
        payload: {
          name: workspaceName.trim(),
          slug: workspaceSlug.trim(),
          description: description.trim(),
        },
      });
    } else {
      toast.success("Workspace settings updated successfully!");
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDeleteWorkspace = () => {
    if (!activeWorkspace?.id) return;
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        activeWorkspace.id
      );
    if (isUUID) {
      deleteWorkspaceMutation.mutate(activeWorkspace.id);
    } else {
      toast.success("Workspace archived");
    }
    setShowArchiveConfirm(false);
  };

  const handleCopyUrl = () => {
    const url = workspaceUrl(workspaceSlug);
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Workspace URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const wsInitials = (workspaceName || "TF").substring(0, 2).toUpperCase();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* ─── Top Header Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#4F46E5] dark:text-[#818cf8]">
              Workspace Settings
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-800/40 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            General & Organization Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your workspace brand identity, theme preferences, seat allocation, and platform controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={handleSave}
            className="bg-[#4F46E5] hover:bg-[#3525cd] text-white text-xs font-bold h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ─── Responsive 2-Column Dashboard Grid (Eliminates Right-Side Empty Void) ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
        {/* ─── Left Column (Col 7 / 12): Workspace Profile & Billing Quotas ─── */}
        <div className="xl:col-span-7 space-y-6">
          {/* Workspace Profile Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-[#818cf8] flex items-center justify-center font-extrabold text-sm border border-indigo-200/40 dark:border-indigo-800/40">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Workspace Profile & Identity
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Public branding and identifiers across your project teams
                  </p>
                </div>
              </div>
              {currentRole && <RoleBadge role={currentRole} />}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Avatar row */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                <div className="w-12 h-12 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-extrabold text-base shadow-xs shrink-0">
                  {wsInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {workspaceName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    SVG or PNG up to 2MB recommended
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 rounded-lg font-semibold cursor-pointer border-slate-200 dark:border-slate-700"
                  onClick={() => toast.info("Custom avatar upload will be available in next sprint")}
                >
                  Change Logo
                </Button>
              </div>

              {/* Workspace Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Alpha Operations"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
                  required
                />
              </div>

              {/* Workspace Slug / URL with One-Click Copy */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Workspace Public Slug & URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-500 font-mono overflow-hidden">
                    <span className="shrink-0 text-slate-400 select-none">{workspaceUrl()}</span>
                    <input
                      type="text"
                      value={workspaceSlug}
                      onChange={(e) => setWorkspaceSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                      className="bg-transparent text-slate-900 dark:text-white font-bold outline-none flex-1 min-w-0"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyUrl}
                    className="h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Copy full workspace URL"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Workspace Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Description / Mission
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your workspace mission and deliverables..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all resize-none"
                />
              </div>

              {/* Regional Preferences Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Default Timezone
                  </label>
                  <div className="relative">
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5] cursor-pointer"
                    >
                      <option value="Asia/Kolkata">UTC+05:30 (India Standard Time)</option>
                      <option value="America/New_York">UTC-05:00 (Eastern Time - US)</option>
                      <option value="America/Los_Angeles">UTC-08:00 (Pacific Time - US)</option>
                      <option value="Europe/London">UTC+00:00 (GMT / London)</option>
                      <option value="Asia/Tokyo">UTC+09:00 (Tokyo / Japan)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Sprint Cadence
                  </label>
                  <select
                    value={sprintCycle}
                    onChange={(e) => setSprintCycle(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5] cursor-pointer"
                  >
                    <option value="1_week">1 Week (High Velocity)</option>
                    <option value="2_weeks">2 Weeks (Standard Sprint)</option>
                    <option value="3_weeks">3 Weeks (Extended Cycle)</option>
                    <option value="1_month">1 Month (Milestone Driven)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#4F46E5] hover:bg-[#3525cd] text-white text-xs font-bold h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {saved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Changes Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Profile</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Subscription & Billing Usage Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0051d5] dark:text-blue-400 flex items-center justify-center font-extrabold text-sm border border-blue-200/40 dark:border-blue-800/40">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Subscription & Resource Quotas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live team seat allocations, task progress, and billing cycle
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                Active Plan
              </span>
            </div>

            {/* Plan Details Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Growth Tier ($29/seat/month)
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Annual Billing (20% Off)
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Billed annually per seat. Includes {PLAN_SEAT_LIMIT} seats.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 px-3 rounded-xl border-slate-200 dark:border-slate-700 font-semibold cursor-pointer flex items-center gap-1"
                  onClick={() => toast.info("Redirecting to Stripe Customer Portal...")}
                >
                  <span>Manage in Stripe</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Button>
              </div>
            </div>

            {/* Progress Meters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Seats Usage */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span>Member Seats</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {seatsUsed} / {PLAN_SEAT_LIMIT} ({seatPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#4F46E5] h-full rounded-full transition-all duration-500"
                    style={{ width: `${seatPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {Math.max(PLAN_SEAT_LIMIT - seatsUsed, 0)} available seats remaining on tier
                </p>
              </div>

              {/* Workspace task progress (real data, replaces a hard-coded storage meter) */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-500" />
                    <span>Tasks Completed</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {completedTasks} / {totalTasks} ({taskPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${taskPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Across {projects.length} {projects.length === 1 ? "project" : "projects"} in this workspace
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Column (Col 5 / 12): Theme & Appearance + Danger Zone ─── */}
        <div className="xl:col-span-5 space-y-6">
          {/* Appearance & Theme Preferences Card */}
          <ThemeSettingsSection />

          {/* Danger Zone Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#131b2e] border border-rose-200/90 dark:border-rose-950/70 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-rose-100 dark:border-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  Workspace Safety & Danger Zone
                </h3>
                <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  Destructive actions affecting all projects, Kanban boards, and members
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Export Workspace Archive
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Download complete snapshot in JSON/CSV format
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("Workspace archive export initiated")}
                  className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer border-slate-200 dark:border-slate-700 shrink-0"
                >
                  <FileDown className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>Export</span>
                </Button>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300">
                    Archive Workspace
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Make workspace read-only and suspend billing
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowArchiveConfirm(true)}
                  className="h-8 px-3 rounded-lg text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-100 dark:hover:bg-rose-950/60 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>Archive</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Archive Workspace */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Archive &quot;{workspaceName}&quot;?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Archiving will freeze all active Kanban tasks, deactivate notifications, and place the workspace into read-only mode.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowArchiveConfirm(false)}
                className="text-xs h-9 px-4 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteWorkspace}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 px-4 rounded-xl font-bold"
              >
                Confirm Archive
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeSettingsSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-[#818cf8] flex items-center justify-center font-extrabold text-sm border border-indigo-200/40 dark:border-indigo-800/40">
          <Palette className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Interface Appearance & Theme
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tailor the color palette to your lighting environment
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {/* Light Mode Option */}
        <div
          onClick={() => setTheme("light")}
          className={cn(
            "p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3.5",
            theme === "light"
              ? "border-[#4F46E5] bg-[#faf8ff] dark:bg-indigo-950/30 shadow-xs"
              : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#0f172a]"
          )}
        >
          <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
            <Sun className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Light Mode
              </span>
              {theme === "light" && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] ring-4 ring-indigo-100 dark:ring-indigo-950" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Clean lavender-white surfaces with high-contrast indigo accents
            </p>
          </div>
        </div>

        {/* Stitch Dark Option */}
        <div
          onClick={() => setTheme("dark")}
          className={cn(
            "p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3.5",
            theme === "dark"
              ? "border-[#818cf8] bg-indigo-950/40 shadow-xs ring-1 ring-indigo-500/40"
              : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#0f172a]"
          )}
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-[#818cf8] flex items-center justify-center shrink-0">
            <Moon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Stitch Dark</span>
                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-[#818cf8] text-[9px] font-extrabold uppercase">
                  Recommended
                </span>
              </span>
              {theme === "dark" && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#818cf8] ring-4 ring-indigo-950" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Deep slate #0b0f17 with high-density glowing indigo &amp; sky tokens
            </p>
          </div>
        </div>

        {/* System Default Option */}
        <div
          onClick={() => setTheme("system")}
          className={cn(
            "p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3.5",
            theme === "system"
              ? "border-[#4F46E5] dark:border-[#818cf8] bg-slate-50 dark:bg-slate-900/60 shadow-xs"
              : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#0f172a]"
          )}
        >
          <div className="w-9 h-9 rounded-lg bg-slate-500/15 text-slate-500 flex items-center justify-center shrink-0">
            <Laptop className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                System Default
              </span>
              {theme === "system" && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] dark:bg-[#818cf8] ring-4 ring-slate-200 dark:ring-slate-800" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Automatically adapts with your operating system day/night schedule
            </p>
          </div>
        </div>
      </div>

      {/* High-density view badge */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#818cf8]" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Layout Density:</span>
        </span>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
          Compact View Active
        </span>
      </div>
    </div>
  );
}
