import { z } from "zod";

// ── Flags that the AI can return ──────────────────────────────────────────────
export const ReceiptFlagEnum = z.enum([
  "not_a_receipt",
  "low_image_quality",
  "merchant_missing",
  "date_missing",
  "date_partial_or_ambiguous",
  "total_missing",
  "currency_missing",
  "multiple_totals_detected",
  "totals_inconsistent",
  "tax_not_itemized",
  "tip_possible_but_unclear",
  "handwritten_or_hard_to_read",
  "foreign_language_detected",
]);

export type ReceiptFlag = z.infer<typeof ReceiptFlagEnum>;

// ── Line item schema ──────────────────────────────────────────────────────────
export const LineItemSchema = z.object({
  description: z.string(),
  quantity: z.number().nullable(),
  unitPrice: z.number().nullable(),
  totalPrice: z.number().nullable(),
});

// ── AI category options ───────────────────────────────────────────────────────
export const SuggestedCategoryEnum = z.enum([
  "meals",
  "travel",
  "lodging",
  "transport",
  "office_supplies",
  "software",
  "equipment",
  "utilities",
  "marketing",
  "professional_services",
  "health",
  "other",
]);

// ── Merchant schema ───────────────────────────────────────────────────────────
export const MerchantSchema = z.object({
  name: z.string().nullable(),
  normalized_name: z.string().nullable(),
});

// ── Full AI response schema (validated after Claude returns) ──────────────────
export const ParsedReceiptResponseSchema = z.object({
  isReceipt: z.boolean(),
  merchant: MerchantSchema,
  date: z.string().nullable(), // ISO YYYY-MM-DD
  subtotal: z.number().nullable(),
  taxAmount: z.number().nullable(),
  tip: z.number().nullable(),
  total: z.number().nullable(),
  paymentMethod: z.string().nullable(),
  cardLast4: z.string().nullable(),
  currency: z.string().nullable(),
  lineItems: z.array(LineItemSchema),
  suggestedCategory: SuggestedCategoryEnum.nullable(),
  categoryConfidence: z.number().min(0).max(1).nullable(),
  confidence: z.number().min(0).max(1),
  flags: z.array(ReceiptFlagEnum),
  ocrTextExcerpt: z.string().nullable(),
});

// ── Receipt status ────────────────────────────────────────────────────────────
export const ReceiptStatusEnum = z.enum([
  "pending",
  "parsed",
  "failed",
  "reviewed",
]);

// ── Update receipt (user manual corrections) ──────────────────────────────────
export const UpdateReceiptSchema = z.object({
  vendor: z.string().nullable().optional(),
  vendorNormalized: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  subtotal: z.number().nullable().optional(),
  taxAmount: z.number().nullable().optional(),
  tip: z.number().nullable().optional(),
  total: z.number().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  cardLast4: z.string().nullable().optional(),
  currency: z.string().optional(),
  categoryId: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: ReceiptStatusEnum.optional(),
});

// ── Update line items ─────────────────────────────────────────────────────────
export const UpdateLineItemSchema = z.object({
  id: z.number().optional(), // existing items have id, new ones don't
  description: z.string(),
  quantity: z.number().nullable(),
  unitPrice: z.number().nullable(),
  totalPrice: z.number().nullable(),
});

export const UpdateReceiptWithItemsSchema = UpdateReceiptSchema.extend({
  lineItems: z.array(UpdateLineItemSchema).optional(),
});

// ── Receipt list filters ──────────────────────────────────────────────────────
export const ReceiptFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: ReceiptStatusEnum.optional(),
});

// ── Assign category ───────────────────────────────────────────────────────────
export const AssignCategorySchema = z.object({
  categoryId: z.number().int().positive(),
});

// ── Review item (deterministic, generated server-side) ────────────────────────
export const ReviewItemSchema = z.object({
  field: z.string(),
  message: z.string(),
  severity: z.enum(["low", "medium", "high"]),
});

// ── Duplicate warning (deterministic, generated server-side) ──────────────────
export const DuplicateWarningSchema = z.object({
  isDuplicate: z.boolean(),
  confidence: z.number(),
  matchReason: z.string().nullable(),
  matchedReceiptId: z.number().nullable(),
});
