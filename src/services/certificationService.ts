import { certificationRepository } from "@/repositories/certificationRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { ApiError } from "@/lib/api-error";
import { averageProgress } from "@/lib/business-rules";
import { createCertificationSchema, linkThemeSchema, updateCertificationSchema } from "@/validations/certification";

export const certificationService = {
  async list(userId: string) {
    const certificationRows = await certificationRepository.listByUser(userId);
    return Promise.all(
      certificationRows.map(async (certification) => {
        const linkedThemes = await certificationRepository.listLinkedThemes(certification.id, userId);
        const computed = averageProgress(linkedThemes.map((theme) => theme.progress));
        return {
          ...certification,
          progress: computed ?? certification.progress,
          themes: linkedThemes,
        };
      })
    );
  },

  async create(userId: string, input: unknown) {
    const data = createCertificationSchema.parse(input);
    return certificationRepository.create({
      userId,
      name: data.name,
      provider: data.provider ?? null,
      examDate: data.examDate ?? null,
    });
  },

  async update(id: string, userId: string, input: unknown) {
    const data = updateCertificationSchema.parse(input);
    const updated = await certificationRepository.updateForUser(id, userId, data);
    if (!updated) throw new ApiError(404, "Certification not found");
    return updated;
  },

  async remove(id: string, userId: string) {
    const deleted = await certificationRepository.deleteForUser(id, userId);
    if (!deleted) throw new ApiError(404, "Certification not found");
    return deleted;
  },

  async linkTheme(certificationId: string, userId: string, input: unknown) {
    const data = linkThemeSchema.parse(input);
    const certification = await certificationRepository.findByIdForUser(certificationId, userId);
    if (!certification) throw new ApiError(404, "Certification not found");

    const theme = await themeRepository.findByIdForUser(data.themeId, userId);
    if (!theme) throw new ApiError(400, "themeId does not reference an existing theme of this user");

    await certificationRepository.linkTheme(certificationId, data.themeId);
    return certificationRepository.listLinkedThemes(certificationId, userId);
  },

  async unlinkTheme(certificationId: string, themeId: string, userId: string) {
    const certification = await certificationRepository.findByIdForUser(certificationId, userId);
    if (!certification) throw new ApiError(404, "Certification not found");

    await certificationRepository.unlinkTheme(certificationId, themeId);
    return certificationRepository.listLinkedThemes(certificationId, userId);
  },
};
