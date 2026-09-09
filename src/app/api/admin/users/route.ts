import { requireAdmin } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { userService } from "@/services/userService";

export async function GET() {
  return withApiErrorHandling(async () => {
    await requireAdmin();
    const rows = await userService.listAll();
    return jsonOk(rows);
  });
}
