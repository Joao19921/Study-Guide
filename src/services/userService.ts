import { userRepository } from "@/repositories/userRepository";
import { ApiError } from "@/lib/api-error";
import { updateUserRoleSchema } from "@/validations/adminUser";

export const userService = {
  listAll() {
    return userRepository.listAll();
  },

  async updateRole(id: string, actingAdminId: string, input: unknown) {
    const data = updateUserRoleSchema.parse(input);
    if (id === actingAdminId && data.role !== "admin") {
      throw new ApiError(400, "You cannot revoke your own admin role");
    }
    const updated = await userRepository.updateRole(id, data.role);
    if (!updated) throw new ApiError(404, "User not found");
    return updated;
  },
};
