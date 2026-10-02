// ─── TanStack Query Key Factories ─────────────────────────────────────────────
// Centralized key definitions ensure consistent cache management.
// Always use these factories — never hardcode query keys inline.

export const queryKeys = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    me: ["auth", "me"] as const,
  },

  // ── Workspaces ────────────────────────────────────────────────────────────
  workspaces: {
    all: ["workspaces"] as const,
    list: () => [...queryKeys.workspaces.all, "list"] as const,
    detail: (id: string) => [...queryKeys.workspaces.all, "detail", id] as const,
  },

  // ── Members ───────────────────────────────────────────────────────────────
  members: {
    all: ["members"] as const,
    byWorkspace: (workspaceId: string) =>
      [...queryKeys.members.all, "workspace", workspaceId] as const,
  },

  // ── Projects ──────────────────────────────────────────────────────────────
  projects: {
    all: ["projects"] as const,
    list: (workspaceId: string) =>
      [...queryKeys.projects.all, "list", workspaceId] as const,
    detail: (id: string) => [...queryKeys.projects.all, "detail", id] as const,
  },

  // ── Tasks ─────────────────────────────────────────────────────────────────
  tasks: {
    all: ["tasks"] as const,
    byProject: (projectId: string) =>
      [...queryKeys.tasks.all, "project", projectId] as const,
    byWorkspace: (workspaceId: string) =>
      [...queryKeys.tasks.all, "workspace", workspaceId] as const,
    detail: (id: string) => [...queryKeys.tasks.all, "detail", id] as const,
  },

  // ── Comments ──────────────────────────────────────────────────────────────
  comments: {
    all: ["comments"] as const,
    byTask: (taskId: string) =>
      [...queryKeys.comments.all, "task", taskId] as const,
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    stats: (workspaceId: string) =>
      ["dashboard", "stats", workspaceId] as const,
    activity: (workspaceId: string) =>
      ["dashboard", "activity", workspaceId] as const,
  },
} as const;
