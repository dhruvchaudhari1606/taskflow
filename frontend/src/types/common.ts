// Shared enums — keep in sync with backend Prisma schema

export enum Role {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
  COMPLETED = "COMPLETED",
}

// ─── Shared Entity Types ──────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  owner_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: Role;
  joinedAt: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  key?: string;
  description?: string | null;
  status: ProjectStatus;
  priority: Priority;
  startDate?: string | null;
  dueDate?: string | null;
  workspaceId: string;
  createdById: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  // Computed fields from API
  taskCount?: number;
  completedTaskCount?: number;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  workspaceId: string;
}

export interface Task {
  id: string;
  /** Human-readable key, e.g. "EXEC-9" */
  key?: string;
  title: string;
  description?: string | null;
  status: TaskStatus | string;
  columnId?: string | null;
  priority: Priority;
  dueDate?: string | null;
  projectId: string;
  project?: Pick<Project, "id" | "name">;
  assigneeId?: string | null;
  assignee?: User | null;
  createdById: string;
  createdBy: User;
  labels: Label[];
  /** Number of comments on the task, derived from the API's comments relation */
  commentCount?: number;
  /** Comments included with list responses (used for activity feeds) */
  comments?: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalMembers: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  userId: string;
  user: User;
  createdAt: string;
}

// ─── UI Utility Types ─────────────────────────────────────────────────────────

export type SortOrder = "asc" | "desc";

export interface SelectOption {
  label: string;
  value: string;
}
