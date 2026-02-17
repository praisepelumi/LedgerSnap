import { eq, and } from "drizzle-orm";
import { db } from "../db/connection.js";
import { categories } from "../db/schema.js";
import type { Category, CreateCategory, UpdateCategory } from "@receipt/shared";
import { AppError } from "../middleware/errorHandler.js";

export async function getAllCategories(userId: number): Promise<Category[]> {
  const rows = db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.name)
    .all();
  return rows.map(mapCategory);
}

export async function getCategoryById(id: number, userId: number): Promise<Category | null> {
  const row = db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .get();
  return row ? mapCategory(row) : null;
}

export async function createCategory(data: CreateCategory, userId: number): Promise<Category> {
  try {
    const result = db
      .insert(categories)
      .values({ name: data.name, color: data.color, userId })
      .returning()
      .get();
    return mapCategory(result);
  } catch (err: any) {
    if (err?.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw new AppError("DUPLICATE_CATEGORY", `Category "${data.name}" already exists`, 409);
    }
    throw err;
  }
}

export async function updateCategory(
  id: number,
  data: UpdateCategory,
  userId: number
): Promise<Category> {
  const existing = await getCategoryById(id, userId);
  if (!existing) {
    throw new AppError("NOT_FOUND", `Category ${id} not found`, 404);
  }

  const result = db
    .update(categories)
    .set(data)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning()
    .get();

  return mapCategory(result);
}

export async function deleteCategory(id: number, userId: number): Promise<void> {
  const existing = await getCategoryById(id, userId);
  if (!existing) {
    throw new AppError("NOT_FOUND", `Category ${id} not found`, 404);
  }

  db.delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .run();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapCategory(row: typeof categories.$inferSelect): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    isDefault: row.isDefault,
    createdAt: row.createdAt,
  };
}
