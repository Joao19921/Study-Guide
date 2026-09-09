import { requireUser } from "@/lib/auth-guard";
import { ApiError } from "@/lib/api-error";
import { jsonNoContent, jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { themeService } from "@/services/themeService";
import { themeRepository } from "@/repositories/themeRepository";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const theme = await themeRepository.findByIdForUser(id, user.id);
    if (!theme) throw new ApiError(404, "Theme not found");
    return jsonOk(theme);
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const updated = await themeService.update(id, user.id, body);
    return jsonOk(updated);
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    await themeService.remove(id, user.id);
    return jsonNoContent();
  });
}
