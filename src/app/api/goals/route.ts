import { requireUser } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { goalService } from "@/services/goalService";

export async function GET() {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const rows = await goalService.list(user.id);
    return jsonOk(rows);
  });
}

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const created = await goalService.create(user.id, body);
    return jsonOk(created, 201);
  });
}
