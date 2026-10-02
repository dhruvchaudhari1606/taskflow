import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  workspacesApi,
  WorkspaceResponse,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
} from "@/lib/api/workspaces";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useEffect } from "react";
import { toast } from "sonner";

export const WORKSPACES_QUERY_KEY = ["workspaces"];

export function useWorkspaces() {
  const { activeWorkspace, setActiveWorkspace, setWorkspaces } =
    useWorkspaceStore();

  const query = useQuery({
    queryKey: WORKSPACES_QUERY_KEY,
    queryFn: async () => {
      const data = await workspacesApi.getUserWorkspaces();
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  // Sync with Zustand store & auto-select if no active workspace
  useEffect(() => {
    if (query.data && query.data.length > 0) {
      setWorkspaces(
        query.data.map((w) => ({
          id: w.id,
          name: w.name,
          slug: w.slug,
          owner_id: w.owner_id,
        })),
      );

      // If active workspace is not set or not in the user's workspaces, set to first
      if (
        !activeWorkspace ||
        !query.data.some((w) => w.id === activeWorkspace.id)
      ) {
        const first = query.data[0];
        setActiveWorkspace({
          id: first.id,
          name: first.name,
          slug: first.slug,
          owner_id: first.owner_id,
        });
      }
    }
  }, [query.data, activeWorkspace, setActiveWorkspace, setWorkspaces]);

  return {
    ...query,
    workspaces: query.data || [],
    activeWorkspace,
    selectWorkspace: (workspace: WorkspaceResponse) => {
      setActiveWorkspace({
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        owner_id: workspace.owner_id,
      });
    },
  };
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const { setActiveWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: (payload: CreateWorkspacePayload) =>
      workspacesApi.createWorkspace(payload),
    onSuccess: (newWs) => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_QUERY_KEY });
      setActiveWorkspace({
        id: newWs.id,
        name: newWs.name,
        slug: newWs.slug,
        owner_id: newWs.owner_id,
      });
      toast.success(`Workspace "${newWs.name}" created successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to create workspace";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export const WORKSPACE_DETAIL_QUERY_KEY = (id?: string) => ["workspace", id];

export function useWorkspaceDetails(workspaceId?: string) {
  return useQuery({
    queryKey: WORKSPACE_DETAIL_QUERY_KEY(workspaceId),
    queryFn: async () => {
      if (!workspaceId) return null;
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          workspaceId
        );
      if (!isUUID) return null;
      return workspacesApi.getWorkspaceById(workspaceId);
    },
    enabled: Boolean(workspaceId),
  });
}

export const WORKSPACE_MEMBERS_QUERY_KEY = (id?: string) => [
  "workspace-members",
  id,
];
export const WORKSPACE_INVITATIONS_QUERY_KEY = (id?: string) => [
  "workspace-invitations",
  id,
];

export function useWorkspaceMembers(workspaceId?: string) {
  return useQuery({
    queryKey: WORKSPACE_MEMBERS_QUERY_KEY(workspaceId),
    queryFn: async () => {
      if (!workspaceId) return [];
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          workspaceId
        );
      if (!isUUID) return [];
      return workspacesApi.getWorkspaceMembers(workspaceId);
    },
    enabled: Boolean(workspaceId),
  });
}

export function useWorkspaceInvitations(workspaceId?: string) {
  return useQuery({
    queryKey: WORKSPACE_INVITATIONS_QUERY_KEY(workspaceId),
    queryFn: async () => {
      if (!workspaceId) return [];
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          workspaceId
        );
      if (!isUUID) return [];
      return workspacesApi.getWorkspaceInvitations(workspaceId);
    },
    enabled: Boolean(workspaceId),
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      invitationId,
    }: {
      workspaceId: string;
      invitationId: string;
    }) => workspacesApi.revokeInvitation(workspaceId, invitationId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: WORKSPACE_INVITATIONS_QUERY_KEY(vars.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: WORKSPACE_DETAIL_QUERY_KEY(vars.workspaceId),
      });
      toast.success("Invitation revoked");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to revoke invitation";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      email,
      role,
    }: {
      workspaceId: string;
      email: string;
      role?: string;
    }) => workspacesApi.inviteMember(workspaceId, { email, role }),
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({
        queryKey: WORKSPACE_DETAIL_QUERY_KEY(vars.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: WORKSPACE_MEMBERS_QUERY_KEY(vars.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: WORKSPACE_INVITATIONS_QUERY_KEY(vars.workspaceId),
      });
      const msg = data?.message || `Invitation processed for ${vars.email}`;
      toast.success(msg);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to invite member";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  const { setActiveWorkspace, activeWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: ({
      workspaceId,
      payload,
    }: {
      workspaceId: string;
      payload: UpdateWorkspacePayload;
    }) => workspacesApi.updateWorkspace(workspaceId, payload),
    onSuccess: (updatedWs) => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: WORKSPACE_DETAIL_QUERY_KEY(updatedWs.id),
      });
      if (activeWorkspace?.id === updatedWs.id) {
        setActiveWorkspace({
          id: updatedWs.id,
          name: updatedWs.name,
          slug: updatedWs.slug,
          owner_id: updatedWs.owner_id,
        });
      }
      toast.success("Workspace settings updated successfully!");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to update workspace";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  const { clearWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: (workspaceId: string) =>
      workspacesApi.deleteWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_QUERY_KEY });
      clearWorkspace();
      toast.success("Workspace deleted");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to delete workspace";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

