import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const userRepository = {
  listAll() {
    return db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, createdAt: users.createdAt, updatedAt: users.updatedAt })
      .from(users);
  },

  async findById(id: string) {
    const rows = await db.select().from(users).where(eq(users.id, id));
    return rows[0] ?? null;
  },

  async findByEmail(email: string) {
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return rows[0] ?? null;
  },

  async updateRole(id: string, role: string) {
    const rows = await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return rows[0] ?? null;
  },

  async updateProfile(id: string, input: { name?: string; email?: string; active?: boolean; role?: string }) {
    const rows = await db.update(users).set({ ...input, updatedAt: new Date(), deactivatedAt: input.active === false ? new Date() : input.active === true ? null : undefined }).where(eq(users.id, id)).returning();
    return rows[0] ?? null;
  },
};
