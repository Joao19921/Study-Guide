import { db } from "@/db";
import { goals } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type NewGoal = typeof goals.$inferInsert;
export type GoalUpdate = Partial<Pick<NewGoal, "title" | "period" | "targetHours" | "dueDate" | "progress">>;

export const goalRepository = {
  listByUser(userId: string) {
    return db.select().from(goals).where(eq(goals.userId, userId));
  },

  async findByIdForUser(id: string, userId: string) {
    const rows = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));
    return rows[0] ?? null;
  },

  async create(data: NewGoal) {
    const rows = await db.insert(goals).values(data).returning();
    return rows[0];
  },

  async updateForUser(id: string, userId: string, data: GoalUpdate) {
    const rows = await db
      .update(goals)
      .set(data)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();
    return rows[0] ?? null;
  },

  async deleteForUser(id: string, userId: string) {
    const rows = await db
      .delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();
    return rows[0] ?? null;
  },
};
