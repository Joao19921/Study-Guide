import { taskRepository } from "@/repositories/taskRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { ApiError } from "@/lib/api-error";
import { sortTasksByPriority } from "@/lib/business-rules";
import { createTaskSchema, updateTaskSchema } from "@/validations/task";

async function assertThemeOwnership(themeId: string | null | undefined, userId: string) {
  if (!themeId) return;
  const theme = await themeRepository.findByIdForUser(themeId, userId);
  if (!theme) throw new ApiError(400, "themeId does not reference an existing theme of this user");
}

export const taskService = {
  /** Priorização inteligente: pendentes primeiro, depois por prioridade e prazo. */
  async list(userId: string) {
    const rows = await taskRepository.listByUser(userId);
    return sortTasksByPriority(rows);
  },

  async create(userId: string, input: unknown) {
    const data = createTaskSchema.parse(input);
    await assertThemeOwnership(data.themeId, userId);
    return taskRepository.create({
      userId,
      title: data.title,
      subtitle: data.subtitle ?? null,
      priority: data.priority,
      themeId: data.themeId ?? null,
      dueDate: data.dueDate ?? null,
    });
  },

  async update(id: string, userId: string, input: unknown) {
    const data = updateTaskSchema.parse(input);
    if (data.themeId !== undefined) await assertThemeOwnership(data.themeId, userId);
    const updated = await taskRepository.updateForUser(id, userId, data);
    if (!updated) throw new ApiError(404, "Task not found");
    return updated;
  },

  async remove(id: string, userId: string) {
    const deleted = await taskRepository.deleteForUser(id, userId);
    if (!deleted) throw new ApiError(404, "Task not found");
    return deleted;
  },
};
