import { requireAdmin } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { certificateService } from "@/services/certificateService";

export async function GET() {
  return withApiErrorHandling(async () => {
    await requireAdmin();
    return jsonOk(await certificateService.listPending());
  });
}
