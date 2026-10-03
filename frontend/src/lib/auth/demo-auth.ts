import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { User, Workspace } from "@/types/common";

export const DEMO_USER: User = {
  id: "user-1",
  name: "Sarah Mitchell",
  email: "sarah.mitchell@taskflow.test",
  avatarUrl: "/images/sarah-mitchell.jpg",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const DEMO_WORKSPACE: Workspace = {
  id: "ws-alpha",
  name: "Alpha Operations",
  slug: "alpha-operations",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function setDemoAuthSession(
  customUser?: Partial<User>,
  customWorkspace?: Partial<Workspace>
) {
  const user: User = {
    ...DEMO_USER,
    ...customUser,
  };

  const workspace: Workspace = {
    ...DEMO_WORKSPACE,
    ...customWorkspace,
  };

  // 1. Set cookie for the Next.js proxy route guard
  if (typeof document !== "undefined") {
    document.cookie = "taskflow-token=demo-session-token; path=/; max-age=86400; SameSite=Lax";
  }

  // 2. Set Zustand stores
  useAuthStore.getState().setUser(user);
  useWorkspaceStore.getState().setActiveWorkspace(workspace);
  useWorkspaceStore.getState().setWorkspaces([workspace]);
}

export function clearDemoAuthSession() {
  if (typeof document !== "undefined") {
    document.cookie =
      "taskflow-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  }

  useAuthStore.getState().clearAuth();
  useWorkspaceStore.getState().clearWorkspace();
}
