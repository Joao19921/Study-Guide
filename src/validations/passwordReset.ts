import { z } from "zod";

export const passwordResetSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(128),
});
