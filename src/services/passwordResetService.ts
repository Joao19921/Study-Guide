import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { passwordResetTokens } from "@/db/securitySchema";
import { userRepository } from "@/repositories/userRepository";
import { adminAuditRepository } from "@/repositories/adminAuditRepository";
import { ApiError } from "@/lib/api-error";
import { hashPassword } from "@/lib/password";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export const passwordResetService = {
  async createAdminReset(userId: string, adminUserId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const now = new Date();
    await db
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(and(eq(passwordResetTokens.userId, userId), isNull(passwordResetTokens.usedAt)));

    const rawToken = randomBytes(32).toString("base64url");
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
    await db.insert(passwordResetTokens).values({
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt,
      createdBy: adminUserId,
    });
    await adminAuditRepository.create({
      adminUserId,
      targetUserId: userId,
      action: "user.password_reset_requested",
    });
    return { token: rawToken, expiresAt };
  },

  async reset(token: string, password: string) {
    const tokenHash = hashToken(token);
    const now = new Date();
    const rows = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now),
        ),
      )
      .limit(1);
    const resetToken = rows[0];
    if (!resetToken) throw new ApiError(400, "Invalid or expired reset token");

    const passwordHash = hashPassword(password);
    const consumed = await db
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(and(eq(passwordResetTokens.id, resetToken.id), isNull(passwordResetTokens.usedAt)))
      .returning();
    if (!consumed.length) throw new ApiError(400, "Invalid or expired reset token");

    const updated = await db
      .update(users)
      .set({
        passwordHash,
        mustChangePassword: false,
        active: true,
        deactivatedAt: null,
        updatedAt: now,
      })
      .where(eq(users.id, resetToken.userId))
      .returning({ id: users.id });
    if (!updated.length) throw new ApiError(404, "User not found");

    return { success: true };
  },
};
