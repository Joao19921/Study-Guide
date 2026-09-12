import { db } from "@/db";
import { adminAuditLogs } from "@/db/securitySchema";

export const adminAuditRepository = {
  async create(input: {
    adminUserId: string;
    targetUserId?: string | null;
    action: string;
    metadata?: Record<string, unknown>;
  }) {
    const rows = await db.insert(adminAuditLogs).values({
      adminUserId: input.adminUserId,
      targetUserId: input.targetUserId ?? null,
      action: input.action,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    }).returning();
    return rows[0];
  },
};
