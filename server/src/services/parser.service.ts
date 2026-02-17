import Anthropic from "@anthropic-ai/sdk";
import { ParsedReceiptResponseSchema } from "@receipt/shared";
import type { ParsedReceiptResponse } from "@receipt/shared";
import { env } from "../config/env.js";
import {
  RECEIPT_SYSTEM_PROMPT,
  RECEIPT_USER_PROMPT,
  RECEIPT_RETRY_PROMPT,
} from "../prompts/receipt-extraction.js";
import { logger } from "../utils/logger.js";
import { AppError } from "../middleware/errorHandler.js";

let _anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!env.ANTHROPIC_API_KEY) {
    throw new AppError(
      "MISSING_API_KEY",
      "ANTHROPIC_API_KEY is not set. Add it to server/.env",
      500
    );
  }
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

type ImageMediaType = "image/jpeg" | "image/png" | "image/webp";

/**
 * Parse a receipt image using Claude Haiku 3.5 Vision API.
 * Returns structured receipt data validated against the Zod schema.
 * Retries once on parse/validation failure.
 */
export async function parseReceiptImage(
  imageBuffer: Buffer,
  mimeType: ImageMediaType
): Promise<ParsedReceiptResponse> {
  const base64Image = imageBuffer.toString("base64");

  // First attempt
  let rawText = await callClaude(base64Image, mimeType, false);
  let result = tryParseAndValidate(rawText);

  if (result.success) {
    return result.data;
  }

  // Retry once with correction prompt
  logger.warn("First parse attempt failed, retrying...", {
    error: result.error,
  });

  rawText = await callClaude(base64Image, mimeType, true);
  result = tryParseAndValidate(rawText);

  if (result.success) {
    return result.data;
  }

  logger.error("Both parse attempts failed", { error: result.error });
  throw new AppError("AI_PARSE_FAILED", `Failed to parse receipt: ${result.error}`, 422);
}

/**
 * Get the raw AI response text (for storing in DB).
 */
export async function parseReceiptImageRaw(
  imageBuffer: Buffer,
  mimeType: ImageMediaType
): Promise<{ parsed: ParsedReceiptResponse; rawJson: string }> {
  const base64Image = imageBuffer.toString("base64");

  let rawText = await callClaude(base64Image, mimeType, false);
  let cleanJson = stripCodeFences(rawText);
  let result = tryParseAndValidate(rawText);

  if (result.success) {
    return { parsed: result.data, rawJson: cleanJson };
  }

  logger.warn("First parse attempt failed, retrying...", {
    error: result.error,
  });

  rawText = await callClaude(base64Image, mimeType, true);
  cleanJson = stripCodeFences(rawText);
  result = tryParseAndValidate(rawText);

  if (result.success) {
    return { parsed: result.data, rawJson: cleanJson };
  }

  logger.error("Both parse attempts failed", { error: result.error });
  throw new AppError("AI_PARSE_FAILED", `Failed to parse receipt: ${result.error}`, 422);
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function callClaude(
  base64Image: string,
  mimeType: ImageMediaType,
  isRetry: boolean
): Promise<string> {
  const userContent: Anthropic.MessageCreateParams["messages"][0]["content"] = [
    {
      type: "image",
      source: {
        type: "base64",
        media_type: mimeType,
        data: base64Image,
      },
    },
    {
      type: "text",
      text: isRetry
        ? `${RECEIPT_USER_PROMPT}\n\n${RECEIPT_RETRY_PROMPT}`
        : `${RECEIPT_USER_PROMPT}\n\nThe receipt is provided as base64-encoded image data. Do not echo the base64.`,
    },
  ];

  const response = await getAnthropicClient().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system: RECEIPT_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: userContent,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new AppError("AI_NO_RESPONSE", "No text response from AI", 502);
  }

  return textBlock.text;
}

function stripCodeFences(text: string): string {
  return text.replace(/```(?:json)?\n?/g, "").replace(/\n?```$/g, "").trim();
}

function tryParseAndValidate(rawText: string):
  | { success: true; data: ParsedReceiptResponse }
  | { success: false; error: string } {
  try {
    const cleanJson = stripCodeFences(rawText);
    const parsed = JSON.parse(cleanJson);
    const validated = ParsedReceiptResponseSchema.parse(parsed);
    return { success: true, data: validated };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
