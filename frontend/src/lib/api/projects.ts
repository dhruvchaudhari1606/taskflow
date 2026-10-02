import apiClient from "./client";

export interface ProjectResponse {
  id: string;
  name: string;
  key: string;
  category?: string | null;
  description?: string | null;
  status: "PLANNING" | "ACTIVE" | "COMPLETED" | "ON_HOLD";
  lead_id?: string | null;
  lead?: {
    id: string;
    name: string;
    email: string;
  } | null;
  target_date?: string | null;
  workspace_id: string;
  createdAt?: string;
  updatedAt?: string;
  taskCount?: number;
  completedTaskCount?: number;
}

export interface CreateProjectPayload {
  workspace_id: string;
  name: string;
  key: string;
  category?: string;
  description?: string;
  status?: "PLANNING" | "ACTIVE" | "COMPLETED" | "ON_HOLD";
  target_date?: string;
}

export interface ProjectHealthResponse {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  completionRate: number;
  status: string;
}

export interface BoardColumnResponse {
  id: string;
  project_id: string;
  name: string;
  color: string;
  position: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateColumnPayload {
  name: string;
  color?: string;
  position?: number;
}

export interface UpdateColumnPayload {
  name?: string;
  color?: string;
  position?: number;
}

export const projectsApi = {
  async getWorkspaceProjects(workspaceId: string): Promise<ProjectResponse[]> {
    if (!workspaceId) return [];
    const res = await apiClient.get<{ data: ProjectResponse[] } | ProjectResponse[]>(
      "/projects",
      {
        params: { workspaceId },
      },
    );
    const data = (res.data as any)?.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  async getProjectById(id: string): Promise<ProjectResponse> {
    const res = await apiClient.get<{ data: ProjectResponse } | ProjectResponse>(
      `/projects/${id}`,
    );
    return (res.data as any)?.data || res.data;
  },

  async getProjectHealth(id: string): Promise<ProjectHealthResponse> {
    const res = await apiClient.get<{ data: ProjectHealthResponse } | ProjectHealthResponse>(
      `/projects/${id}/health`,
    );
    return (res.data as any)?.data || res.data;
  },

  async createProject(payload: CreateProjectPayload): Promise<ProjectResponse> {
    const res = await apiClient.post<{ data: ProjectResponse } | ProjectResponse>(
      "/projects",
      payload,
    );
    return (res.data as any)?.data || res.data;
  },

  async updateProject(
    id: string,
    payload: Partial<CreateProjectPayload>,
  ): Promise<ProjectResponse> {
    const res = await apiClient.patch<{ data: ProjectResponse } | ProjectResponse>(
      `/projects/${id}`,
      payload,
    );
    return (res.data as any)?.data || res.data;
  },

  async deleteProject(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ data: { message: string } } | { message: string }>(
      `/projects/${id}`,
    );
    return (res.data as any)?.data || res.data;
  },

  async getProjectColumns(projectId: string): Promise<BoardColumnResponse[]> {
    if (!projectId) return [];
    const res = await apiClient.get<{ data: BoardColumnResponse[] } | BoardColumnResponse[]>(
      `/projects/${projectId}/columns`
    );
    const data = (res.data as any)?.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  async createColumn(
    projectId: string,
    payload: CreateColumnPayload
  ): Promise<BoardColumnResponse> {
    const res = await apiClient.post<{ data: BoardColumnResponse } | BoardColumnResponse>(
      `/projects/${projectId}/columns`,
      payload
    );
    return (res.data as any)?.data || res.data;
  },

  async updateColumn(
    projectId: string,
    columnId: string,
    payload: UpdateColumnPayload
  ): Promise<BoardColumnResponse> {
    const res = await apiClient.patch<{ data: BoardColumnResponse } | BoardColumnResponse>(
      `/projects/${projectId}/columns/${columnId}`,
      payload
    );
    return (res.data as any)?.data || res.data;
  },

  async deleteColumn(
    projectId: string,
    columnId: string
  ): Promise<{ success: boolean; movedTasksCount?: number }> {
    const res = await apiClient.delete<{ data: any } | any>(
      `/projects/${projectId}/columns/${columnId}`
    );
    return (res.data as any)?.data || res.data;
  },

  async reorderColumns(
    projectId: string,
    columnIds: string[]
  ): Promise<BoardColumnResponse[]> {
    const res = await apiClient.post<{ data: BoardColumnResponse[] } | BoardColumnResponse[]>(
      `/projects/${projectId}/columns/reorder`,
      { columnIds }
    );
    const data = (res.data as any)?.data || res.data;
    return Array.isArray(data) ? data : [];
  },
};

export default projectsApi;
