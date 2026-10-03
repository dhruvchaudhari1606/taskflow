import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  tasksApi,
  CreateTaskPayload,
  UpdateTaskPayload,
  ReorderTaskPayload,
} from "@/lib/api/tasks";
import {
  projectsApi,
  CreateColumnPayload,
  UpdateColumnPayload,
  BoardColumnResponse,
} from "@/lib/api/projects";
import { Task, TaskComment } from "@/types/common";
import { toast } from "sonner";

export const TASKS_QUERY_KEY = (projectId?: string) => [
  "tasks",
  projectId,
];

export const TASK_DETAIL_QUERY_KEY = (taskId?: string) => [
  "task",
  taskId,
];

export const TASK_COMMENTS_QUERY_KEY = (taskId?: string) => [
  "task-comments",
  taskId,
];

export const WORKSPACE_TASKS_QUERY_KEY = (workspaceId?: string) => [
  "workspace-tasks",
  workspaceId,
];

export function useProjectTasks(projectId?: string) {
  return useQuery({
    queryKey: TASKS_QUERY_KEY(projectId),
    queryFn: async () => {
      if (!projectId) return [];
      return tasksApi.getProjectTasks(projectId);
    },
    enabled: Boolean(projectId),
    staleTime: 1000 * 30, // 30s
  });
}

export function useWorkspaceTasks(workspaceId?: string) {
  return useQuery({
    queryKey: WORKSPACE_TASKS_QUERY_KEY(workspaceId),
    queryFn: async () => {
      if (!workspaceId) return [];
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          workspaceId
        );
      if (!isUUID) return [];
      return tasksApi.getWorkspaceTasks(workspaceId);
    },
    enabled: Boolean(workspaceId),
    staleTime: 1000 * 20, // 20s
  });
}

export function useTask(taskId?: string) {
  return useQuery({
    queryKey: TASK_DETAIL_QUERY_KEY(taskId),
    queryFn: async () => {
      if (!taskId) return null;
      return tasksApi.getTaskById(taskId);
    },
    enabled: Boolean(taskId),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksApi.createTask(payload),
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY(newTask.projectId),
      });
      toast.success(`Task "${newTask.title}" created!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to create task";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: UpdateTaskPayload;
    }) => tasksApi.updateTask(taskId, payload),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY(updatedTask.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: TASK_DETAIL_QUERY_KEY(updatedTask.id),
      });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to update task";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useReorderTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: ReorderTaskPayload;
    }) => tasksApi.reorderTask(taskId, payload),
    onError: (err: any, vars) => {
      // Background retry or silent error log so user drag experience isn't interrupted
      console.warn("Reorder task failed:", err?.message || err);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId }: { taskId: string; projectId?: string }) =>
      tasksApi.deleteTask(taskId),
    onSuccess: (_, vars) => {
      if (vars.projectId) {
        queryClient.invalidateQueries({
          queryKey: TASKS_QUERY_KEY(vars.projectId),
        });
      }
      toast.success("Task deleted");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to delete task";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useTaskComments(taskId?: string) {
  return useQuery({
    queryKey: TASK_COMMENTS_QUERY_KEY(taskId),
    queryFn: async () => {
      if (!taskId) return [];
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          taskId
        );
      if (!isUUID) return [];
      return tasksApi.getTaskComments(taskId);
    },
    enabled: Boolean(taskId),
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
      tasksApi.addComment(taskId, content),
    onSuccess: (newComment, vars) => {
      queryClient.invalidateQueries({
        queryKey: TASK_COMMENTS_QUERY_KEY(vars.taskId),
      });
      // Task lists carry comment counts (Kanban cards, dashboard activity);
      // the project isn't known here, so refresh every cached task list.
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-tasks"] });
      toast.success("Comment posted");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to post comment";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

// ─── Project Board Columns Hooks ─────────────────────────────────────────────

export const PROJECT_COLUMNS_QUERY_KEY = (projectId?: string) => [
  "project-columns",
  projectId,
];

export function useProjectColumns(projectId?: string) {
  return useQuery({
    queryKey: PROJECT_COLUMNS_QUERY_KEY(projectId),
    queryFn: async () => {
      if (!projectId) return [];
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          projectId
        );
      if (!isUUID) return [];
      return projectsApi.getProjectColumns(projectId);
    },
    enabled: Boolean(projectId),
    staleTime: 1000 * 30, // 30s
  });
}

export function useCreateColumn(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateColumnPayload) => {
      if (!projectId) throw new Error("Project ID is required");
      return projectsApi.createColumn(projectId, payload);
    },
    onSuccess: (newCol) => {
      queryClient.invalidateQueries({
        queryKey: PROJECT_COLUMNS_QUERY_KEY(projectId),
      });
      toast.success(`List "${newCol.name}" created!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to create list";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useUpdateColumn(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      columnId,
      payload,
    }: {
      columnId: string;
      payload: UpdateColumnPayload;
    }) => {
      if (!projectId) throw new Error("Project ID is required");
      return projectsApi.updateColumn(projectId, columnId, payload);
    },
    onSuccess: (updatedCol) => {
      queryClient.invalidateQueries({
        queryKey: PROJECT_COLUMNS_QUERY_KEY(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY(projectId),
      });
      toast.success(`List renamed to "${updatedCol.name}"`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to update list";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useDeleteColumn(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (columnId: string) => {
      if (!projectId) throw new Error("Project ID is required");
      return projectsApi.deleteColumn(projectId, columnId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROJECT_COLUMNS_QUERY_KEY(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY(projectId),
      });
      toast.success("List deleted successfully");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to delete list";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useReorderColumns(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (columnIds: string[]) => {
      if (!projectId) throw new Error("Project ID is required");
      return projectsApi.reorderColumns(projectId, columnIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROJECT_COLUMNS_QUERY_KEY(projectId),
      });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to reorder lists";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

