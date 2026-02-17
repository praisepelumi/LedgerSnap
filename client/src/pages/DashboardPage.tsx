import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  TagIcon,
  CameraIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  format,
} from "date-fns";
import { useReceipts } from "../hooks/useReceipts";
import { ReceiptCard } from "../components/receipt/ReceiptCard";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { formatCurrency } from "../utils/formatCurrency";
import type { Receipt } from "@receipt/shared";

export default function DashboardPage() {
  // Month filter state: null = "All Time", Date = first day of selected month
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(
    startOfMonth(new Date())
  );

  // Compute dateFrom / dateTo for the selected month
  const dateFilters = useMemo(() => {
    if (!selectedMonth) return { dateFrom: undefined, dateTo: undefined };
    return {
      dateFrom: format(selectedMonth, "yyyy-MM-dd"),
      dateTo: format(endOfMonth(selectedMonth), "yyyy-MM-dd"),
    };
  }, [selectedMonth]);

  const { data, isLoading } = useReceipts({
    limit: 100,
    dateFrom: dateFilters.dateFrom,
    dateTo: dateFilters.dateTo,
  });

  const receipts = data?.data ?? [];

  const stats = useMemo(() => {
    const count = receipts.length;
    const totalSpent = receipts.reduce(
      (sum: number, r: Receipt) => sum + (r.total ?? 0),
      0
    );
    const categoryIds = new Set(
      receipts
        .map((r: Receipt) => r.categoryId)
        .filter((id): id is number => id != null)
    );
    return { count, totalSpent, categoriesUsed: categoryIds.size };
  }, [receipts]);

  const recentReceipts = receipts.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* Page title */}
      <h1 className="page-title font-display text-3xl text-ink-800 mb-6">
        Dashboard
      </h1>

      {/* Month picker */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setSelectedMonth((prev) =>
                prev
                  ? subMonths(prev, 1)
                  : startOfMonth(subMonths(new Date(), 1))
              )
            }
            className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          <span className="font-display text-lg text-ink-700 min-w-[10rem] text-center">
            {selectedMonth ? format(selectedMonth, "MMMM yyyy") : "All Time"}
          </span>

          <button
            onClick={() =>
              setSelectedMonth((prev) =>
                prev
                  ? addMonths(prev, 1)
                  : startOfMonth(addMonths(new Date(), 1))
              )
            }
            className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() =>
            setSelectedMonth((prev) =>
              prev === null ? startOfMonth(new Date()) : null
            )
          }
          className="text-sm font-medium text-receipt-stamp hover:text-receipt-stamp/80 transition-colors"
        >
          {selectedMonth ? "Show All Time" : "Show Current Month"}
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard
          icon={<DocumentTextIcon className="w-6 h-6 text-receipt-stamp" />}
          label={
            selectedMonth
              ? `Receipts in ${format(selectedMonth, "MMM yyyy")}`
              : "Total Receipts"
          }
          value={String(stats.count)}
        />
        <StatCard
          icon={
            <CurrencyDollarIcon className="w-6 h-6 text-receipt-success" />
          }
          label={
            selectedMonth
              ? `Spent in ${format(selectedMonth, "MMM yyyy")}`
              : "Total Spent"
          }
          value={formatCurrency(stats.totalSpent)}
        />
        <StatCard
          icon={<TagIcon className="w-6 h-6 text-receipt-highlight" />}
          label="Categories Used"
          value={String(stats.categoriesUsed)}
        />
      </div>

      {/* Recent receipts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title font-display text-xl text-ink-700">
            {selectedMonth ? "Receipts" : "Recent Receipts"}
          </h2>
          {receipts.length > 0 && (
            <Link
              to="/receipts"
              className="text-sm font-medium text-receipt-stamp hover:text-receipt-stamp/80 transition-colors"
            >
              View all
            </Link>
          )}
        </div>

        {recentReceipts.length === 0 ? (
          <EmptyState
            icon={<CameraIcon className="w-8 h-8 text-ink-300" />}
            title={
              selectedMonth
                ? `No receipts in ${format(selectedMonth, "MMMM yyyy")}`
                : "No receipts yet"
            }
            description={
              selectedMonth
                ? "Try selecting a different month or scan a new receipt."
                : "Scan your first receipt to start tracking expenses."
            }
            action={
              <Link to="/capture" className="btn-primary">
                Scan a Receipt
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {recentReceipts.map((receipt: Receipt) => (
              <ReceiptCard key={receipt.id} receipt={receipt} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="receipt-card p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-receipt-cream flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-sm text-ink-400 font-body">{label}</p>
      <p className="text-2xl font-display text-ink-800 mt-0.5">{value}</p>
    </div>
  );
}
