import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parseReceipt } from "../api/receipts.api.js";

export function useParseReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageFile: File) => parseReceipt(imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
    },
  });
}
