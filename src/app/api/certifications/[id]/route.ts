import { requireUser } from "@/lib/auth-guard";
import { ApiError } from "@/lib/api-error";
import { jsonNoContent, jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { certificationService } from "@/services/certificationService";
import { certificationRepository } from "@/repositories/certificationRepository";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const certification = await certificationRepository.findByIdForUser(id, user.id);
    if (!certification) throw new ApiError(404, "Certification not found");
    const themes = await certificationRepository.listLinkedThemes(id, user.id);
    return jsonOk({ ...certification, themes });
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const updated = await certificationService.update(id, user.id, body);
    return jsonOk(updated);
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    await certificationService.remove(id, user.id);
    return jsonNoContent();
  });
}
