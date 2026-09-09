const PRIORITY_WEIGHT: Record<string, number> = { alta: 3, media: 2, baixa: 1 };

export type PrioritizableTask = {
  done: boolean;
  priority: string;
  dueDate: Date | string | null;
};

/**
 * Priorização inteligente: tarefas pendentes vêm antes das concluídas,
 * depois por prioridade (alta > média > baixa), depois por prazo mais próximo.
 */
export function sortTasksByPriority<T extends PrioritizableTask>(tasks: T[]): T[] {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;

    const priorityDiff = (PRIORITY_WEIGHT[b.priority] ?? 0) - (PRIORITY_WEIGHT[a.priority] ?? 0);
    if (priorityDiff !== 0) return priorityDiff;

    const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
    const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
    return aDue - bDue;
  });
}

/** Average of a list of 0-100 progress values, or null when there is nothing to average. */
export function averageProgress(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round(sum / values.length);
}

/** Clamp a percentage into the valid 0-100 range. */
export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Goal progress is derived from minutes actually studied vs. the target,
 * when the goal declares a target. Goals without a target keep their
 * manually-set progress.
 */
export function computeGoalProgress(targetHours: number | null | undefined, totalMinutesLogged: number): number | null {
  if (!targetHours || targetHours <= 0) return null;
  const targetMinutes = targetHours * 60;
  return clampPercent((totalMinutesLogged / targetMinutes) * 100);
}

/** Total minutes across a list of study sessions. */
export function sumDurationMinutes(sessions: { durationMinutes: number }[]): number {
  return sessions.reduce((total, session) => total + session.durationMinutes, 0);
}
