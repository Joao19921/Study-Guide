import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ApiError } from "@/lib/api-error";
import { hashPassword } from "@/lib/password";

function getRecoveryConfig() {
  const code = process.env.ACCOUNT_RECOVERY_CODE?.trim();
  const expiresAt = process.env.ACCOUNT_RECOVERY_EXPIRES_AT?.trim();
  if (!code || !expiresAt) throw new ApiError(503, "Account recovery is not configured");
  const expires = new Date(expiresAt);
  if (Number.isNaN(expires.getTime()) || expires <= new Date()) {
    throw new ApiError(410, "Account recovery has expired");
  }
  return code;
}

export const bootstrapRecoveryService = {
  async reset(password: string, code: string) {
    const expectedCode = getRecoveryConfig();
    if (code !== expectedCode) throw new ApiError(401, "Invalid recovery code");
    if (password.length < 8 || password.length > 128) {
      throw new ApiError(400, "Password must contain between 8 and 128 characters");
    }

    const candidates = await db.select({ id: users.id }).from(users).limit(2);
    if (candidates.length !== 1) {
      throw new ApiError(409, "Bootstrap recovery requires exactly one user");
    }

    const now = new Date();
    const [updated] = await db
      .update(users)
      .set({
        passwordHash: hashPassword(password),
        mustChangePassword: false,
        active: true,
        deactivatedAt: null,
        updatedAt: now,
      })
      .where(eq(users.id, candidates[0].id))
      .returning({ id: users.id });

    if (!updated) throw new ApiError(404, "User not found");
    return { success: true };
  },
};
