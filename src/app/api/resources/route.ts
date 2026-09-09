import { requireUser } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { resourceService } from "@/services/resourceService";

export async function GET() {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const rows = await resourceService.list(user.id);
    return jsonOk(rows);
  });
}

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const created = await resourceService.create(user.id, body);
    return jsonOk(created, 201);
  });
}
