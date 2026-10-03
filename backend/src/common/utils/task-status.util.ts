import { TaskStatus } from '@common/constants/constants';

/**
 * Default board columns created for a project, each mapped to its TaskStatus.
 * Shared by the column service (auto-creation) and the seeder.
 */
export const DEFAULT_BOARD_COLUMNS = [
  { name: 'To Do', status: TaskStatus.TODO, color: '#4F46E5', position: 1000 },
  {
    name: 'In Progress',
    status: TaskStatus.IN_PROGRESS,
    color: '#0891b2',
    position: 2000,
  },
  {
    name: 'In Review',
    status: TaskStatus.IN_REVIEW,
    color: '#7c3aed',
    position: 3000,
  },
  { name: 'Done', status: TaskStatus.DONE, color: '#059669', position: 4000 },
] as const;

/**
 * Canonical comparison key for a task status or column name.
 * "To Do", "TODO", "In Progress" and "IN_PROGRESS" normalize to the same key.
 */
export function statusKey(value?: string | null): string {
  return (value || '').replace(/[\s_-]+/g, '').toUpperCase();
}

/** Find the column whose name matches a task status, if any. */
export function findColumnByStatus<C extends { name: string }>(
  columns: C[],
  status?: string | null,
): C | undefined {
  const key = statusKey(status);
  if (!key) return undefined;
  return columns.find((c) => statusKey(c.name) === key);
}
