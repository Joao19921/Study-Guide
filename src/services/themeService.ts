import { themeRepository } from "@/repositories/themeRepository";
import { resourceRepository } from "@/repositories/resourceRepository";
import { categoryRepository } from "@/repositories/categoryRepository";
import { ApiError } from "@/lib/api-error";
import { averageProgress } from "@/lib/business-rules";
import { createThemeSchema, updateThemeSchema } from "@/validations/theme";

async function assertCategoryOwnership(categoryId: string | null | undefined, userId: string) {
  if (!categoryId) return;
  const category = await categoryRepository.findByIdForUser(categoryId, userId);
  if (!category) throw new ApiError(400, "categoryId does not reference an existing category of this user");
}

/** A theme's progress is derived from its linked resources when it has any; otherwise it keeps its manually-set value. */
function withComputedProgress<T extends { id: string; progress: number }>(theme: T, resourcesByTheme: Map<string, number[]>) {
  const resourceProgresses = resourcesByTheme.get(theme.id);
  const computed = resourceProgresses ? averageProgress(resourceProgresses) : null;
  return { ...theme, progress: computed ?? theme.progress };
}

export const themeService = {
  async list(userId: string) {
    const [themeRows, resourceRows] = await Promise.all([
      themeRepository.listByUser(userId),
      resourceRepository.listByUser(userId),
    ]);

    const resourcesByTheme = new Map<string, number[]>();
    for (const resource of resourceRows) {
      if (!resource.themeId) continue;
      const list = resourcesByTheme.get(resource.themeId) ?? [];
      list.push(resource.progress);
      resourcesByTheme.set(resource.themeId, list);
    }

    return themeRows.map((theme) => withComputedProgress(theme, resourcesByTheme));
  },

  async create(userId: string, input: unknown) {
    const data = createThemeSchema.parse(input);
    await assertCategoryOwnership(data.categoryId, userId);
    return themeRepository.create({
      userId,
      name: data.name,
      description: data.description ?? null,
      categoryId: data.categoryId ?? null,
    });
  },

  async update(id: string, userId: string, input: unknown) {
    const data = updateThemeSchema.parse(input);
    if (data.categoryId !== undefined) await assertCategoryOwnership(data.categoryId, userId);
    const updated = await themeRepository.updateForUser(id, userId, data);
    if (!updated) throw new ApiError(404, "Theme not found");
    return updated;
  },

  async remove(id: string, userId: string) {
    const deleted = await themeRepository.deleteForUser(id, userId);
    if (!deleted) throw new ApiError(404, "Theme not found");
    return deleted;
  },
};
