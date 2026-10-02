"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FolderKanban,
  ArrowLeft,
  Save,
  Trash2,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Kanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
} from "@/features/projects/hooks/use-projects";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const { data: serverProject, isLoading } = useProject(projectId);
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Engineering");
  const [status, setStatus] = useState<"PLANNING" | "ACTIVE" | "COMPLETED" | "ON_HOLD">("ACTIVE");
  const [targetDate, setTargetDate] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync form state from server (or demo fallback) on mount and whenever the
  // project changes. Adjusted during render to avoid an extra effect pass.
  const [synced, setSynced] = useState<{
    project: typeof serverProject;
    projectId: string;
  } | null>(null);
  if (
    !synced ||
    synced.project !== serverProject ||
    synced.projectId !== projectId
  ) {
    setSynced({ project: serverProject, projectId });
    if (serverProject) {
      setName(serverProject.name);
      setKey(serverProject.key);
      setDescription(serverProject.description || "");
      if (serverProject.category) setCategory(serverProject.category);
      if (serverProject.status) setStatus(serverProject.status as any);
      if (serverProject.target_date) {
        setTargetDate(new Date(serverProject.target_date).toISOString().split("T")[0]);
      }
    } else {
      const mock = MOCK_PROJECTS.find((p) => p.id === projectId);
      if (mock) {
        setName(mock.name);
        setKey(mock.name.slice(0, 4).toUpperCase());
        setDescription(mock.description || "");
      }
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        projectId
      );

    if (isUUID) {
      updateProjectMutation.mutate({
        projectId,
        payload: {
          name: name.trim(),
          key: key.trim().toUpperCase(),
          description: description.trim() || undefined,
          category,
          status,
          target_date: targetDate || undefined,
        },
      });
    } else {
      toast.success("Project settings updated successfully!");
    }
  };

  const handleDelete = () => {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        projectId
      );

    if (isUUID) {
      deleteProjectMutation.mutate(
        {
          projectId,
          workspaceId: serverProject?.workspace_id,
        },
        {
          onSuccess: () => {
            router.push(ROUTES.PROJECTS);
          },
        }
      );
    } else {
      toast.success("Project deleted successfully");
      router.push(ROUTES.PROJECTS);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-16">
      {/* ─── Top Header Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${projectId}`}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Kanban Board</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs uppercase font-bold tracking-wider text-[#4F46E5]">
              Project Configuration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Project Settings: {name || "Project"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure delivery milestones, sprint metadata, and project lifecycle rules.
          </p>
        </div>

        <Link href={`/projects/${projectId}`}>
          <Button
            variant="outline"
            className="text-xs h-9 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 flex items-center gap-1.5 shadow-2xs"
          >
            <Kanban className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>Open Board</span>
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* ─── General Project Details Form ─── */}
        <form
          onSubmit={handleSave}
          className="p-6 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Project Metadata & Scope
              </h2>
              <p className="text-xs text-slate-500">
                Core identity identifiers used across Kanban boards and tasks
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Project Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Project Key
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                className="w-full text-xs font-mono font-bold uppercase bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description & Objectives
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 cursor-pointer"
              >
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active (In Delivery)</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 cursor-pointer"
              >
                <option value="Engineering">Engineering</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Product Design">Product Design</option>
                <option value="Security">Security & Compliance</option>
                <option value="Marketing">Marketing & Launch</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={updateProjectMutation.isPending}
              className="bg-[#4F46E5] hover:bg-[#3525cd] text-white text-xs font-bold rounded-xl h-9 px-4 shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{updateProjectMutation.isPending ? "Saving..." : "Save Project Settings"}</span>
            </Button>
          </div>
        </form>

        {/* ─── Danger Zone Card ─── */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#131b2e] border border-rose-200/90 dark:border-rose-950/70 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-rose-100 dark:border-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
                Danger Zone
              </h3>
              <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                Permanent actions affecting all Kanban columns and sprint tasks in this project
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300">
                Delete Project
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Archive and delete this project and all associated tasks
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="h-8 px-3.5 rounded-lg text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-100 dark:hover:bg-rose-950/60 cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              <span>Delete Project</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete &quot;{name}&quot;?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This action will archive all associated Kanban tasks and remove the project from your active workspace list.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs h-9 px-4 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 px-4 rounded-xl font-bold"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
