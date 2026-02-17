import type { ReviewItem, ParsedReceiptResponse } from "@receipt/shared";

/**
 * Generate human-readable review items based on AI flags and null fields.
 * Deterministic — no LLM call needed.
 * Returns items sorted by severity (high → medium → low).
 */
export function generateReviewItems(
  receipt: ParsedReceiptResponse
): ReviewItem[] {
  const items: ReviewItem[] = [];
  const flags = receipt.flags || [];

  // ── High severity — critical missing fields ──────────────────────────────
  if (!receipt.merchant?.name || flags.includes("merchant_missing")) {
    items.push({
      field: "merchant",
      message: "Merchant name could not be read",
      severity: "high",
    });
  }

  if (!receipt.date || flags.includes("date_missing")) {
    items.push({
      field: "date",
      message: "Date could not be extracted",
      severity: "high",
    });
  }

  if (receipt.total == null || flags.includes("total_missing")) {
    items.push({
      field: "total",
      message: "Total amount could not be determined",
      severity: "high",
    });
  }

  if (flags.includes("totals_inconsistent")) {
    items.push({
      field: "total",
      message:
        "Subtotal + tax does not match total — please verify the amounts",
      severity: "high",
    });
  }

  if (flags.includes("not_a_receipt")) {
    items.push({
      field: "image",
      message: "This image may not be a receipt or invoice",
      severity: "high",
    });
  }

  // ── Medium severity — usable but should check ───────────────────────────
  if (flags.includes("low_image_quality")) {
    items.push({
      field: "image",
      message: "Image quality is low — some fields may be inaccurate",
      severity: "medium",
    });
  }

  if (flags.includes("multiple_totals_detected")) {
    items.push({
      field: "total",
      message:
        "Multiple totals found — verify the correct one was selected",
      severity: "medium",
    });
  }

  if (flags.includes("date_partial_or_ambiguous")) {
    items.push({
      field: "date",
      message: "Date was partially readable — please confirm",
      severity: "medium",
    });
  }

  if (flags.includes("handwritten_or_hard_to_read")) {
    items.push({
      field: "image",
      message: "Handwritten or hard-to-read text detected",
      severity: "medium",
    });
  }

  if (flags.includes("foreign_language_detected")) {
    items.push({
      field: "merchant",
      message:
        "Foreign language detected — merchant name may need correction",
      severity: "medium",
    });
  }

  if (receipt.confidence < 0.6) {
    items.push({
      field: "overall",
      message: "Low overall confidence — review all fields carefully",
      severity: "medium",
    });
  }

  // ── Low severity — informational ────────────────────────────────────────
  if (flags.includes("currency_missing")) {
    items.push({
      field: "currency",
      message: "Currency not detected — defaulting to USD",
      severity: "low",
    });
  }

  if (flags.includes("tax_not_itemized")) {
    items.push({
      field: "tax",
      message: "Tax included in total but not itemized separately",
      severity: "low",
    });
  }

  if (flags.includes("tip_possible_but_unclear")) {
    items.push({
      field: "tip",
      message: "A tip may be included but could not be confirmed",
      severity: "low",
    });
  }

  // Sort: high → medium → low
  const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  items.sort((a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3));

  return items;
}
