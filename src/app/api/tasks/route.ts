import { requireUser } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { taskService } from "@/services/taskService";

export async function GET() {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const rows = await taskService.list(user.id);
    return jsonOk(rows);
  });
}

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const created = await taskService.create(user.id, body);
    return jsonOk(created, 201);
  });
}
