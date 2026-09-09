import { z } from "zod";

export const taskPriorities = ["alta", "media", "baixa"] as const;

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(200),
  subtitle: z.string().trim().max(300).optional().nullable(),
  priority: z.enum(taskPriorities).default("media"),
  themeId: z.uuid().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  done: z.boolean().optional(),
});
