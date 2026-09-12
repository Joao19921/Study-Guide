import { ApiError } from "@/lib/api-error";
import { adminAuditRepository } from "@/repositories/adminAuditRepository";
import { certificateRepository } from "@/repositories/certificateRepository";
import { createCertificateSchema } from "@/validations/certificate";

export const certificateService = {
  async listMine(userId: string) {
    return certificateRepository.listByUser(userId);
  },

  async create(userId: string, input: unknown) {
    const data = createCertificateSchema.parse(input);
    return certificateRepository.create({ userId, ...data });
  },

  async listPending() {
    return certificateRepository.listPending();
  },

  async verify(id: string, adminUserId: string, input: unknown) {
    const certificate = await certificateRepository.findById(id);
    if (!certificate) throw new ApiError(404, "Certificate not found");

    const points =
      typeof input === "object" && input !== null && "points" in input && typeof input.points === "number"
        ? Math.max(0, Math.min(1000, input.points))
        : certificate.points;

    const updated = await certificateRepository.verify(id, adminUserId, points);
    if (!updated) throw new ApiError(404, "Certificate not found");
    await adminAuditRepository.create({
      adminUserId,
      targetUserId: certificate.userId,
      action: "certificate.verified",
      metadata: { certificateId: id, points },
    });
    return updated;
  },

  async reject(id: string, adminUserId: string) {
    const certificate = await certificateRepository.findById(id);
    if (!certificate) throw new ApiError(404, "Certificate not found");

    const updated = await certificateRepository.reject(id, adminUserId);
    if (!updated) throw new ApiError(404, "Certificate not found");
    await adminAuditRepository.create({
      adminUserId,
      targetUserId: certificate.userId,
      action: "certificate.rejected",
      metadata: { certificateId: id },
    });
    return updated;
  },
};
