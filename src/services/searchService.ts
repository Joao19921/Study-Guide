import { db } from "@/db";
import { certifications, resources, tasks, themes } from "@/db/schema";
import { and, eq, ilike } from "drizzle-orm";

export type SearchResult = { id: string; type: "tema" | "tarefa" | "material" | "certificacao"; title: string };

export const searchService = {
  /** Busca global: pesquisa temas, tarefas, materiais e certificações do usuário por título. */
  async search(userId: string, query: string): Promise<SearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const pattern = `%${trimmed}%`;

    const [themeRows, taskRows, resourceRows, certificationRows] = await Promise.all([
      db.select({ id: themes.id, title: themes.name }).from(themes).where(and(eq(themes.userId, userId), ilike(themes.name, pattern))),
      db.select({ id: tasks.id, title: tasks.title }).from(tasks).where(and(eq(tasks.userId, userId), ilike(tasks.title, pattern))),
      db
        .select({ id: resources.id, title: resources.title })
        .from(resources)
        .where(and(eq(resources.userId, userId), ilike(resources.title, pattern))),
      db
        .select({ id: certifications.id, title: certifications.name })
        .from(certifications)
        .where(and(eq(certifications.userId, userId), ilike(certifications.name, pattern))),
    ]);

    return [
      ...themeRows.map((row) => ({ ...row, type: "tema" as const })),
      ...taskRows.map((row) => ({ ...row, type: "tarefa" as const })),
      ...resourceRows.map((row) => ({ ...row, type: "material" as const })),
      ...certificationRows.map((row) => ({ ...row, type: "certificacao" as const })),
    ];
  },
};
