import { TaskStatus } from "@/types/common";

/**
 * Workflow stages in board order, shared by the dashboard charts and legends.
 * Colors are CSS tokens (globals.css) holding a validated one-hue ordinal ramp,
 * so light and dark mode each get their own steps.
 */
export const TASK_STATUS_SERIES = [
  { status: TaskStatus.TODO, key: "todo", label: "To Do", color: "var(--status-todo)" },
  {
    status: TaskStatus.IN_PROGRESS,
    key: "inProgress",
    label: "In Progress",
    color: "var(--status-in-progress)",
  },
  {
    status: TaskStatus.IN_REVIEW,
    key: "inReview",
    label: "In Review",
    color: "var(--status-in-review)",
  },
  { status: TaskStatus.DONE, key: "done", label: "Done", color: "var(--status-done)" },
] as const;

export type TaskStatusKey = (typeof TASK_STATUS_SERIES)[number]["key"];

/** Series entry for a task status, or undefined for custom (non-workflow) columns. */
export function statusSeries(status?: string | null) {
  return TASK_STATUS_SERIES.find((s) => s.status === status);
}
