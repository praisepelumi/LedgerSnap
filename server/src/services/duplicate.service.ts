import type { DuplicateWarning } from "@receipt/shared";

interface ReceiptForComparison {
  id: number;
  vendorNormalized: string | null;
  total: number | null;
  date: string | null;
  cardLast4: string | null;
}

/**
 * Check if a newly parsed receipt is a likely duplicate of an existing one.
 * Uses deterministic signal matching — no LLM call needed.
 * Requires 2+ matching signals to flag as duplicate.
 */
export function checkDuplicate(
  newReceipt: Omit<ReceiptForComparison, "id">,
  existingReceipts: ReceiptForComparison[]
): DuplicateWarning {
  for (const existing of existingReceipts) {
    let signals = 0;
    const reasons: string[] = [];

    // Signal 1: Same normalized merchant name
    if (
      existing.vendorNormalized &&
      newReceipt.vendorNormalized &&
      existing.vendorNormalized === newReceipt.vendorNormalized
    ) {
      signals++;
      reasons.push("same merchant");
    }

    // Signal 2: Same total (within 1%)
    if (
      existing.total != null &&
      newReceipt.total != null &&
      existing.total > 0 &&
      Math.abs(existing.total - newReceipt.total) / existing.total < 0.01
    ) {
      signals++;
      reasons.push("same total");
    }

    // Signal 3: Same or adjacent date (±1 day)
    if (existing.date && newReceipt.date) {
      const existingMs = Date.parse(existing.date);
      const newMs = Date.parse(newReceipt.date);
      if (!isNaN(existingMs) && !isNaN(newMs)) {
        const daysDiff = Math.abs(existingMs - newMs) / 86_400_000;
        if (daysDiff <= 1) {
          signals++;
          reasons.push("same/adjacent date");
        }
      }
    }

    // Signal 4: Same card last 4 digits
    if (
      existing.cardLast4 &&
      newReceipt.cardLast4 &&
      existing.cardLast4 === newReceipt.cardLast4
    ) {
      signals++;
      reasons.push("same card");
    }

    // Require 2+ strong signals to flag as duplicate
    if (signals >= 2) {
      return {
        isDuplicate: true,
        confidence: Math.min(signals / 4, 1.0),
        matchReason: reasons.join(" + "),
        matchedReceiptId: existing.id,
      };
    }
  }

  return {
    isDuplicate: false,
    confidence: 0,
    matchReason: null,
    matchedReceiptId: null,
  };
}
