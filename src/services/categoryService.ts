import { categoryRepository } from "@/repositories/categoryRepository";
import { ApiError } from "@/lib/api-error";
import { createCategorySchema, updateCategorySchema } from "@/validations/category";

export const categoryService = {
  list(userId: string) {
    return categoryRepository.listByUser(userId);
  },

  async create(userId: string, input: unknown) {
    const data = createCategorySchema.parse(input);
    return categoryRepository.create({ userId, name: data.name, color: data.color });
  },

  async update(id: string, userId: string, input: unknown) {
    const data = updateCategorySchema.parse(input);
    const updated = await categoryRepository.updateForUser(id, userId, data);
    if (!updated) throw new ApiError(404, "Category not found");
    return updated;
  },

  async remove(id: string, userId: string) {
    const deleted = await categoryRepository.deleteForUser(id, userId);
    if (!deleted) throw new ApiError(404, "Category not found");
    return deleted;
  },
};
