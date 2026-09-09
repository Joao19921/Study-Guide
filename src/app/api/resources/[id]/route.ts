import { requireUser } from "@/lib/auth-guard";
import { ApiError } from "@/lib/api-error";
import { jsonNoContent, jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { resourceService } from "@/services/resourceService";
import { resourceRepository } from "@/repositories/resourceRepository";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const resource = await resourceRepository.findByIdForUser(id, user.id);
    if (!resource) throw new ApiError(404, "Resource not found");
    return jsonOk(resource);
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const updated = await resourceService.update(id, user.id, body);
    return jsonOk(updated);
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    await resourceService.remove(id, user.id);
    return jsonNoContent();
  });
}
