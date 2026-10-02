import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  projectsApi,
  ProjectResponse,
  CreateProjectPayload,
} from "@/lib/api/projects";
import { toast } from "sonner";

export const PROJECTS_QUERY_KEY = (workspaceId?: string) => [
  "projects",
  workspaceId,
];

export const PROJECT_DETAIL_QUERY_KEY = (projectId?: string) => [
  "project",
  projectId,
];

export function useProjects(workspaceId?: string) {
  return useQuery({
    queryKey: PROJECTS_QUERY_KEY(workspaceId),
    queryFn: async () => {
      if (!workspaceId) return [];
      return projectsApi.getWorkspaceProjects(workspaceId);
    },
    enabled: Boolean(workspaceId),
    staleTime: 1000 * 60 * 2, // 2 mins
  });
}

export function useProject(projectId?: string) {
  return useQuery({
    queryKey: PROJECT_DETAIL_QUERY_KEY(projectId),
    queryFn: async () => {
      if (!projectId) return null;
      return projectsApi.getProjectById(projectId);
    },
    enabled: Boolean(projectId),
  });
}

export function useProjectHealth(projectId?: string) {
  return useQuery({
    queryKey: ["project-health", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      return projectsApi.getProjectHealth(projectId);
    },
    enabled: Boolean(projectId),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) =>
      projectsApi.createProject(payload),
    onSuccess: (newProj) => {
      queryClient.invalidateQueries({
        queryKey: PROJECTS_QUERY_KEY(newProj.workspace_id),
      });
      toast.success(`Project "${newProj.name}" created!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to create project";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: Partial<CreateProjectPayload>;
    }) => projectsApi.updateProject(projectId, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: PROJECTS_QUERY_KEY(updated.workspace_id),
      });
      queryClient.invalidateQueries({
        queryKey: PROJECT_DETAIL_QUERY_KEY(updated.id),
      });
      toast.success(`Project "${updated.name}" updated successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to update project";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      workspaceId,
    }: {
      projectId: string;
      workspaceId?: string;
    }) => projectsApi.deleteProject(projectId),
    onSuccess: (_, vars) => {
      if (vars.workspaceId) {
        queryClient.invalidateQueries({
          queryKey: PROJECTS_QUERY_KEY(vars.workspaceId),
        });
      }
      toast.success("Project deleted successfully");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to delete project";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

