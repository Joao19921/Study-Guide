import { z } from "zod";

export const createCompetitionSeasonSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
  })
  .refine((value) => value.endsAt > value.startsAt, {
    message: "The season end must be after the start",
    path: ["endsAt"],
  });
