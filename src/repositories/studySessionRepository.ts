import { db } from "@/db";
import { studySessions } from "@/db/schema";
import { and, eq, gte } from "drizzle-orm";

export type NewStudySession = typeof studySessions.$inferInsert;
export type StudySessionUpdate = Partial<Pick<NewStudySession, "title" | "durationMinutes" | "themeId" | "occurredAt">>;

export const studySessionRepository = {
  listByUser(userId: string) {
    return db.select().from(studySessions).where(eq(studySessions.userId, userId));
  },

  listByUserSince(userId: string, since: Date) {
    return db
      .select()
      .from(studySessions)
      .where(and(eq(studySessions.userId, userId), gte(studySessions.occurredAt, since)));
  },

  async findByIdForUser(id: string, userId: string) {
    const rows = await db
      .select()
      .from(studySessions)
      .where(and(eq(studySessions.id, id), eq(studySessions.userId, userId)));
    return rows[0] ?? null;
  },

  async create(data: NewStudySession) {
    const rows = await db.insert(studySessions).values(data).returning();
    return rows[0];
  },

  async updateForUser(id: string, userId: string, data: StudySessionUpdate) {
    const rows = await db
      .update(studySessions)
      .set(data)
      .where(and(eq(studySessions.id, id), eq(studySessions.userId, userId)))
      .returning();
    return rows[0] ?? null;
  },

  async deleteForUser(id: string, userId: string) {
    const rows = await db
      .delete(studySessions)
      .where(and(eq(studySessions.id, id), eq(studySessions.userId, userId)))
      .returning();
    return rows[0] ?? null;
  },
};
