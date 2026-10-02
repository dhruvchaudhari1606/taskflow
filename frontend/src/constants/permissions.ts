import { Role } from "@/types/common";

// ─── RBAC Permission Map ──────────────────────────────────────────────────────
// Frontend-only: used to show/hide UI elements based on role.
// The backend is the source of truth for actual enforcement.

export const PERMISSIONS = {
  workspace: {
    manage: [Role.OWNER] as Role[],
    view: [Role.OWNER, Role.ADMIN, Role.MEMBER] as Role[],
  },
  members: {
    invite: [Role.OWNER, Role.ADMIN] as Role[],
    remove: [Role.OWNER] as Role[],
    changeRole: [Role.OWNER] as Role[],
    view: [Role.OWNER, Role.ADMIN, Role.MEMBER] as Role[],
  },
  projects: {
    create: [Role.OWNER, Role.ADMIN] as Role[],
    update: [Role.OWNER, Role.ADMIN] as Role[],
    delete: [Role.OWNER, Role.ADMIN] as Role[],
    view: [Role.OWNER, Role.ADMIN, Role.MEMBER] as Role[],
  },
  tasks: {
    create: [Role.OWNER, Role.ADMIN, Role.MEMBER] as Role[],
    update: [Role.OWNER, Role.ADMIN, Role.MEMBER] as Role[],
    delete: [Role.OWNER, Role.ADMIN] as Role[],
    assign: [Role.OWNER, Role.ADMIN] as Role[],
    view: [Role.OWNER, Role.ADMIN, Role.MEMBER] as Role[],
  },
} as const;

// ─── Permission Check Helper ──────────────────────────────────────────────────

export function hasPermission(
  userRole: Role | undefined | null,
  allowedRoles: Role[]
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}
