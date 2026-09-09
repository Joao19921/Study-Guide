import { requireUser } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { reportService } from "@/services/reportService";

export async function GET() {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const summary = await reportService.summary(user.id);
    return jsonOk(summary);
  });
}
