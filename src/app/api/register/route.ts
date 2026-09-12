import { requireAdmin } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { userService } from "@/services/userService";

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const result = await userService.create(admin.id, body);
    return jsonOk(result, 201);
  });
}
