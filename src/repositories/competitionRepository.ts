import { db } from "@/db";
import {
  certificates,
  competitionResults,
  competitionSeasons,
  studySessions,
  tasks,
  users,
} from "@/db/schema";
import { and, asc, count, eq, gte, lt, lte, sql, sum } from "drizzle-orm";

export const competitionRepository = {
  async findSeasonById(id: string) {
    const rows = await db.select().from(competitionSeasons).where(eq(competitionSeasons.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async findCurrentSeason(now = new Date()) {
    const rows = await db
      .select()
      .from(competitionSeasons)
      .where(
        and(
          lte(competitionSeasons.startsAt, now),
          gte(competitionSeasons.endsAt, now),
          eq(competitionSeasons.status, "active"),
        ),
      )
      .orderBy(asc(competitionSeasons.startsAt))
      .limit(1);
    return rows[0] ?? null;
  },

  async listSeasons() {
    return db.select().from(competitionSeasons).orderBy(asc(competitionSeasons.startsAt));
  },

  async createSeason(input: { name: string; startsAt: Date; endsAt: Date }) {
    const rows = await db
      .insert(competitionSeasons)
      .values(input)
      .returning();
    return rows[0];
  },

  async activateSeason(id: string) {
    const rows = await db
      .update(competitionSeasons)
      .set({ status: "active" })
      .where(eq(competitionSeasons.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async closeSeason(id: string) {
    const rows = await db
      .update(competitionSeasons)
      .set({ status: "closed" })
      .where(eq(competitionSeasons.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async studyMetrics(start: Date, end: Date) {
    return db
      .select({
        userId: studySessions.userId,
        minutes: sql<number>`coalesce(sum(${studySessions.durationMinutes}), 0)`,
        activeDays: sql<number>`count(distinct date(${studySessions.occurredAt}))`,
      })
      .from(studySessions)
      .where(and(gte(studySessions.occurredAt, start), lt(studySessions.occurredAt, end)))
      .groupBy(studySessions.userId);
  },

  async taskMetrics(start: Date, end: Date) {
    return db
      .select({
        userId: tasks.userId,
        completed: count(tasks.id),
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.done, true),
          gte(tasks.completedAt, start),
          lt(tasks.completedAt, end),
        ),
      )
      .groupBy(tasks.userId);
  },

  async certificateMetrics() {
    return db
      .select({
        userId: certificates.userId,
        certificates: count(certificates.id),
        points: sql<number>`coalesce(sum(${certificates.points}), 0)`,
      })
      .from(certificates)
      .where(eq(certificates.verified, true))
      .groupBy(certificates.userId);
  },

  async activeUsers() {
    return db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.active, true));
  },

  async listResults(seasonId: string) {
    return db
      .select({
        id: competitionResults.id,
        userId: competitionResults.userId,
        score: competitionResults.score,
        position: competitionResults.position,
        certificates: competitionResults.certificates,
        performancePoints: competitionResults.performancePoints,
        certificatePoints: competitionResults.certificatePoints,
        userName: users.name,
      })
      .from(competitionResults)
      .innerJoin(users, eq(users.id, competitionResults.userId))
      .where(eq(competitionResults.seasonId, seasonId))
      .orderBy(asc(competitionResults.position));
  },

  async replaceResults(seasonId: string, results: Array<{
    userId: string;
    score: number;
    position: number;
    certificates: number;
    performancePoints: number;
    certificatePoints: number;
  }>) {
    if (!results.length) return [];

    return db
      .insert(competitionResults)
      .values(results.map((result) => ({ seasonId, ...result })))
      .onConflictDoUpdate({
        target: [competitionResults.id],
        set: {
          score: sql`excluded.score`,
          position: sql`excluded.position`,
          certificates: sql`excluded.certificates`,
          performancePoints: sql`excluded.performance_points`,
          certificatePoints: sql`excluded.certificate_points`,
        },
      })
      .returning();
  },

  async snapshotResults(seasonId: string, results: Array<{
    userId: string;
    score: number;
    position: number;
    certificates: number;
    performancePoints: number;
    certificatePoints: number;
  }>) {
    if (!results.length) return [];

    return db
      .insert(competitionResults)
      .values(results.map((result) => ({ seasonId, ...result })))
      .onConflictDoUpdate({
        target: [competitionResults.seasonId, competitionResults.userId],
        set: {
          score: sql`excluded.score`,
          position: sql`excluded.position`,
          certificates: sql`excluded.certificates`,
          performancePoints: sql`excluded.performance_points`,
          certificatePoints: sql`excluded.certificate_points`,
        },
      })
      .returning();
  },
};
