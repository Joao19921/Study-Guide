import { requireUser } from "@/lib/auth-guard";
import { ApiError } from "@/lib/api-error";
import { jsonNoContent, jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { studySessionService } from "@/services/studySessionService";
import { studySessionRepository } from "@/repositories/studySessionRepository";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const session = await studySessionRepository.findByIdForUser(id, user.id);
    if (!session) throw new ApiError(404, "Study session not found");
    return jsonOk(session);
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const updated = await studySessionService.update(id, user.id, body);
    return jsonOk(updated);
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    await studySessionService.remove(id, user.id);
    return jsonNoContent();
  });
}
