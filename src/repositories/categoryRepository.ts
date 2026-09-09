import { db } from "@/db";
import { categories } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type NewCategory = typeof categories.$inferInsert;
export type CategoryUpdate = Partial<Pick<NewCategory, "name" | "color">>;

export const categoryRepository = {
  listByUser(userId: string) {
    return db.select().from(categories).where(eq(categories.userId, userId));
  },

  async findByIdForUser(id: string, userId: string) {
    const rows = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
    return rows[0] ?? null;
  },

  async create(data: NewCategory) {
    const rows = await db.insert(categories).values(data).returning();
    return rows[0];
  },

  async updateForUser(id: string, userId: string, data: CategoryUpdate) {
    const rows = await db
      .update(categories)
      .set(data)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    return rows[0] ?? null;
  },

  async deleteForUser(id: string, userId: string) {
    const rows = await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    return rows[0] ?? null;
  },
};
