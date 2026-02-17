import { z } from "zod";
import { ExportRequestSchema, ExportFormatEnum } from "../schemas/export.schema.js";

export type ExportRequest = z.infer<typeof ExportRequestSchema>;
export type ExportFormat = z.infer<typeof ExportFormatEnum>;
