import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CameraIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useReceipts } from "../hooks/useReceipts";
import { useCategories } from "../hooks/useCategories";
import { ReceiptCard } from "../components/receipt/ReceiptCard";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import type { Receipt } from "@receipt/shared";

export default function ReceiptListPage() {
  // ── Filter state ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // ── Debounce search input ────────────────────────────────────────────────
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search]);

  // Reset page when filters change
  const handleFilterChange = useCallback(
    <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
      (value: T) => {
        setter(value);
        setPage(1);
      },
    []
  );

  // ── Data fetching ────────────────────────────────────────────────────────
  const { data, isLoading } = useReceipts({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    categoryId,
  });

  const { data: categories } = useCategories();

  const receipts = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const hasActiveFilters = dateFrom || dateTo || categoryId;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title font-display text-3xl text-ink-800">
          Receipts
        </h1>
        <Link
          to="/capture"
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <CameraIcon className="w-4 h-4" />
          Scan
        </Link>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
          <input
            type="text"
            className="input-field pl-9"
            placeholder="Search by vendor, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            btn-secondary flex items-center gap-1.5 text-sm shrink-0
            ${hasActiveFilters ? "ring-2 ring-receipt-stamp/30" : ""}
          `}
        >
          <FunnelIcon className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-receipt-stamp" />
          )}
        </button>
      </div>

      {/* Filter row */}
      {showFilters && (
        <div className="receipt-card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">From</label>
              <input
                type="date"
                className="input-field"
                value={dateFrom}
                onChange={(e) =>
                  handleFilterChange(setDateFrom)(e.target.value)
                }
              />
            </div>
            <div>
              <label className="label">To</label>
              <input
                type="date"
                className="input-field"
                value={dateTo}
                onChange={(e) =>
                  handleFilterChange(setDateTo)(e.target.value)
                }
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select
                className="input-field"
                value={categoryId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategoryId(val ? Number(val) : undefined);
                  setPage(1);
                }}
              >
                <option value="">All categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setCategoryId(undefined);
                setPage(1);
              }}
              className="text-xs text-receipt-stamp hover:text-receipt-stamp/80 font-medium transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Receipt list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : receipts.length === 0 ? (
        <EmptyState
          icon={<MagnifyingGlassIcon className="w-8 h-8 text-ink-300" />}
          title="No receipts found"
          description={
            debouncedSearch || hasActiveFilters
              ? "Try adjusting your search or filters."
              : "Scan your first receipt to get started."
          }
          action={
            !debouncedSearch && !hasActiveFilters ? (
              <Link to="/capture" className="btn-primary">
                Scan a Receipt
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {receipts.map((receipt: Receipt) => (
              <ReceiptCard key={receipt.id} receipt={receipt} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-receipt-line">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary flex items-center gap-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Previous
              </button>

              <span className="text-sm text-ink-400 font-mono">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn-secondary flex items-center gap-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Meta info */}
          {meta && (
            <p className="text-xs text-ink-300 text-center mt-3">
              Showing {receipts.length} of {meta.total} receipt
              {meta.total !== 1 ? "s" : ""}
            </p>
          )}
        </>
      )}
    </div>
  );
}
