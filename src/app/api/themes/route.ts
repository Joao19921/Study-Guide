import { requireUser } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { themeService } from "@/services/themeService";

export async function GET() {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const rows = await themeService.list(user.id);
    return jsonOk(rows);
  });
}

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const created = await themeService.create(user.id, body);
    return jsonOk(created, 201);
  });
}
