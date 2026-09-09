import { db } from "@/db";
import { tasks } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type NewTask = typeof tasks.$inferInsert;
export type TaskUpdate = Partial<Pick<NewTask, "title" | "subtitle" | "priority" | "done" | "dueDate" | "themeId">>;

export const taskRepository = {
  listByUser(userId: string) {
    return db.select().from(tasks).where(eq(tasks.userId, userId));
  },

  async findByIdForUser(id: string, userId: string) {
    const rows = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
    return rows[0] ?? null;
  },

  async create(data: NewTask) {
    const rows = await db.insert(tasks).values(data).returning();
    return rows[0];
  },

  async updateForUser(id: string, userId: string, data: TaskUpdate) {
    const rows = await db
      .update(tasks)
      .set(data)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return rows[0] ?? null;
  },

  async deleteForUser(id: string, userId: string) {
    const rows = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return rows[0] ?? null;
  },
};
