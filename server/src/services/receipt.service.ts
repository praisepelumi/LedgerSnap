import { eq, desc, like, and, gte, lte, sql } from "drizzle-orm";
import { db } from "../db/connection.js";
import { receipts, lineItems } from "../db/schema.js";
import type {
  Receipt,
  ReceiptWithItems,
  ReceiptFilter,
  UpdateReceipt,
  LineItemRecord,
  ParsedReceiptResponse,
} from "@receipt/shared";
import { AppError } from "../middleware/errorHandler.js";

// ── Create a receipt from AI parse result ─────────────────────────────────────

export async function createFromParsed(
  imageFilename: string,
  parsed: ParsedReceiptResponse,
  rawJson: string,
  userId: number
): Promise<ReceiptWithItems> {
  const receiptRow = db
    .insert(receipts)
    .values({
      userId,
      imageFilename,
      vendor: parsed.merchant?.name ?? null,
      vendorNormalized: parsed.merchant?.normalized_name ?? null,
      date: parsed.date,
      subtotal: parsed.subtotal,
      taxAmount: parsed.taxAmount,
      tip: parsed.tip,
      total: parsed.total,
      paymentMethod: parsed.paymentMethod,
      cardLast4: parsed.cardLast4,
      currency: parsed.currency ?? "USD",
      suggestedCategory: parsed.suggestedCategory,
      categoryConfidence: parsed.categoryConfidence,
      confidence: parsed.confidence,
      flags: JSON.stringify(parsed.flags),
      ocrTextExcerpt: parsed.ocrTextExcerpt,
      rawAiResponse: rawJson,
      status: parsed.isReceipt ? "parsed" : "failed",
    })
    .returning()
    .get();

  // Insert line items
  const insertedItems: LineItemRecord[] = [];
  if (parsed.lineItems && parsed.lineItems.length > 0) {
    for (let i = 0; i < parsed.lineItems.length; i++) {
      const item = parsed.lineItems[i];
      const row = db
        .insert(lineItems)
        .values({
          receiptId: receiptRow.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          sortOrder: i,
        })
        .returning()
        .get();
      insertedItems.push(mapLineItem(row));
    }
  }

  return {
    ...mapReceipt(receiptRow),
    lineItems: insertedItems,
  };
}

// ── Get receipt by ID ─────────────────────────────────────────────────────────

export async function getById(id: number, userId: number): Promise<ReceiptWithItems | null> {
  const row = db
    .select()
    .from(receipts)
    .where(and(eq(receipts.id, id), eq(receipts.userId, userId)))
    .get();
  if (!row) return null;

  const items = db
    .select()
    .from(lineItems)
    .where(eq(lineItems.receiptId, id))
    .orderBy(lineItems.sortOrder)
    .all();

  return {
    ...mapReceipt(row),
    lineItems: items.map(mapLineItem),
  };
}

// ── List receipts with filters ────────────────────────────────────────────────

export async function list(
  filters: ReceiptFilter,
  userId: number
): Promise<{ data: Receipt[]; total: number }> {
  const conditions = [eq(receipts.userId, userId)];

  if (filters.search) {
    conditions.push(like(receipts.vendor, `%${filters.search}%`));
  }

  if (filters.categoryId) {
    conditions.push(eq(receipts.categoryId, filters.categoryId));
  }

  if (filters.dateFrom) {
    conditions.push(gte(receipts.date, filters.dateFrom));
  }

  if (filters.dateTo) {
    conditions.push(lte(receipts.date, filters.dateTo));
  }

  if (filters.status) {
    conditions.push(eq(receipts.status, filters.status));
  }

  const whereClause = and(...conditions);

  // Get total count
  const countResult = db
    .select({ count: sql<number>`count(*)` })
    .from(receipts)
    .where(whereClause)
    .get();

  const total = countResult?.count ?? 0;

  // Get paginated results
  const offset = (filters.page - 1) * filters.limit;
  const rows = db
    .select()
    .from(receipts)
    .where(whereClause)
    .orderBy(desc(receipts.createdAt))
    .limit(filters.limit)
    .offset(offset)
    .all();

  return {
    data: rows.map(mapReceipt),
    total,
  };
}

// ── Update receipt ────────────────────────────────────────────────────────────

export async function update(
  id: number,
  data: UpdateReceipt,
  userId: number
): Promise<Receipt> {
  const existing = await getById(id, userId);
  if (!existing) {
    throw new AppError("NOT_FOUND", `Receipt ${id} not found`, 404);
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (data.vendor !== undefined) updateData.vendor = data.vendor;
  if (data.vendorNormalized !== undefined) updateData.vendorNormalized = data.vendorNormalized;
  if (data.date !== undefined) updateData.date = data.date;
  if (data.subtotal !== undefined) updateData.subtotal = data.subtotal;
  if (data.taxAmount !== undefined) updateData.taxAmount = data.taxAmount;
  if (data.tip !== undefined) updateData.tip = data.tip;
  if (data.total !== undefined) updateData.total = data.total;
  if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
  if (data.cardLast4 !== undefined) updateData.cardLast4 = data.cardLast4;
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.status !== undefined) updateData.status = data.status;

  const result = db
    .update(receipts)
    .set(updateData)
    .where(and(eq(receipts.id, id), eq(receipts.userId, userId)))
    .returning()
    .get();

  return mapReceipt(result);
}

// ── Delete receipt ────────────────────────────────────────────────────────────

export async function remove(id: number, userId: number): Promise<void> {
  const existing = await getById(id, userId);
  if (!existing) {
    throw new AppError("NOT_FOUND", `Receipt ${id} not found`, 404);
  }

  db.delete(receipts)
    .where(and(eq(receipts.id, id), eq(receipts.userId, userId)))
    .run();
}

// ── Get recent receipts for duplicate detection ───────────────────────────────

export async function getRecentForDuplicateCheck(userId: number, limit = 50) {
  return db
    .select({
      id: receipts.id,
      vendorNormalized: receipts.vendorNormalized,
      total: receipts.total,
      date: receipts.date,
      cardLast4: receipts.cardLast4,
    })
    .from(receipts)
    .where(and(eq(receipts.status, "parsed"), eq(receipts.userId, userId)))
    .orderBy(desc(receipts.createdAt))
    .limit(limit)
    .all();
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapReceipt(row: typeof receipts.$inferSelect): Receipt {
  return {
    id: row.id,
    imageFilename: row.imageFilename,
    vendor: row.vendor,
    vendorNormalized: row.vendorNormalized,
    date: row.date,
    subtotal: row.subtotal,
    taxAmount: row.taxAmount,
    tip: row.tip,
    total: row.total,
    paymentMethod: row.paymentMethod,
    cardLast4: row.cardLast4,
    currency: row.currency,
    categoryId: row.categoryId,
    suggestedCategory: row.suggestedCategory,
    categoryConfidence: row.categoryConfidence,
    confidence: row.confidence,
    flags: JSON.parse(row.flags || "[]"),
    ocrTextExcerpt: row.ocrTextExcerpt,
    notes: row.notes,
    rawAiResponse: row.rawAiResponse,
    status: row.status as Receipt["status"],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapLineItem(row: typeof lineItems.$inferSelect): LineItemRecord {
  return {
    id: row.id,
    receiptId: row.receiptId,
    description: row.description,
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    totalPrice: row.totalPrice,
    sortOrder: row.sortOrder,
  };
}
