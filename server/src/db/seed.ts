import { db } from "./connection.js";
import { categories } from "./schema.js";

const defaultCategories = [
  { name: "Food & Dining", color: "#EF4444", isDefault: true },
  { name: "Office Supplies", color: "#3B82F6", isDefault: true },
  { name: "Travel", color: "#8B5CF6", isDefault: true },
  { name: "Utilities", color: "#F59E0B", isDefault: true },
  { name: "Transportation", color: "#10B981", isDefault: true },
  { name: "Entertainment", color: "#EC4899", isDefault: true },
  { name: "Healthcare", color: "#06B6D4", isDefault: true },
  { name: "Other", color: "#6B7280", isDefault: true },
];

/**
 * Seed default categories for a specific user.
 * Called on first login — idempotent via onConflictDoNothing.
 */
export function seedDefaultCategoriesForUser(userId: number): void {
  for (const cat of defaultCategories) {
    db.insert(categories)
      .values({ ...cat, userId })
      .onConflictDoNothing()
      .run();
  }
}
