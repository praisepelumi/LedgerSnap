import { z } from "zod";
import {
  ParsedReceiptResponseSchema,
  UpdateReceiptSchema,
  UpdateReceiptWithItemsSchema,
  LineItemSchema,
  ReceiptFilterSchema,
  AssignCategorySchema,
  ReviewItemSchema,
  DuplicateWarningSchema,
  ReceiptStatusEnum,
  SuggestedCategoryEnum,
  ReceiptFlagEnum,
  MerchantSchema,
} from "../schemas/receipt.schema.js";

// Inferred types from Zod schemas
export type ParsedReceiptResponse = z.infer<typeof ParsedReceiptResponseSchema>;
export type UpdateReceipt = z.infer<typeof UpdateReceiptSchema>;
export type UpdateReceiptWithItems = z.infer<typeof UpdateReceiptWithItemsSchema>;
export type LineItem = z.infer<typeof LineItemSchema>;
export type ReceiptFilter = z.infer<typeof ReceiptFilterSchema>;
export type AssignCategory = z.infer<typeof AssignCategorySchema>;
export type ReviewItem = z.infer<typeof ReviewItemSchema>;
export type DuplicateWarning = z.infer<typeof DuplicateWarningSchema>;
export type ReceiptStatus = z.infer<typeof ReceiptStatusEnum>;
export type SuggestedCategory = z.infer<typeof SuggestedCategoryEnum>;
export type ReceiptFlag = z.infer<typeof ReceiptFlagEnum>;
export type Merchant = z.infer<typeof MerchantSchema>;

// Full receipt as stored in DB + returned by API
export interface Receipt {
  id: number;
  imageFilename: string;
  vendor: string | null;
  vendorNormalized: string | null;
  date: string | null;
  subtotal: number | null;
  taxAmount: number | null;
  tip: number | null;
  total: number | null;
  paymentMethod: string | null;
  cardLast4: string | null;
  currency: string;
  categoryId: number | null;
  suggestedCategory: string | null;
  categoryConfidence: number | null;
  confidence: number;
  flags: string[];
  ocrTextExcerpt: string | null;
  notes: string | null;
  rawAiResponse: string | null;
  status: ReceiptStatus;
  createdAt: string;
  updatedAt: string;
}

// Receipt with line items (for detail view)
export interface ReceiptWithItems extends Receipt {
  lineItems: LineItemRecord[];
}

// Line item as stored in DB
export interface LineItemRecord {
  id: number;
  receiptId: number;
  description: string;
  quantity: number | null;
  unitPrice: number | null;
  totalPrice: number | null;
  sortOrder: number;
}

// Parse endpoint response
export interface ParseReceiptResult {
  receipt: ReceiptWithItems;
  reviewItems: ReviewItem[];
  duplicateWarning: DuplicateWarning | null;
}
