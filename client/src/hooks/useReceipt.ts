import { useQuery } from "@tanstack/react-query";
import { getReceipt } from "../api/receipts.api.js";

export function useReceipt(id: number | null) {
  return useQuery({
    queryKey: ["receipt", id],
    queryFn: () => getReceipt(id!),
    enabled: id != null,
  });
}
