import { db } from "../db/connection.js";
import { receipts, categories } from "../db/schema.js";
import { eq, and, gte, lte, inArray, sql } from "drizzle-orm";
import type { ExportFormat } from "@receipt/shared";

interface ExportFilters {
  dateFrom?: string;
  dateTo?: string;
  categoryIds?: number[];
  userId: number;
}

interface ExportRow {
  id: number;
  vendor: string | null;
  date: string | null;
  subtotal: number | null;
  taxAmount: number | null;
  tip: number | null;
  total: number | null;
  paymentMethod: string | null;
  currency: string;
  categoryName: string | null;
}

/**
 * Generate CSV content for receipts in the specified format.
 */
export async function generateCsv(
  format: ExportFormat,
  filters: ExportFilters,
): Promise<{ csv: string; filename: string }> {
  const rows = await getExportData(filters);

  let csv: string;
  switch (format) {
    case "generic":
      csv = generateGenericCsv(rows);
      break;
    case "quickbooks":
      csv = generateQuickBooksCsv(rows);
      break;
    case "xero":
      csv = generateXeroCsv(rows);
      break;
    default:
      csv = generateGenericCsv(rows);
  }

  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `receipts-${format}-${dateStr}.csv`;

  return { csv, filename };
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getExportData(filters: ExportFilters): Promise<ExportRow[]> {
  const conditions = [
    sql`${receipts.status} IN ('parsed', 'reviewed')`,
    eq(receipts.userId, filters.userId),
  ];

  if (filters.dateFrom) {
    conditions.push(gte(receipts.date, filters.dateFrom));
  }
  if (filters.dateTo) {
    conditions.push(lte(receipts.date, filters.dateTo));
  }
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    conditions.push(inArray(receipts.categoryId, filters.categoryIds));
  }

  const rows = db
    .select({
      id: receipts.id,
      vendor: receipts.vendor,
      date: receipts.date,
      subtotal: receipts.subtotal,
      taxAmount: receipts.taxAmount,
      tip: receipts.tip,
      total: receipts.total,
      paymentMethod: receipts.paymentMethod,
      currency: receipts.currency,
      categoryName: categories.name,
    })
    .from(receipts)
    .leftJoin(categories, eq(receipts.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(receipts.date)
    .all();

  return rows;
}

// ── CSV formatters ────────────────────────────────────────────────────────────

function generateGenericCsv(rows: ExportRow[]): string {
  const headers = [
    "Date",
    "Vendor",
    "Category",
    "Subtotal",
    "Tax",
    "Tip",
    "Total",
    "Currency",
    "Payment Method",
  ];

  const lines = rows.map((row) =>
    [
      csvEscape(row.date ?? ""),
      csvEscape(row.vendor ?? ""),
      csvEscape(row.categoryName ?? ""),
      row.subtotal?.toFixed(2) ?? "",
      row.taxAmount?.toFixed(2) ?? "",
      row.tip?.toFixed(2) ?? "",
      row.total?.toFixed(2) ?? "",
      row.currency,
      csvEscape(row.paymentMethod ?? ""),
    ].join(",")
  );

  return [headers.join(","), ...lines].join("\n");
}

function generateQuickBooksCsv(rows: ExportRow[]): string {
  // QuickBooks simple import: Date, Description, Amount
  // Expenses are negative amounts
  const headers = ["Date", "Description", "Amount"];

  const lines = rows.map((row) => {
    // QuickBooks expects MM/DD/YYYY
    const formattedDate = row.date ? formatDateMMDDYYYY(row.date) : "";
    const description = row.vendor ?? "Unknown";
    const amount = row.total != null ? (-row.total).toFixed(2) : "";

    return [csvEscape(formattedDate), csvEscape(description), amount].join(",");
  });

  return [headers.join(","), ...lines].join("\n");
}

function generateXeroCsv(rows: ExportRow[]): string {
  // Xero bank statement import
  const headers = ["Date", "Amount", "Payee", "Description", "Reference"];

  const lines = rows.map((row) => {
    const formattedDate = row.date ? formatDateDD_MM_YYYY(row.date) : "";
    const amount = row.total?.toFixed(2) ?? "";
    const payee = row.vendor ?? "";
    const description = row.categoryName ?? "";
    const reference = `REC-${row.id}`;

    return [
      csvEscape(formattedDate),
      amount,
      csvEscape(payee),
      csvEscape(description),
      csvEscape(reference),
    ].join(",");
  });

  return [headers.join(","), ...lines].join("\n");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDateMMDDYYYY(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${month}/${day}/${year}`;
}

function formatDateDD_MM_YYYY(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}
