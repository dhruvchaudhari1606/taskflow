import apiClient from "./client";
import { Task, TaskStatus, Priority, TaskComment } from "@/types/common";
import { statusFromColumnTitle } from "@/lib/task-status";

export interface CreateTaskPayload {
  project_id: string;
  title: string;
  description?: string;
  status?: TaskStatus | string;
  column_id?: string;
  priority?: Priority;
  position?: number;
  assignee_id?: string;
  due_date?: string;
  tags?: string[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus | string;
  column_id?: string;
  priority?: Priority;
  position?: number;
  assignee_id?: string | null;
  due_date?: string | null;
  tags?: string[];
}

export interface ReorderTaskPayload {
  status: TaskStatus | string;
  position: number;
  column_id?: string;
}

// Shown when the API omits a reporter/author, instead of a made-up person
const UNKNOWN_USER = { id: "", name: "Unknown user", email: "" };

// Helper to normalize task entity to frontend structure
export function normalizeTask(raw: any): Task {
  return {
    id: raw.id,
    key: raw.task_key || raw.key || undefined,
    title: raw.title,
    description: raw.description ?? null,
    // Normalize legacy title-format values ("In Progress") to the enum ("IN_PROGRESS")
    status: raw.status ? statusFromColumnTitle(raw.status) : TaskStatus.TODO,
    columnId: raw.column_id || raw.columnId || null,
    priority: (raw.priority as Priority) || Priority.MEDIUM,
    dueDate: raw.due_date || raw.dueDate || null,
    projectId: raw.project_id || raw.projectId,
    project: raw.project ? { id: raw.project.id, name: raw.project.name } : undefined,
    assigneeId: raw.assignee_id || raw.assigneeId || null,
    assignee: raw.assignee
      ? {
          id: raw.assignee.id,
          name: raw.assignee.name || `${raw.assignee.first_name || ""} ${raw.assignee.last_name || ""}`.trim() || raw.assignee.email,
          email: raw.assignee.email,
          avatarUrl: raw.assignee.avatar_url || raw.assignee.avatarUrl || null,
        }
      : null,
    createdById: raw.reporter_id || raw.createdById || "",
    createdBy: raw.reporter
      ? {
          id: raw.reporter.id,
          name: raw.reporter.name || raw.reporter.email,
          email: raw.reporter.email,
        }
      : UNKNOWN_USER,
    labels: (raw.tags || []).map((tag: string, idx: number) => ({
      id: `tag-${idx}-${tag}`,
      name: tag,
      color: "#4F46E5",
      workspaceId: raw.project_id || "",
    })),
    commentCount: Array.isArray(raw.comments)
      ? raw.comments.length
      : Number(raw.comment_count ?? raw.commentCount ?? 0),
    comments: Array.isArray(raw.comments)
      ? raw.comments.map(normalizeComment)
      : undefined,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
  };
}

// Helper to normalize comment entity to frontend structure
export function normalizeComment(raw: any): TaskComment {
  const author = raw.user || raw.author;
  return {
    id: raw.id,
    content: raw.content || "",
    taskId: raw.task_id || raw.taskId,
    authorId: raw.user_id || raw.authorId || (author ? author.id : ""),
    author: author
      ? {
          id: author.id,
          name: author.name || `${author.first_name || ""} ${author.last_name || ""}`.trim() || author.email || "Team Member",
          email: author.email || "",
          avatarUrl: author.avatar_url || author.avatarUrl || null,
        }
      : UNKNOWN_USER,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
  };
}

export const tasksApi = {
  async getProjectTasks(projectId: string): Promise<Task[]> {
    if (!projectId) return [];
    const res = await apiClient.get<{ data: any[] } | any[]>("/tasks", {
      params: { projectId },
    });
    const items = (res.data as any)?.data || res.data;
    if (!Array.isArray(items)) return [];
    return items.map(normalizeTask);
  },

  async getWorkspaceTasks(workspaceId: string): Promise<Task[]> {
    if (!workspaceId) return [];
    const res = await apiClient.get<{ data: any[] } | any[]>("/tasks", {
      params: { workspaceId },
    });
    const items = (res.data as any)?.data || res.data;
    if (!Array.isArray(items)) return [];
    return items.map(normalizeTask);
  },

  async getTaskById(taskId: string): Promise<Task> {
    const res = await apiClient.get<{ data: any } | any>(`/tasks/${taskId}`);
    const item = (res.data as any)?.data || res.data;
    return normalizeTask(item);
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const res = await apiClient.post<{ data: any } | any>("/tasks", payload);
    const item = (res.data as any)?.data || res.data;
    return normalizeTask(item);
  },

  async updateTask(taskId: string, payload: UpdateTaskPayload): Promise<Task> {
    const res = await apiClient.patch<{ data: any } | any>(
      `/tasks/${taskId}`,
      payload
    );
    const item = (res.data as any)?.data || res.data;
    return normalizeTask(item);
  },

  async reorderTask(taskId: string, payload: ReorderTaskPayload): Promise<Task> {
    const res = await apiClient.patch<{ data: any } | any>(
      `/tasks/${taskId}/reorder`,
      payload
    );
    const item = (res.data as any)?.data || res.data;
    return normalizeTask(item);
  },

  async deleteTask(taskId: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ data: { message: string } } | { message: string }>(
      `/tasks/${taskId}`
    );
    return (res.data as any)?.data || res.data;
  },

  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    if (!taskId) return [];
    const res = await apiClient.get<{ data: any[] } | any[]>(
      `/tasks/${taskId}/comments`
    );
    const items = (res.data as any)?.data || res.data;
    if (!Array.isArray(items)) return [];
    return items.map(normalizeComment);
  },

  async addComment(taskId: string, content: string): Promise<TaskComment> {
    const res = await apiClient.post<{ data: any } | any>(
      `/tasks/${taskId}/comments`,
      { content }
    );
    const item = (res.data as any)?.data || res.data;
    return normalizeComment(item);
  },
};

export default tasksApi;
