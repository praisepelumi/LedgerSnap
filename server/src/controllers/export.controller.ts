import { Request, Response, NextFunction } from "express";
import { generateCsv } from "../services/export.service.js";
import type { ExportRequest } from "@receipt/shared";

/**
 * POST /api/export
 * Generate CSV and send as file download
 */
export async function exportCsv(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const data = req.body as ExportRequest;

    const { csv, filename } = await generateCsv(data.format, {
      dateFrom: data.dateFrom,
      dateTo: data.dateTo,
      categoryIds: data.categoryIds,
      userId,
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}
