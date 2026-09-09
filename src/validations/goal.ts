import { z } from "zod";

export const goalPeriods = ["weekly", "monthly", "quarterly", "yearly"] as const;

export const createGoalSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(200),
  period: z.enum(goalPeriods).default("weekly"),
  targetHours: z.number().positive().max(1000).optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
  progress: z.number().int().min(0).max(100).optional(),
});
