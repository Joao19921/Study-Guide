import { z } from "zod";

export const resourceTypes = ["curso", "livro", "link", "plataforma", "artigo"] as const;
export const resourceStatuses = ["nao_iniciado", "em_andamento", "concluido"] as const;

export const createResourceSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(200),
  type: z.enum(resourceTypes).default("link"),
  url: z.url().optional().nullable(),
  themeId: z.uuid().optional().nullable(),
  status: z.enum(resourceStatuses).default("nao_iniciado"),
});

export const updateResourceSchema = createResourceSchema.partial().extend({
  progress: z.number().int().min(0).max(100).optional(),
});
