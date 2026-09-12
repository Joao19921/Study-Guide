import { db } from "@/db";
import { certificates, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const certificateRepository = {
  async listByUser(userId: string) {
    return db.select().from(certificates).where(eq(certificates.userId, userId));
  },

  async listPending() {
    return db
      .select({
        id: certificates.id,
        userId: certificates.userId,
        userName: users.name,
        name: certificates.name,
        provider: certificates.provider,
        credentialUrl: certificates.credentialUrl,
        issuedAt: certificates.issuedAt,
        verified: certificates.verified,
        points: certificates.points,
        verifiedAt: certificates.verifiedAt,
      })
      .from(certificates)
      .innerJoin(users, eq(users.id, certificates.userId))
      .where(and(eq(certificates.verified, false), eq(certificates.verifiedAt, null)));
  },

  async create(input: {
    userId: string;
    name: string;
    provider?: string | null;
    credentialUrl?: string | null;
    issuedAt: Date;
  }) {
    const rows = await db.insert(certificates).values(input).returning();
    return rows[0];
  },

  async findById(id: string) {
    const rows = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async verify(id: string, adminId: string, points: number) {
    const rows = await db
      .update(certificates)
      .set({ verified: true, points, verifiedAt: new Date(), verifiedBy: adminId })
      .where(eq(certificates.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async reject(id: string, adminId: string) {
    const rows = await db
      .update(certificates)
      .set({ verified: false, verifiedAt: new Date(), verifiedBy: adminId })
      .where(eq(certificates.id, id))
      .returning();
    return rows[0] ?? null;
  },
};
