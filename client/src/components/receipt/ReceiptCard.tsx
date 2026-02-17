import { Link } from "react-router-dom";
import {
  DocumentTextIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { formatDate } from "../../utils/formatDate.js";
import type { Receipt } from "@receipt/shared";

interface ReceiptCardProps {
  receipt: Receipt;
}

export function ReceiptCard({ receipt }: ReceiptCardProps) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    parsed: "bg-blue-100 text-blue-800",
    reviewed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };

  return (
    <Link to={`/receipts/${receipt.id}`} className="receipt-card block p-4">
      <div className="flex items-center gap-3">
        {/* Receipt image thumbnail */}
        <div className="w-12 h-12 rounded-lg bg-ink-100 flex items-center justify-center overflow-hidden shrink-0">
          {receipt.imageFilename ? (
            <img
              src={`/uploads/${receipt.imageFilename}`}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <DocumentTextIcon className="w-6 h-6 text-ink-300" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-ink-800 truncate">
              {receipt.vendor || "Unknown Merchant"}
            </h3>
            <span
              className={`shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                statusColors[receipt.status]
              }`}
            >
              {receipt.status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-sm text-ink-400">
              {formatDate(receipt.date)}
            </span>
            {receipt.confidence < 0.6 && (
              <span className="text-[10px] text-amber-600 font-medium">
                Low confidence
              </span>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <p className="font-mono font-medium text-ink-800">
            {formatCurrency(receipt.total, receipt.currency)}
          </p>
        </div>

        <ChevronRightIcon className="w-4 h-4 text-ink-300 shrink-0" />
      </div>
    </Link>
  );
}
