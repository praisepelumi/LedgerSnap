import { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/category.service.js";
import * as api from "../utils/apiResponse.js";
import type { CreateCategory, UpdateCategory } from "@receipt/shared";

export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const categories = await categoryService.getAllCategories(userId);
    api.success(res, categories);
  } catch (err) {
    next(err);
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const data = req.body as CreateCategory;
    const category = await categoryService.createCategory(data, userId);
    api.success(res, category, 201);
  } catch (err) {
    next(err);
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    const data = req.body as UpdateCategory;
    const category = await categoryService.updateCategory(id, data, userId);
    api.success(res, category);
  } catch (err) {
    next(err);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    await categoryService.deleteCategory(id, userId);
    api.success(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}
