import { goalRepository } from "@/repositories/goalRepository";
import { studySessionRepository } from "@/repositories/studySessionRepository";
import { ApiError } from "@/lib/api-error";
import { computeGoalProgress, sumDurationMinutes } from "@/lib/business-rules";
import { createGoalSchema, updateGoalSchema } from "@/validations/goal";

export const goalService = {
  /** Goals with a target track real minutes studied since the goal was created; others keep their manual progress. */
  async list(userId: string) {
    const goalRows = await goalRepository.listByUser(userId);
    return Promise.all(
      goalRows.map(async (goal) => {
        const sessions = await studySessionRepository.listByUserSince(userId, goal.createdAt);
        const totalMinutes = sumDurationMinutes(sessions);
        const computed = computeGoalProgress(goal.targetHours, totalMinutes);
        return { ...goal, progress: computed ?? goal.progress, minutesLogged: totalMinutes };
      })
    );
  },

  async create(userId: string, input: unknown) {
    const data = createGoalSchema.parse(input);
    return goalRepository.create({
      userId,
      title: data.title,
      period: data.period,
      targetHours: data.targetHours ?? null,
      dueDate: data.dueDate ?? null,
    });
  },

  async update(id: string, userId: string, input: unknown) {
    const data = updateGoalSchema.parse(input);
    const updated = await goalRepository.updateForUser(id, userId, data);
    if (!updated) throw new ApiError(404, "Goal not found");
    return updated;
  },

  async remove(id: string, userId: string) {
    const deleted = await goalRepository.deleteForUser(id, userId);
    if (!deleted) throw new ApiError(404, "Goal not found");
    return deleted;
  },
};
