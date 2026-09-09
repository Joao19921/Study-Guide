import { resourceRepository } from "@/repositories/resourceRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { ApiError } from "@/lib/api-error";
import { createResourceSchema, updateResourceSchema } from "@/validations/resource";

async function assertThemeOwnership(themeId: string | null | undefined, userId: string) {
  if (!themeId) return;
  const theme = await themeRepository.findByIdForUser(themeId, userId);
  if (!theme) throw new ApiError(400, "themeId does not reference an existing theme of this user");
}

export const resourceService = {
  list(userId: string) {
    return resourceRepository.listByUser(userId);
  },

  async create(userId: string, input: unknown) {
    const data = createResourceSchema.parse(input);
    await assertThemeOwnership(data.themeId, userId);
    return resourceRepository.create({
      userId,
      title: data.title,
      type: data.type,
      url: data.url ?? null,
      themeId: data.themeId ?? null,
      status: data.status,
    });
  },

  async update(id: string, userId: string, input: unknown) {
    const data = updateResourceSchema.parse(input);
    if (data.themeId !== undefined) await assertThemeOwnership(data.themeId, userId);
    const updated = await resourceRepository.updateForUser(id, userId, data);
    if (!updated) throw new ApiError(404, "Resource not found");
    return updated;
  },

  async remove(id: string, userId: string) {
    const deleted = await resourceRepository.deleteForUser(id, userId);
    if (!deleted) throw new ApiError(404, "Resource not found");
    return deleted;
  },
};
