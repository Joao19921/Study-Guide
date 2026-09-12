import { requireAdmin } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { userService } from "@/services/userService";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const updated = await userService.update(id, admin.id, body);
    return jsonOk(updated);
  });
}
