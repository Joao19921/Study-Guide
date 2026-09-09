import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "name is required").max(120),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "color must be a hex value like #80aeca")
    .optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
