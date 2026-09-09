import { studySessionRepository } from "@/repositories/studySessionRepository";
import { themeRepository } from "@/repositories/themeRepository";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

/** Consecutive days (ending today or yesterday) that have at least one logged session. */
function computeStreak(daysWithMinutes: Set<string>): number {
  let streak = 0;
  const cursor = new Date();
  if (!daysWithMinutes.has(dateKey(cursor)) && !daysWithMinutes.has(dateKey(new Date(cursor.getTime() - 86400000)))) {
    return 0;
  }
  if (!daysWithMinutes.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (daysWithMinutes.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export const reportService = {
  /** Aggregates used by the dashboard and the reports module: hours per day, time by theme and current streak. */
  async summary(userId: string) {
    const since30Days = new Date(Date.now() - 30 * 86400000);
    const [sessions, themes] = await Promise.all([
      studySessionRepository.listByUserSince(userId, since30Days),
      themeRepository.listByUser(userId),
    ]);

    const themeNameById = new Map(themes.map((theme) => [theme.id, theme.name]));

    const minutesByDay = new Map<string, number>();
    const minutesByTheme = new Map<string, number>();
    let totalMinutes30Days = 0;

    for (const session of sessions) {
      const key = dateKey(session.occurredAt);
      minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + session.durationMinutes);
      totalMinutes30Days += session.durationMinutes;

      const themeLabel = session.themeId ? (themeNameById.get(session.themeId) ?? "Outros") : "Sem tema";
      minutesByTheme.set(themeLabel, (minutesByTheme.get(themeLabel) ?? 0) + session.durationMinutes);
    }

    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = dateKey(date);
      return { date: key, minutes: minutesByDay.get(key) ?? 0 };
    });

    const distribution = Array.from(minutesByTheme.entries())
      .map(([theme, minutes]) => ({ theme, minutes }))
      .sort((a, b) => b.minutes - a.minutes);

    return {
      totalMinutesLast30Days: totalMinutes30Days,
      last7Days,
      distributionByTheme: distribution,
      streakDays: computeStreak(new Set(minutesByDay.keys())),
    };
  },
};
