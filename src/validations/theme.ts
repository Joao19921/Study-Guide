import { z } from "zod";

export const createThemeSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  categoryId: z.uuid().optional().nullable(),
});

export const updateThemeSchema = createThemeSchema.partial().extend({
  progress: z.number().int().min(0).max(100).optional(),
});
