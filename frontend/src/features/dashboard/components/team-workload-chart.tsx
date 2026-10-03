"use client";

import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  LabelList,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type LabelProps,
  type TooltipContentProps,
} from "recharts";
import type { Task, User } from "@/types/common";
import {
  TASK_STATUS_SERIES,
  statusSeries,
  type TaskStatusKey,
} from "../task-status-series";

type WorkloadRow = {
  id: string;
  name: string;
  total: number;
  /** Rightmost non-empty segment: carries the rounded end and the total label */
  lastKey: TaskStatusKey | null;
} & Record<TaskStatusKey, number>;

const UNASSIGNED_ID = "__unassigned__";
const BAR_SIZE = 22;
const ROW_HEIGHT = 44;

const emptyCounts = (): Record<TaskStatusKey, number> => ({
  todo: 0,
  inProgress: 0,
  inReview: 0,
  done: 0,
});

/**
 * One row per workspace member (including members with no tasks), plus any
 * assignee not in the member list and an "Unassigned" row when needed.
 * Sorted by total workload, busiest first.
 */
export function buildWorkloadRows(tasks: Task[], members: User[]): WorkloadRow[] {
  const rows = new Map<string, WorkloadRow>();
  const ensureRow = (id: string, name: string) => {
    let row = rows.get(id);
    if (!row) {
      row = { id, name, total: 0, lastKey: null, ...emptyCounts() };
      rows.set(id, row);
    }
    return row;
  };

  members.forEach((m) => ensureRow(m.id, m.name));

  tasks.forEach((task) => {
    const series = statusSeries(task.status);
    if (!series) return; // custom columns are not part of the workflow stages
    const row = task.assigneeId
      ? ensureRow(task.assigneeId, task.assignee?.name || "Team member")
      : ensureRow(UNASSIGNED_ID, "Unassigned");
    row[series.key] += 1;
    row.total += 1;
  });

  rows.forEach((row) => {
    row.lastKey =
      [...TASK_STATUS_SERIES].reverse().find((s) => row[s.key] > 0)?.key ?? null;
  });

  return [...rows.values()].sort(
    (a, b) => b.total - a.total || a.name.localeCompare(b.name)
  );
}

function WorkloadTooltip({ active, payload }: Pick<TooltipContentProps, "active" | "payload">) {
  const row = payload?.[0]?.payload as WorkloadRow | undefined;
  if (!active || !row) return null;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-slate-900 dark:text-[#F8FAFC] mb-1">{row.name}</p>
      <ul className="space-y-0.5">
        {TASK_STATUS_SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="flex-1">{s.label}</span>
            <strong className="text-slate-900 dark:text-[#F8FAFC]">{row[s.key]}</strong>
          </li>
        ))}
      </ul>
      <p className="mt-1 pt-1 border-t border-slate-100 dark:border-[#334155] text-slate-500 dark:text-[#94A3B8]">
        Total <strong className="text-slate-900 dark:text-[#F8FAFC]">{row.total}</strong>
      </p>
    </div>
  );
}

interface TeamWorkloadChartProps {
  tasks: Task[];
  members: User[];
  /** Charts are client-only; render the plot after hydration */
  mounted: boolean;
}

export function TeamWorkloadChart({ tasks, members, mounted }: TeamWorkloadChartProps) {
  const rows = useMemo(() => buildWorkloadRows(tasks, members), [tasks, members]);
  const hasTasks = rows.some((r) => r.total > 0);

  // Round only the data end of each member's bar (whichever stage is last)
  const renderSegment = (key: TaskStatusKey) =>
    function Segment(props: BarShapeProps) {
      const isEnd = rows[props.index]?.lastKey === key;
      return <Rectangle {...props} radius={isEnd ? [0, 4, 4, 0] : 0} />;
    };

  // One sparing direct label per member: the total, just past the bar end
  const renderTotal = (key: TaskStatusKey) =>
    function TotalLabel({ index, viewBox }: LabelProps) {
      const row = index == null ? undefined : rows[index];
      if (!row || row.lastKey !== key || !viewBox || !("width" in viewBox)) return null;
      const { x = 0, y = 0, width = 0, height = 0 } = viewBox;
      return (
        <text
          x={Number(x) + Number(width) + 8}
          y={Number(y) + Number(height) / 2}
          dominantBaseline="central"
          fill="var(--muted-foreground)"
          fontSize={12}
          fontWeight={700}
        >
          {row.total}
        </text>
      );
    };

  return (
    <div className="space-y-4">
      {/* Legend: always shown for multiple series; text uses text tokens, not series colors */}
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold" aria-label="Task status legend">
        {TASK_STATUS_SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5 text-slate-600 dark:text-[#94A3B8]">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>

      {!hasTasks ? (
        <p className="h-40 flex items-center justify-center text-xs text-slate-400 dark:text-[#94A3B8]">
          No assigned tasks yet. Workload appears once tasks are created.
        </p>
      ) : (
        <div className="w-full" style={{ height: Math.max(rows.length * ROW_HEIGHT + 16, 160) }} aria-hidden="true">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                  content={(props) => <WorkloadTooltip {...props} />}
                />
                {TASK_STATUS_SERIES.map((s) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.label}
                    stackId="workload"
                    fill={s.color}
                    // 2px surface-colored edge = the gap between stacked segments
                    stroke="var(--chart-surface)"
                    strokeWidth={2}
                    barSize={BAR_SIZE}
                    shape={renderSegment(s.key)}
                    activeBar={{ fillOpacity: 0.85 }}
                    isAnimationActive={false}
                  >
                    <LabelList dataKey="total" content={renderTotal(s.key)} />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Table view: every value reachable without hover (screen readers) */}
      <table className="sr-only">
        <caption>Tasks per team member by status</caption>
        <thead>
          <tr>
            <th scope="col">Member</th>
            {TASK_STATUS_SERIES.map((s) => (
              <th key={s.key} scope="col">
                {s.label}
              </th>
            ))}
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <th scope="row">{r.name}</th>
              {TASK_STATUS_SERIES.map((s) => (
                <td key={s.key}>{r[s.key]}</td>
              ))}
              <td>{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
