import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const userRepository = {
  listAll() {
    return db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
      .from(users);
  },

  async findById(id: string) {
    const rows = await db.select().from(users).where(eq(users.id, id));
    return rows[0] ?? null;
  },

  async updateRole(id: string, role: string) {
    const rows = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return rows[0] ?? null;
  },
};
