import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import * as receiptService from "../services/receipt.service.js";
import { parseReceiptImageRaw } from "../services/parser.service.js";
import { checkDuplicate } from "../services/duplicate.service.js";
import { generateReviewItems } from "../services/validation.service.js";
import * as api from "../utils/apiResponse.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { AppError } from "../middleware/errorHandler.js";
import type { ReceiptFilter, UpdateReceipt } from "@receipt/shared";

/**
 * POST /api/receipts/parse
 * Upload image → AI parse → duplicate check → validate → store → respond
 */
export async function parse(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;

    if (!req.file) {
      throw new AppError("NO_FILE", "No image file uploaded", 400);
    }

    const file = req.file;
    const mimeType = file.mimetype as "image/jpeg" | "image/png" | "image/webp";

    // Save image to disk with UUID filename
    const ext = mimeType === "image/png" ? ".png" : mimeType === "image/webp" ? ".webp" : ".jpg";
    const filename = `${uuidv4()}${ext}`;
    const uploadDir = path.resolve(env.UPLOAD_DIR);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);

    logger.info(`Image saved: ${filename} (${(file.size / 1024).toFixed(1)}KB)`);

    // Parse with Claude
    const { parsed, rawJson } = await parseReceiptImageRaw(file.buffer, mimeType);

    // Store in database
    const receipt = await receiptService.createFromParsed(filename, parsed, rawJson, userId);

    // Check for duplicates
    const recentReceipts = await receiptService.getRecentForDuplicateCheck(userId);
    const duplicateWarning = checkDuplicate(
      {
        vendorNormalized: parsed.merchant?.normalized_name ?? null,
        total: parsed.total,
        date: parsed.date,
        cardLast4: parsed.cardLast4,
      },
      recentReceipts.filter((r) => r.id !== receipt.id)
    );

    // Generate review items
    const reviewItems = generateReviewItems(parsed);

    api.success(
      res,
      {
        receipt,
        reviewItems,
        duplicateWarning: duplicateWarning.isDuplicate ? duplicateWarning : null,
      },
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/receipts
 */
export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const filters = req.query as unknown as ReceiptFilter;
    const { data, total } = await receiptService.list(filters, userId);
    api.paginated(res, data, filters.page, filters.limit, total);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/receipts/:id
 */
export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    const receipt = await receiptService.getById(id, userId);
    if (!receipt) {
      throw new AppError("NOT_FOUND", `Receipt ${id} not found`, 404);
    }
    api.success(res, receipt);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/receipts/:id
 */
export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    const data = req.body as UpdateReceipt;
    const receipt = await receiptService.update(id, data, userId);
    api.success(res, receipt);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/receipts/:id
 */
export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);

    // Also delete the image file
    const receipt = await receiptService.getById(id, userId);
    if (receipt) {
      const filepath = path.join(path.resolve(env.UPLOAD_DIR), receipt.imageFilename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    await receiptService.remove(id, userId);
    api.success(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/receipts/:id/category
 */
export async function assignCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    const { categoryId } = req.body as { categoryId: number };
    const receipt = await receiptService.update(id, { categoryId }, userId);
    api.success(res, receipt);
  } catch (err) {
    next(err);
  }
}
