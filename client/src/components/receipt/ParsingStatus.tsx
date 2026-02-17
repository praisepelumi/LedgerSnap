import { Spinner } from "../ui/Spinner.js";
import {
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface ParsingStatusProps {
  status: "idle" | "parsing" | "success" | "error";
  error?: string;
}

export function ParsingStatus({ status, error }: ParsingStatusProps) {
  if (status === "idle") return null;

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      {status === "parsing" && (
        <>
          <Spinner size="lg" />
          <div className="text-center">
            <p className="font-display text-lg text-ink-700">
              Analyzing receipt...
            </p>
            <p className="text-sm text-ink-400 mt-1">
              Extracting merchant, items, and totals
            </p>
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircleIcon className="w-12 h-12 text-receipt-success" />
          <p className="font-display text-lg text-receipt-success">
            Receipt parsed successfully
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <XCircleIcon className="w-12 h-12 text-receipt-danger" />
          <div className="text-center">
            <p className="font-display text-lg text-receipt-danger">
              Failed to parse receipt
            </p>
            {error && (
              <p className="text-sm text-ink-400 mt-1 max-w-sm">{error}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
