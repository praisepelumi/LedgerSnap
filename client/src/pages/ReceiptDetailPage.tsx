import { useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useReceipt } from "../hooks/useReceipt";
import { useCategories } from "../hooks/useCategories";
import { updateReceipt, deleteReceipt } from "../api/receipts.api";
import { ReviewBanner } from "../components/receipt/ReviewBanner";
import { CategoryBadge } from "../components/category/CategoryBadge";
import { CategorySelect } from "../components/category/CategorySelect";
import { Spinner } from "../components/ui/Spinner";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import type { ReviewItem, ReceiptWithItems } from "@receipt/shared";

export default function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const receiptId = id ? Number(id) : null;
  const { data: receipt, isLoading } = useReceipt(receiptId);
  const { data: categories } = useCategories();

  // ── Edit mode state ──────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [tip, setTip] = useState("");
  const [total, setTotal] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [currency, setCurrency] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  // ── Enter edit mode ──────────────────────────────────────────────────────
  const startEditing = useCallback(() => {
    if (!receipt) return;
    setVendor(receipt.vendor ?? "");
    setDate(receipt.date ?? "");
    setSubtotal(receipt.subtotal != null ? String(receipt.subtotal) : "");
    setTaxAmount(receipt.taxAmount != null ? String(receipt.taxAmount) : "");
    setTip(receipt.tip != null ? String(receipt.tip) : "");
    setTotal(receipt.total != null ? String(receipt.total) : "");
    setPaymentMethod(receipt.paymentMethod ?? "");
    setCurrency(receipt.currency ?? "USD");
    setCategoryId(receipt.categoryId);
    setNotes(receipt.notes ?? "");
    setIsEditing(true);
  }, [receipt]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  // ── Save edits ───────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!receiptId) return;
    setIsSaving(true);

    try {
      await updateReceipt(receiptId, {
        vendor: vendor || null,
        date: date || null,
        subtotal: subtotal ? Number(subtotal) : null,
        taxAmount: taxAmount ? Number(taxAmount) : null,
        tip: tip ? Number(tip) : null,
        total: total ? Number(total) : null,
        paymentMethod: paymentMethod || null,
        currency: currency || "USD",
        categoryId,
        notes: notes || null,
        status: "reviewed",
      });

      await queryClient.invalidateQueries({ queryKey: ["receipt", receiptId] });
      await queryClient.invalidateQueries({ queryKey: ["receipts"] });
      setIsEditing(false);
      toast.success("Receipt updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, [
    receiptId,
    vendor,
    date,
    subtotal,
    taxAmount,
    tip,
    total,
    paymentMethod,
    currency,
    categoryId,
    notes,
    queryClient,
  ]);

  // ── Delete receipt ───────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!receiptId) return;
    setIsDeleting(true);

    try {
      await deleteReceipt(receiptId);
      await queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast.success("Receipt deleted");
      navigate("/receipts");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      toast.error(message);
      setIsDeleting(false);
    }
  }, [receiptId, queryClient, navigate]);

  // ── Build review items from flags ────────────────────────────────────────
  const reviewItems: ReviewItem[] = (receipt?.flags ?? []).map(
    (flag: string) => ({
      field: flag.replace(/_/g, " "),
      message: flagMessages[flag] ?? "Needs review",
      severity: flagSeverity(flag),
    })
  );

  // ── Loading / Not found ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-ink-500 mb-4">Receipt not found.</p>
        <Link to="/receipts" className="btn-secondary">
          Back to Receipts
        </Link>
      </div>
    );
  }

  const category = categories?.find((c) => c.id === receipt.categoryId);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/receipts"
          className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-600 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={cancelEditing}
                className="btn-secondary flex items-center gap-1.5 text-sm"
                disabled={isSaving}
              >
                <XMarkIcon className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex items-center gap-1.5 text-sm"
              >
                {isSaving ? (
                  <Spinner size="sm" />
                ) : (
                  <CheckIcon className="w-4 h-4" />
                )}
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEditing}
                className="btn-secondary flex items-center gap-1.5 text-sm"
              >
                <PencilIcon className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-danger flex items-center gap-1.5 text-sm"
              >
                {isDeleting ? (
                  <Spinner size="sm" />
                ) : (
                  <TrashIcon className="w-4 h-4" />
                )}
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Review banner */}
      {reviewItems.length > 0 && (
        <div className="mb-6">
          <ReviewBanner items={reviewItems} />
        </div>
      )}

      {/* Receipt image */}
      {receipt.imageFilename && (
        <div className="receipt-card overflow-hidden mb-6">
          <img
            src={`/uploads/${receipt.imageFilename}`}
            alt="Receipt"
            className="w-full max-h-80 object-contain bg-ink-50"
          />
        </div>
      )}

      {/* Receipt details */}
      <div className="receipt-card p-5 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-display text-2xl text-ink-800">
            {isEditing ? (
              <input
                type="text"
                className="input-field text-xl font-display"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Vendor name"
              />
            ) : (
              receipt.vendor || "Unknown Merchant"
            )}
          </h2>

          {!isEditing && category && (
            <CategoryBadge
              name={category.name}
              color={category.color}
              size="md"
            />
          )}
        </div>

        {/* Category edit */}
        {isEditing && (
          <div className="mb-4">
            <label className="label">Category</label>
            <CategorySelect
              value={categoryId}
              onChange={setCategoryId}
              suggestedCategory={receipt.suggestedCategory}
            />
          </div>
        )}

        {/* Fields grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <DetailField
            label="Date"
            value={formatDate(receipt.date)}
            isEditing={isEditing}
            editComponent={
              <input
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            }
          />
          <DetailField
            label="Currency"
            value={receipt.currency}
            isEditing={isEditing}
            editComponent={
              <input
                type="text"
                className="input-field"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="USD"
                maxLength={3}
              />
            }
          />
          <DetailField
            label="Subtotal"
            value={formatCurrency(receipt.subtotal, receipt.currency)}
            isEditing={isEditing}
            editComponent={
              <input
                type="number"
                step="0.01"
                className="input-field"
                value={subtotal}
                onChange={(e) => setSubtotal(e.target.value)}
                placeholder="0.00"
              />
            }
          />
          <DetailField
            label="Tax"
            value={formatCurrency(receipt.taxAmount, receipt.currency)}
            isEditing={isEditing}
            editComponent={
              <input
                type="number"
                step="0.01"
                className="input-field"
                value={taxAmount}
                onChange={(e) => setTaxAmount(e.target.value)}
                placeholder="0.00"
              />
            }
          />
          <DetailField
            label="Tip"
            value={formatCurrency(receipt.tip, receipt.currency)}
            isEditing={isEditing}
            editComponent={
              <input
                type="number"
                step="0.01"
                className="input-field"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                placeholder="0.00"
              />
            }
          />
          <DetailField
            label="Total"
            value={formatCurrency(receipt.total, receipt.currency)}
            isEditing={isEditing}
            editComponent={
              <input
                type="number"
                step="0.01"
                className="input-field font-medium"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="0.00"
              />
            }
            highlight
          />
          <DetailField
            label="Payment Method"
            value={
              receipt.paymentMethod
                ? `${receipt.paymentMethod}${receipt.cardLast4 ? ` ****${receipt.cardLast4}` : ""}`
                : null
            }
            isEditing={isEditing}
            editComponent={
              <input
                type="text"
                className="input-field"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="e.g. Visa, Cash"
              />
            }
          />
          <DetailField
            label="Status"
            value={
              <span
                className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                  statusColors[receipt.status] ?? "bg-ink-100 text-ink-600"
                }`}
              >
                {receipt.status}
              </span>
            }
          />
        </div>

        {/* Notes */}
        <div className="mt-6 pt-4 border-t border-receipt-line">
          <label className="label">Notes</label>
          {isEditing ? (
            <textarea
              className="input-field min-h-[80px] resize-y"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this receipt..."
            />
          ) : (
            <p className="text-sm text-ink-500">
              {receipt.notes || "No notes"}
            </p>
          )}
        </div>
      </div>

      {/* Line items table */}
      {receipt.lineItems && receipt.lineItems.length > 0 && (
        <div className="receipt-card p-5 mb-6">
          <h3 className="section-title font-display text-lg text-ink-700 mb-4">
            Line Items
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-receipt-line">
                  <th className="text-left py-2 pr-4 text-ink-400 font-medium">
                    Description
                  </th>
                  <th className="text-right py-2 px-4 text-ink-400 font-medium">
                    Qty
                  </th>
                  <th className="text-right py-2 px-4 text-ink-400 font-medium">
                    Unit Price
                  </th>
                  <th className="text-right py-2 pl-4 text-ink-400 font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {receipt.lineItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-receipt-line/50 last:border-0"
                  >
                    <td className="py-2.5 pr-4 text-ink-700">
                      {item.description}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-ink-500">
                      {item.quantity ?? "--"}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-ink-500">
                      {item.unitPrice != null
                        ? formatCurrency(item.unitPrice, receipt.currency)
                        : "--"}
                    </td>
                    <td className="py-2.5 pl-4 text-right font-mono font-medium text-ink-700">
                      {item.totalPrice != null
                        ? formatCurrency(item.totalPrice, receipt.currency)
                        : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confidence bar */}
      <div className="receipt-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-ink-400">OCR Confidence</span>
          <span className="text-xs font-mono text-ink-500">
            {Math.round(receipt.confidence * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              receipt.confidence >= 0.8
                ? "bg-receipt-success"
                : receipt.confidence >= 0.5
                  ? "bg-receipt-warning"
                  : "bg-receipt-danger"
            }`}
            style={{ width: `${Math.round(receipt.confidence * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Detail Field Component ─────────────────────────────────────────────────

interface DetailFieldProps {
  label: string;
  value?: React.ReactNode;
  isEditing?: boolean;
  editComponent?: React.ReactNode;
  highlight?: boolean;
}

function DetailField({
  label,
  value,
  isEditing,
  editComponent,
  highlight,
}: DetailFieldProps) {
  if (isEditing && editComponent) {
    return (
      <div>
        <label className="label">{label}</label>
        {editComponent}
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-ink-400 mb-0.5">{label}</p>
      <p
        className={`text-sm ${
          highlight ? "font-mono font-semibold text-ink-800" : "text-ink-600"
        }`}
      >
        {value ?? "--"}
      </p>
    </div>
  );
}

// ── Flag helpers ───────────────────────────────────────────────────────────

const flagMessages: Record<string, string> = {
  not_a_receipt: "This image may not be a receipt.",
  low_image_quality: "The image quality is low, which may affect accuracy.",
  merchant_missing: "The merchant name could not be determined.",
  date_missing: "The date could not be found on the receipt.",
  date_partial_or_ambiguous: "The date is ambiguous or partially readable.",
  total_missing: "The total amount could not be determined.",
  currency_missing: "The currency could not be identified.",
  multiple_totals_detected: "Multiple total amounts were found.",
  totals_inconsistent: "The subtotal, tax, and total do not add up.",
  tax_not_itemized: "Tax was not separately itemized on the receipt.",
  tip_possible_but_unclear: "A tip line was found but the amount is unclear.",
  handwritten_or_hard_to_read: "Parts of the receipt appear handwritten or hard to read.",
  foreign_language_detected: "The receipt appears to be in a foreign language.",
};

function flagSeverity(flag: string): "low" | "medium" | "high" {
  const highFlags = ["not_a_receipt", "total_missing", "totals_inconsistent"];
  const mediumFlags = [
    "low_image_quality",
    "merchant_missing",
    "date_missing",
    "multiple_totals_detected",
  ];
  if (highFlags.includes(flag)) return "high";
  if (mediumFlags.includes(flag)) return "medium";
  return "low";
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  parsed: "bg-blue-100 text-blue-800",
  reviewed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};
