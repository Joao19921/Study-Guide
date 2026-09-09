import { db } from "@/db";
import { resources } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type NewResource = typeof resources.$inferInsert;
export type ResourceUpdate = Partial<
  Pick<NewResource, "title" | "type" | "url" | "themeId" | "status" | "progress">
>;

export const resourceRepository = {
  listByUser(userId: string) {
    return db.select().from(resources).where(eq(resources.userId, userId));
  },

  async findByIdForUser(id: string, userId: string) {
    const rows = await db
      .select()
      .from(resources)
      .where(and(eq(resources.id, id), eq(resources.userId, userId)));
    return rows[0] ?? null;
  },

  listByThemeForUser(themeId: string, userId: string) {
    return db
      .select()
      .from(resources)
      .where(and(eq(resources.themeId, themeId), eq(resources.userId, userId)));
  },

  async create(data: NewResource) {
    const rows = await db.insert(resources).values(data).returning();
    return rows[0];
  },

  async updateForUser(id: string, userId: string, data: ResourceUpdate) {
    const rows = await db
      .update(resources)
      .set(data)
      .where(and(eq(resources.id, id), eq(resources.userId, userId)))
      .returning();
    return rows[0] ?? null;
  },

  async deleteForUser(id: string, userId: string) {
    const rows = await db
      .delete(resources)
      .where(and(eq(resources.id, id), eq(resources.userId, userId)))
      .returning();
    return rows[0] ?? null;
  },
};
