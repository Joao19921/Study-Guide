import { z } from "zod";

export const createCertificationSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(200),
  provider: z.string().trim().max(200).optional().nullable(),
  examDate: z.coerce.date().optional().nullable(),
});

export const updateCertificationSchema = createCertificationSchema.partial().extend({
  progress: z.number().int().min(0).max(100).optional(),
});

export const linkThemeSchema = z.object({
  themeId: z.uuid(),
});
