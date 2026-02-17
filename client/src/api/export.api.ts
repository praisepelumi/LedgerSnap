import apiClient from "./client.js";
import type { ExportRequest } from "@receipt/shared";

export async function exportReceipts(request: ExportRequest): Promise<void> {
  const response = await apiClient.post("/export", request, {
    responseType: "blob",
  });

  // Extract filename from Content-Disposition header
  const contentDisposition = response.headers["content-disposition"];
  let filename = "receipts-export.csv";
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
    if (match) filename = match[1];
  }

  // Trigger browser download
  const blob = new Blob([response.data], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
