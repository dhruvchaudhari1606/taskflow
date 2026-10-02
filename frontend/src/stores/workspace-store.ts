import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Workspace } from "@/types/common";

// ─── Workspace Store ──────────────────────────────────────────────────────────
// Tracks the currently active workspace for multi-tenant context.

interface WorkspaceState {
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];

  // Actions
  setActiveWorkspace: (workspace: Workspace) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspace: null,
      workspaces: [],

      setActiveWorkspace: (workspace) =>
        set({ activeWorkspace: workspace }),

      setWorkspaces: (workspaces) =>
        set({ workspaces }),

      clearWorkspace: () =>
        set({ activeWorkspace: null, workspaces: [] }),
    }),
    {
      name: "taskflow-workspace",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
