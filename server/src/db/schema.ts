import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ── Users ────────────────────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  googleId: text("google_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  picture: text("picture"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── Categories ────────────────────────────────────────────────────────────────
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6B7280"),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── Receipts ──────────────────────────────────────────────────────────────────
export const receipts = sqliteTable("receipts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  imageFilename: text("image_filename").notNull(),
  vendor: text("vendor"),
  vendorNormalized: text("vendor_normalized"),
  date: text("date"),
  subtotal: real("subtotal"),
  taxAmount: real("tax_amount"),
  tip: real("tip"),
  total: real("total"),
  paymentMethod: text("payment_method"),
  cardLast4: text("card_last4"),
  currency: text("currency").notNull().default("USD"),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  suggestedCategory: text("suggested_category"),
  categoryConfidence: real("category_confidence"),
  confidence: real("confidence").notNull().default(0),
  flags: text("flags").notNull().default("[]"), // JSON array
  ocrTextExcerpt: text("ocr_text_excerpt"),
  notes: text("notes"),
  rawAiResponse: text("raw_ai_response"),
  status: text("status", {
    enum: ["pending", "parsed", "failed", "reviewed"],
  })
    .notNull()
    .default("pending"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── Line Items ────────────────────────────────────────────────────────────────
export const lineItems = sqliteTable("line_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  receiptId: integer("receipt_id")
    .notNull()
    .references(() => receipts.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: real("quantity"),
  unitPrice: real("unit_price"),
  totalPrice: real("total_price"),
  sortOrder: integer("sort_order").notNull().default(0),
});
