import apiClient from "./client.js";
import type {
  Receipt,
  ReceiptWithItems,
  ReceiptFilter,
  UpdateReceipt,
  ParseReceiptResult,
} from "@receipt/shared";

export async function parseReceipt(imageFile: File): Promise<ParseReceiptResult> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const { data } = await apiClient.post("/receipts/parse", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function listReceipts(
  filters: Partial<ReceiptFilter>
): Promise<{ data: Receipt[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
  const { data } = await apiClient.get("/receipts", { params: filters });
  return { data: data.data, meta: data.meta };
}

export async function getReceipt(id: number): Promise<ReceiptWithItems> {
  const { data } = await apiClient.get(`/receipts/${id}`);
  return data.data;
}

export async function updateReceipt(
  id: number,
  updates: UpdateReceipt
): Promise<Receipt> {
  const { data } = await apiClient.put(`/receipts/${id}`, updates);
  return data.data;
}

export async function deleteReceipt(id: number): Promise<void> {
  await apiClient.delete(`/receipts/${id}`);
}

export async function assignCategory(
  id: number,
  categoryId: number
): Promise<Receipt> {
  const { data } = await apiClient.put(`/receipts/${id}/category`, {
    categoryId,
  });
  return data.data;
}
