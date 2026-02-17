import { useMutation } from "@tanstack/react-query";
import { exportReceipts } from "../api/export.api.js";
import type { ExportRequest } from "@receipt/shared";

export function useExport() {
  return useMutation({
    mutationFn: (request: ExportRequest) => exportReceipts(request),
  });
}
