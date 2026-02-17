import { z } from "zod";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
} from "../schemas/category.schema.js";

export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;

export interface Category {
  id: number;
  name: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
}
