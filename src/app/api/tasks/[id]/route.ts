import { requireUser } from "@/lib/auth-guard";
import { ApiError } from "@/lib/api-error";
import { jsonNoContent, jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { taskService } from "@/services/taskService";
import { taskRepository } from "@/repositories/taskRepository";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const task = await taskRepository.findByIdForUser(id, user.id);
    if (!task) throw new ApiError(404, "Task not found");
    return jsonOk(task);
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const updated = await taskService.update(id, user.id, body);
    return jsonOk(updated);
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    await taskService.remove(id, user.id);
    return jsonNoContent();
  });
}
