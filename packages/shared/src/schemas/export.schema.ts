import { z } from "zod";

export const ExportFormatEnum = z.enum(["generic", "quickbooks", "xero"]);

export const ExportRequestSchema = z.object({
  format: ExportFormatEnum,
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  categoryIds: z.array(z.number().int().positive()).optional(),
});
