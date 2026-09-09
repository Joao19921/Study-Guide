import { studySessionRepository } from "@/repositories/studySessionRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { ApiError } from "@/lib/api-error";
import { createStudySessionSchema, updateStudySessionSchema } from "@/validations/studySession";

async function assertThemeOwnership(themeId: string | null | undefined, userId: string) {
  if (!themeId) return;
  const theme = await themeRepository.findByIdForUser(themeId, userId);
  if (!theme) throw new ApiError(400, "themeId does not reference an existing theme of this user");
}

export const studySessionService = {
  list(userId: string) {
    return studySessionRepository.listByUser(userId);
  },

  async create(userId: string, input: unknown) {
    const data = createStudySessionSchema.parse(input);
    await assertThemeOwnership(data.themeId, userId);
    return studySessionRepository.create({
      userId,
      title: data.title,
      durationMinutes: data.durationMinutes,
      themeId: data.themeId ?? null,
      occurredAt: data.occurredAt ?? new Date(),
    });
  },

  async update(id: string, userId: string, input: unknown) {
    const data = updateStudySessionSchema.parse(input);
    if (data.themeId !== undefined) await assertThemeOwnership(data.themeId, userId);
    const updated = await studySessionRepository.updateForUser(id, userId, data);
    if (!updated) throw new ApiError(404, "Study session not found");
    return updated;
  },

  async remove(id: string, userId: string) {
    const deleted = await studySessionRepository.deleteForUser(id, userId);
    if (!deleted) throw new ApiError(404, "Study session not found");
    return deleted;
  },
};
