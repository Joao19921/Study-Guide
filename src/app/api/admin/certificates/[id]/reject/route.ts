import { requireAdmin } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { certificateService } from "@/services/certificateService";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const admin = await requireAdmin();
    const { id } = await params;
    return jsonOk(await certificateService.reject(id, admin.id));
  });
}
