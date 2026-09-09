import { z } from "zod";

export const createStudySessionSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(200),
  durationMinutes: z.number().int().positive().max(24 * 60),
  themeId: z.uuid().optional().nullable(),
  occurredAt: z.coerce.date().optional(),
});

export const updateStudySessionSchema = createStudySessionSchema.partial();
