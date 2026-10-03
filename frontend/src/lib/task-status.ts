import { TaskStatus } from "@/types/common";

/**
 * Canonical comparison key for a task status or board column title.
 * "To Do", "TODO", "In Progress" and "IN_PROGRESS" all normalize to the same key,
 * so enum values and human-readable column titles can be matched reliably.
 */
export function statusKey(value?: string | null): string {
  return (value || "").replace(/[\s_-]+/g, "").toUpperCase();
}

/**
 * Status value to persist for a task placed in a column with the given title.
 * Built-in columns map to their TaskStatus enum value (which the dashboard counts);
 * custom columns keep their title, since no enum value exists for them.
 */
export function statusFromColumnTitle(title: string): TaskStatus | string {
  return (
    Object.values(TaskStatus).find((s) => statusKey(s) === statusKey(title)) ??
    title
  );
}

/** Find the board column a task belongs to: by column id first, then by status. */
export function findColumnForTask<C extends { id: string; title: string }>(
  columns: C[],
  task: { columnId?: string | null; status?: string | null }
): C | undefined {
  return (
    columns.find((c) => !!task.columnId && c.id === task.columnId) ??
    columns.find((c) => statusKey(c.title) === statusKey(task.status))
  );
}
