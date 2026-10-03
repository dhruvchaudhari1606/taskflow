interface ProjectProgressFields {
  taskCount?: number;
  completedTaskCount?: number;
}

/**
 * Project to highlight in the dashboard and sidebar: the one with the most tasks.
 * Ties keep API order (newest first), so an empty project is only picked when
 * every project is empty.
 */
export function pickFeaturedProject<P extends ProjectProgressFields>(
  projects: P[]
): P | undefined {
  return projects.reduce<P | undefined>(
    (best, p) => (!best || (p.taskCount ?? 0) > (best.taskCount ?? 0) ? p : best),
    undefined
  );
}

/** Completion percentage (0–100) from a project's task counts. */
export function projectProgress(project: ProjectProgressFields): number {
  const total = project.taskCount ?? 0;
  if (total === 0) return 0;
  return Math.round(((project.completedTaskCount ?? 0) / total) * 100);
}
