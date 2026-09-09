import { db } from "@/db";
import { certificationThemes, certifications, themes } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type NewCertification = typeof certifications.$inferInsert;
export type CertificationUpdate = Partial<Pick<NewCertification, "name" | "provider" | "examDate" | "progress">>;

export const certificationRepository = {
  listByUser(userId: string) {
    return db.select().from(certifications).where(eq(certifications.userId, userId));
  },

  async findByIdForUser(id: string, userId: string) {
    const rows = await db
      .select()
      .from(certifications)
      .where(and(eq(certifications.id, id), eq(certifications.userId, userId)));
    return rows[0] ?? null;
  },

  async create(data: NewCertification) {
    const rows = await db.insert(certifications).values(data).returning();
    return rows[0];
  },

  async updateForUser(id: string, userId: string, data: CertificationUpdate) {
    const rows = await db
      .update(certifications)
      .set(data)
      .where(and(eq(certifications.id, id), eq(certifications.userId, userId)))
      .returning();
    return rows[0] ?? null;
  },

  async deleteForUser(id: string, userId: string) {
    const rows = await db
      .delete(certifications)
      .where(and(eq(certifications.id, id), eq(certifications.userId, userId)))
      .returning();
    return rows[0] ?? null;
  },

  /** Themes linked to a certification, scoped through the owning user's themes. */
  async listLinkedThemes(certificationId: string, userId: string) {
    return db
      .select({
        id: themes.id,
        name: themes.name,
        description: themes.description,
        progress: themes.progress,
        categoryId: themes.categoryId,
      })
      .from(certificationThemes)
      .innerJoin(themes, eq(certificationThemes.themeId, themes.id))
      .where(and(eq(certificationThemes.certificationId, certificationId), eq(themes.userId, userId)));
  },

  async linkTheme(certificationId: string, themeId: string) {
    await db.insert(certificationThemes).values({ certificationId, themeId }).onConflictDoNothing();
  },

  async unlinkTheme(certificationId: string, themeId: string) {
    await db
      .delete(certificationThemes)
      .where(and(eq(certificationThemes.certificationId, certificationId), eq(certificationThemes.themeId, themeId)));
  },
};
