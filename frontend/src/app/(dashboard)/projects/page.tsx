"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FolderKanban,
  FolderPlus,
  Plus,
  Search,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/common/avatar";
import { PriorityBadge } from "@/components/common/badge-status";
import { Project, ProjectStatus, Priority } from "@/types/common";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { useProjects, useCreateProject } from "@/features/projects/hooks/use-projects";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const { activeWorkspace } = useWorkspaces();
  const { data: serverProjects, isLoading } = useProjects(activeWorkspace?.id);
  const createProjectMutation = useCreateProject();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  const projects: Project[] = useMemo(() => {
    if (serverProjects && serverProjects.length > 0) {
      return serverProjects.map((sp) => ({
        id: sp.id,
        name: sp.name,
        description: sp.description || null,
        status: (sp.status as any) || ProjectStatus.ACTIVE,
        priority: Priority.HIGH,
        workspaceId: sp.workspace_id,
        createdById: sp.lead_id || user?.id || "user",
        createdBy: sp.lead
          ? {
              id: sp.lead.id,
              name: sp.lead.name,
              email: sp.lead.email,
            }
          : {
              id: user?.id || "user",
              name: user?.name || "Workspace Member",
              email: user?.email || "",
            },
        createdAt: sp.createdAt || new Date().toISOString(),
        updatedAt: sp.updatedAt || new Date().toISOString(),
        taskCount: sp.taskCount || 0,
        completedTaskCount: sp.completedTaskCount || 0,
      }));
    }
    return [];
  }, [serverProjects, user]);

  const filteredProjects = projects.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filterStatus !== "ALL" && p.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    if (!activeWorkspace?.id) {
      toast.error("Please select a workspace before creating a project.");
      return;
    }

    const key = newProjectName.trim().slice(0, 4).toUpperCase();
    try {
      await createProjectMutation.mutateAsync({
        workspace_id: activeWorkspace.id,
        name: newProjectName.trim(),
        key: key.length >= 2 ? key : "PRJ",
        description: newProjectDesc.trim() || undefined,
        status: "ACTIVE",
      });
      setNewProjectModalOpen(false);
      setNewProjectName("");
      setNewProjectDesc("");
    } catch {
      // Handled by mutation hook toast
    }
  };

  const currentWorkspaceName = activeWorkspace?.name || "Workspace";

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#4F46E5]">
              {currentWorkspaceName}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500">Project Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Workspace Projects & Initiatives
          </h1>
        </div>

        <div>
          <Button
            onClick={() => setNewProjectModalOpen(true)}
            className="bg-[#4F46E5] hover:bg-[#3525cd] text-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200/80 dark:border-[#334155] animate-pulse space-y-4"
            >
              <div className="flex justify-between">
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 sm:p-16 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#334155] shadow-xs text-center max-w-xl mx-auto my-12 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 mb-5 shadow-xs">
            <FolderPlus className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No Projects Created Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            There are currently no projects in this workspace. Please create your first project to begin organizing initiatives, managing tasks, and collaborating with your team on Kanban boards.
          </p>
          <Button
            onClick={() => setNewProjectModalOpen(true)}
            className="bg-[#4F46E5] hover:bg-[#3525cd] text-white text-xs font-bold rounded-xl h-11 px-6 shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Project</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#334155] shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#334155] bg-[#faf8ff] dark:bg-[#0f172a] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setFilterStatus("ALL")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                  filterStatus === "ALL"
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"
                }`}
              >
                All ({projects.length})
              </button>
              <button
                onClick={() => setFilterStatus(ProjectStatus.ACTIVE)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                  filterStatus === ProjectStatus.ACTIVE
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"
                }`}
              >
                Active
              </button>
            </div>
          </div>

          {/* Filtered Projects Grid or No Search Match */}
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#334155] text-center my-6">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No projects matching your search criteria
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try adjusting your search terms or clearing status filters.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setFilterStatus("ALL");
                }}
                className="mt-4 text-xs h-9 px-4 rounded-xl cursor-pointer"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const completionPercent = Math.round(
                  ((project.completedTaskCount ?? 0) / (project.taskCount || 1)) * 100
                );

                return (
                  <div
                    key={project.id}
                    className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200/80 dark:border-[#334155] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#4F46E5] dark:hover:border-[#818CF8] transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <PriorityBadge priority={project.priority} />
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                          {project.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors">
                        {project.name}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-[#94A3B8] line-clamp-3 leading-relaxed">
                        {project.description || "No project description provided."}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#334155] space-y-4">
                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-[#94A3B8]">
                          <span>{completionPercent}% Progress</span>
                          <span>
                            {project.completedTaskCount} / {project.taskCount} tasks
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-[#0f172a] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#4F46E5] dark:bg-[#818CF8] rounded-full transition-all duration-300"
                            style={{ width: `${completionPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar
                            fallback={project.createdBy?.name || "Lead"}
                            size="xs"
                            className="ring-2 ring-white dark:ring-[#1E293B]"
                          />
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {project.createdBy?.name || "Lead"}
                          </span>
                        </div>

                        <Link href={`/projects/${project.id}`}>
                          <Button className="h-8 px-3 text-xs bg-[#faf8ff] hover:bg-[#4F46E5] text-[#4F46E5] hover:text-white dark:bg-[#0f172a] dark:text-[#F8FAFC] border border-slate-200/80 dark:border-[#334155] rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer">
                            <span>Open Board</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* New Project Modal */}
      {newProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#111827] rounded-2xl w-full max-w-md shadow-2xl border border-slate-200/80 dark:border-[#334155] overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#334155] flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                Create New Project
              </h3>
              <button
                onClick={() => setNewProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile App v2.0 Architecture"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Project Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Scope, key milestones, target launch date..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewProjectModalOpen(false)}
                  className="text-xs h-10 px-4 rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createProjectMutation.isPending || !newProjectName.trim()}
                  className="bg-[#4F46E5] hover:bg-[#3525cd] text-white text-xs font-bold h-10 px-5 rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
