import apiClient from "./client";

export interface WorkspaceMemberUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export interface WorkspaceMemberItem {
  id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  created_at: string;
  user: WorkspaceMemberUser;
}

export interface WorkspaceInvitationResponse {
  id: string;
  workspace_id: string;
  email: string;
  role: string;
  token: string;
  status: string;
  expires_at: string;
  created_at?: string;
  inviter?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export interface InvitationDetailsResponse {
  valid: boolean;
  email: string;
  role: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  inviter: {
    name: string;
    email?: string;
  };
  expires_at: string;
}

export interface WorkspaceResponse {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  avatar_url?: string | null;
  owner_id: string;
  role?: string;
  members?: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar_url?: string | null;
    };
  }>;
  projects?: Array<{
    id: string;
    name: string;
    key: string;
    status: string;
  }>;
  invitations?: WorkspaceInvitationResponse[];
}

export interface CreateWorkspacePayload {
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateWorkspacePayload {
  name?: string;
  slug?: string;
  description?: string;
}

export interface AcceptInvitePayload {
  name: string;
  password: string;
}

export const workspacesApi = {
  async getUserWorkspaces(): Promise<WorkspaceResponse[]> {
    const res = await apiClient.get<{ data: WorkspaceResponse[] } | WorkspaceResponse[]>(
      "/workspaces",
    );
    const data = (res.data as any)?.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  async getWorkspaceById(id: string): Promise<WorkspaceResponse> {
    const res = await apiClient.get<{ data: WorkspaceResponse } | WorkspaceResponse>(
      `/workspaces/${id}`,
    );
    return (res.data as any)?.data || res.data;
  },

  async getWorkspaceMembers(id: string): Promise<WorkspaceMemberItem[]> {
    const res = await apiClient.get<{ data: WorkspaceMemberItem[] } | WorkspaceMemberItem[]>(
      `/workspaces/${id}/members`,
    );
    const data = (res.data as any)?.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  async getWorkspaceInvitations(id: string): Promise<WorkspaceInvitationResponse[]> {
    const res = await apiClient.get<{ data: WorkspaceInvitationResponse[] } | WorkspaceInvitationResponse[]>(
      `/workspaces/${id}/invitations`,
    );
    const data = (res.data as any)?.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  async revokeInvitation(workspaceId: string, invitationId: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`);
    return (res.data as any)?.data || res.data;
  },

  async getInvitationByToken(token: string): Promise<InvitationDetailsResponse> {
    const res = await apiClient.get<{ data: InvitationDetailsResponse } | InvitationDetailsResponse>(
      `/workspaces/invitations/${token}`,
    );
    return (res.data as any)?.data || res.data;
  },

  async acceptInvitation(
    token: string,
    payload: AcceptInvitePayload,
  ): Promise<{ message: string; user: any; workspace: any }> {
    const res = await apiClient.post(`/workspaces/invitations/${token}/accept`, payload);
    return (res.data as any)?.data || res.data;
  },

  async createWorkspace(payload: CreateWorkspacePayload): Promise<WorkspaceResponse> {
    const res = await apiClient.post<{ data: WorkspaceResponse } | WorkspaceResponse>(
      "/workspaces",
      payload,
    );
    return (res.data as any)?.data || res.data;
  },

  async updateWorkspace(
    id: string,
    payload: UpdateWorkspacePayload
  ): Promise<WorkspaceResponse> {
    const res = await apiClient.patch<{ data: WorkspaceResponse } | WorkspaceResponse>(
      `/workspaces/${id}`,
      payload
    );
    return (res.data as any)?.data || res.data;
  },

  async deleteWorkspace(id: string): Promise<{ success: boolean }> {
    const res = await apiClient.delete<{ data: any } | any>(`/workspaces/${id}`);
    return (res.data as any)?.data || res.data;
  },

  async inviteMember(
    workspaceId: string,
    payload: { email: string; role?: string },
  ): Promise<any> {
    const res = await apiClient.post(`/workspaces/${workspaceId}/members`, payload);
    return (res.data as any)?.data || res.data;
  },
};

export default workspacesApi;
