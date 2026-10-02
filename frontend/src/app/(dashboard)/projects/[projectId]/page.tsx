"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { KanbanBoard } from "@/features/tasks/components/kanban-board";
import { useProject } from "@/features/projects/hooks/use-projects";
import { Priority, ProjectStatus } from "@/types/common";

export default function ProjectBoardPage() {
  const params = useParams();
  const projectId = (params?.projectId as string) || "project";
  const { data: serverProject, isLoading } = useProject(projectId);

  const currentProject = useMemo(() => {
    if (serverProject) {
      return {
        id: serverProject.id,
        name: serverProject.name,
        key: serverProject.key,
        description: serverProject.description || null,
        status: (serverProject.status as any) || ProjectStatus.ACTIVE,
        priority: Priority.HIGH,
        workspaceId: serverProject.workspace_id,
        createdById: serverProject.lead_id || "user",
        createdBy: serverProject.lead
          ? {
              id: serverProject.lead.id,
              name: serverProject.lead.name,
              email: serverProject.lead.email,
            }
          : undefined,
        createdAt: serverProject.createdAt || new Date().toISOString(),
        updatedAt: serverProject.updatedAt || new Date().toISOString(),
        taskCount: serverProject.taskCount || 0,
        completedTaskCount: serverProject.completedTaskCount || 0,
      };
    }
    return {
      id: projectId,
      name: "Project Board",
      key: "PRJ",
      description: null,
      status: ProjectStatus.ACTIVE,
      priority: Priority.HIGH,
      taskCount: 0,
      completedTaskCount: 0,
    };
  }, [serverProject, projectId]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col min-h-0 flex-1 p-6 space-y-4 animate-pulse">
        <div className="h-9 w-56 bg-slate-200 dark:bg-slate-800/60 rounded-xl" />
        <div className="flex-1 flex gap-3">
          <div className="w-72 h-80 bg-slate-200 dark:bg-slate-800/40 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0 flex-1 overflow-hidden">
      <KanbanBoard projectId={projectId} project={currentProject} />
    </div>
  );
}
