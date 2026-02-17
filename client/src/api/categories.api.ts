import apiClient from "./client.js";
import type { Category, CreateCategory, UpdateCategory } from "@receipt/shared";

export async function listCategories(): Promise<Category[]> {
  const { data } = await apiClient.get("/categories");
  return data.data;
}

export async function createCategory(input: CreateCategory): Promise<Category> {
  const { data } = await apiClient.post("/categories", input);
  return data.data;
}

export async function updateCategory(
  id: number,
  input: UpdateCategory
): Promise<Category> {
  const { data } = await apiClient.put(`/categories/${id}`, input);
  return data.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
