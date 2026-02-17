import { useQuery } from "@tanstack/react-query";
import { listReceipts } from "../api/receipts.api.js";
import type { ReceiptFilter } from "@receipt/shared";

export function useReceipts(filters: Partial<ReceiptFilter> = {}) {
  return useQuery({
    queryKey: ["receipts", filters],
    queryFn: () => listReceipts(filters),
  });
}
