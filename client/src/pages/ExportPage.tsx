import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  BuildingOfficeIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useExport } from "../hooks/useExport";
import { useCategories } from "../hooks/useCategories";
import { Spinner } from "../components/ui/Spinner";
import type { ExportFormat } from "@receipt/shared";

interface FormatOption {
  id: ExportFormat;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: "generic",
    name: "Generic CSV",
    description:
      "Standard CSV with all fields. Compatible with Excel, Google Sheets, and most accounting tools.",
    icon: <TableCellsIcon className="w-6 h-6" />,
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description:
      "Formatted for QuickBooks import. Includes mapped account fields and tax categories.",
    icon: <BuildingOfficeIcon className="w-6 h-6" />,
  },
  {
    id: "xero",
    name: "Xero",
    description:
      "Formatted for Xero import. Includes contact names, invoice numbers, and tax-rate mappings.",
    icon: <DocumentTextIcon className="w-6 h-6" />,
  },
];

export default function ExportPage() {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("generic");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const exportMutation = useExport();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // ── Toggle category ──────────────────────────────────────────────────────
  const toggleCategory = useCallback((id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  }, []);

  // ── Select all / none ────────────────────────────────────────────────────
  const toggleAllCategories = useCallback(() => {
    if (!categories) return;
    if (selectedCategoryIds.length === categories.length) {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds(categories.map((c) => c.id));
    }
  }, [categories, selectedCategoryIds]);

  // ── Export ───────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    exportMutation.mutate(
      {
        format: selectedFormat,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        categoryIds:
          selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Export downloaded!");
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Export failed"
          );
        },
      }
    );
  }, [selectedFormat, dateFrom, dateTo, selectedCategoryIds, exportMutation]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      <h1 className="page-title font-display text-3xl text-ink-800 mb-2">
        Export Receipts
      </h1>
      <p className="text-sm text-ink-400 mb-8">
        Download your receipt data in your preferred format.
      </p>

      {/* ── Format selection ──────────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="section-title font-display text-lg text-ink-700 mb-4">
          Export Format
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FORMAT_OPTIONS.map((option) => (
            <FormatCard
              key={option.id}
              option={option}
              isSelected={selectedFormat === option.id}
              onSelect={() => setSelectedFormat(option.id)}
            />
          ))}
        </div>
      </section>

      {/* ── Date range filter ─────────────────────────────────────────── */}
      <section className="receipt-card p-5 mb-6">
        <h2 className="section-title font-display text-lg text-ink-700 mb-4">
          Date Range
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">From</label>
            <input
              type="date"
              className="input-field"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="label">To</label>
            <input
              type="date"
              className="input-field"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
        {!dateFrom && !dateTo && (
          <p className="text-xs text-ink-300 mt-2">
            Leave empty to export all receipts.
          </p>
        )}
      </section>

      {/* ── Category filter ───────────────────────────────────────────── */}
      <section className="receipt-card p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title font-display text-lg text-ink-700">
            Categories
          </h2>
          {categories && categories.length > 0 && (
            <button
              onClick={toggleAllCategories}
              className="text-xs font-medium text-receipt-stamp hover:text-receipt-stamp/80 transition-colors"
            >
              {selectedCategoryIds.length === categories.length
                ? "Deselect all"
                : "Select all"}
            </button>
          )}
        </div>

        {categoriesLoading ? (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        ) : !categories || categories.length === 0 ? (
          <p className="text-sm text-ink-400">No categories available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.map((cat) => {
              const isChecked = selectedCategoryIds.includes(cat.id);
              return (
                <label
                  key={cat.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                    ${
                      isChecked
                        ? "bg-receipt-cream border border-receipt-line"
                        : "bg-transparent border border-transparent hover:bg-ink-50"
                    }
                  `}
                >
                  <div
                    className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                      ${
                        isChecked
                          ? "bg-receipt-stamp border-receipt-stamp"
                          : "border-ink-300"
                      }
                    `}
                  >
                    {isChecked && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm text-ink-600">{cat.name}</span>
                </label>
              );
            })}
          </div>
        )}
        {selectedCategoryIds.length === 0 && categories && categories.length > 0 && (
          <p className="text-xs text-ink-300 mt-3">
            Leave all unchecked to include every category.
          </p>
        )}
      </section>

      {/* ── Export button ─────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className="btn-primary flex items-center gap-2 px-8 py-3 text-base disabled:opacity-50"
        >
          {exportMutation.isPending ? (
            <>
              <Spinner size="sm" />
              Generating...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="w-5 h-5" />
              Export
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Format Card ──────────────────────────────────────────────────────────────

interface FormatCardProps {
  option: FormatOption;
  isSelected: boolean;
  onSelect: () => void;
}

function FormatCard({ option, isSelected, onSelect }: FormatCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        receipt-card p-4 text-left transition-all
        ${
          isSelected
            ? "ring-2 ring-receipt-stamp border-receipt-stamp/30"
            : "hover:shadow-receipt-hover"
        }
      `}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isSelected
              ? "bg-receipt-stamp/10 text-receipt-stamp"
              : "bg-ink-100 text-ink-400"
          }`}
        >
          {option.icon}
        </div>
        {isSelected && (
          <div className="ml-auto w-5 h-5 rounded-full bg-receipt-stamp flex items-center justify-center">
            <CheckIcon className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <h3 className="font-medium text-ink-700 text-sm mb-1">{option.name}</h3>
      <p className="text-xs text-ink-400 leading-relaxed">
        {option.description}
      </p>
    </button>
  );
}
