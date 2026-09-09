import { db } from "@/db";
import { themes } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export type NewTheme = typeof themes.$inferInsert;
export type ThemeUpdate = Partial<Pick<NewTheme, "name" | "description" | "categoryId" | "progress">>;

export const themeRepository = {
  listByUser(userId: string) {
    return db.select().from(themes).where(eq(themes.userId, userId));
  },

  async findByIdForUser(id: string, userId: string) {
    const rows = await db
      .select()
      .from(themes)
      .where(and(eq(themes.id, id), eq(themes.userId, userId)));
    return rows[0] ?? null;
  },

  async findManyByIdsForUser(ids: string[], userId: string) {
    if (ids.length === 0) return [];
    return db
      .select()
      .from(themes)
      .where(and(eq(themes.userId, userId), inArray(themes.id, ids)));
  },

  async create(data: NewTheme) {
    const rows = await db.insert(themes).values(data).returning();
    return rows[0];
  },

  async updateForUser(id: string, userId: string, data: ThemeUpdate) {
    const rows = await db
      .update(themes)
      .set(data)
      .where(and(eq(themes.id, id), eq(themes.userId, userId)))
      .returning();
    return rows[0] ?? null;
  },

  async deleteForUser(id: string, userId: string) {
    const rows = await db
      .delete(themes)
      .where(and(eq(themes.id, id), eq(themes.userId, userId)))
      .returning();
    return rows[0] ?? null;
  },
};
