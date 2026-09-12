import { userRepository } from "@/repositories/userRepository";
import { adminAuditRepository } from "@/repositories/adminAuditRepository";
import { ApiError } from "@/lib/api-error";
import { normalizeEmail } from "@/lib/password";
import { passwordResetService } from "@/services/passwordResetService";
import { createAdminUserSchema, updateAdminUserSchema } from "@/validations/adminUsers";

export const userService = {
  listAll() {
    return userRepository.listAll();
  },

  async create(actingAdminId: string, input: unknown) {
    const data = createAdminUserSchema.parse(input);
    const email = normalizeEmail(data.email);
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ApiError(409, "E-mail already in use");

    const created = await userRepository.create({
      name: data.name,
      email,
      role: data.role,
    });
    if (!created) throw new ApiError(500, "Unable to create user");

    const reset = await passwordResetService.createAdminReset(created.id, actingAdminId);
    await adminAuditRepository.create({
      adminUserId: actingAdminId,
      targetUserId: created.id,
      action: "user.created",
      metadata: { role: data.role },
    });

    return {
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        active: created.active,
        mustChangePassword: created.mustChangePassword,
      },
      resetToken: reset.token,
      resetExpiresAt: reset.expiresAt,
    };
  },

  async updateRole(id: string, actingAdminId: string, input: unknown) {
    const data = updateAdminUserSchema.pick({ role: true }).parse(input);
    if (!data.role) throw new ApiError(400, "Role is required");
    if (id === actingAdminId && data.role !== "admin") {
      throw new ApiError(400, "You cannot revoke your own admin role");
    }
    const updated = await userRepository.updateRole(id, data.role);
    if (!updated) throw new ApiError(404, "User not found");
    await adminAuditRepository.create({
      adminUserId: actingAdminId,
      targetUserId: id,
      action: "user.role_updated",
      metadata: { role: data.role },
    });
    return updated;
  },

  async update(id: string, actingAdminId: string, input: unknown) {
    const data = updateAdminUserSchema.parse(input);
    if (id === actingAdminId && data.active === false) {
      throw new ApiError(400, "You cannot deactivate your own account");
    }
    if (id === actingAdminId && data.role && data.role !== "admin") {
      throw new ApiError(400, "You cannot revoke your own admin role");
    }
    const normalized = { ...data, ...(data.email ? { email: normalizeEmail(data.email) } : {}) };
    if (normalized.email) {
      const existing = await userRepository.findByEmail(normalized.email);
      if (existing && existing.id !== id) throw new ApiError(409, "E-mail already in use");
    }
    const updated = await userRepository.updateProfile(id, normalized);
    if (!updated) throw new ApiError(404, "User not found");
    await adminAuditRepository.create({
      adminUserId: actingAdminId,
      targetUserId: id,
      action: "user.updated",
      metadata: { fields: Object.keys(data) },
    });
    return updated;
  },
};
