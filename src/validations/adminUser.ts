import { z } from "zod";

export const userRoles = ["user", "admin"] as const;

export const updateUserRoleSchema = z.object({
  role: z.enum(userRoles),
});
