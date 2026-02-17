import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { sqlite } from "./db/connection.js";

// ── Initialize database tables ────────────────────────────────────────────────
import { sql } from "drizzle-orm";
import { db } from "./db/connection.js";

function initializeDatabase() {
  // Users table (new for auth)
  db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_id TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      picture TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Categories table (with user_id)
  db.run(sql`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#6B7280',
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, name)
    )
  `);

  // Receipts table (with user_id)
  db.run(sql`
    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      image_filename TEXT NOT NULL,
      vendor TEXT,
      vendor_normalized TEXT,
      date TEXT,
      subtotal REAL,
      tax_amount REAL,
      tip REAL,
      total REAL,
      payment_method TEXT,
      card_last4 TEXT,
      currency TEXT NOT NULL DEFAULT 'USD',
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      suggested_category TEXT,
      category_confidence REAL,
      confidence REAL NOT NULL DEFAULT 0,
      flags TEXT NOT NULL DEFAULT '[]',
      ocr_text_excerpt TEXT,
      notes TEXT,
      raw_ai_response TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'parsed', 'failed', 'reviewed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS line_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_id INTEGER NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      quantity REAL,
      unit_price REAL,
      total_price REAL,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  logger.info("Database tables initialized");
}

// ── Start server ──────────────────────────────────────────────────────────────
initializeDatabase();

app.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info("Shutting down...");
  sqlite.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Shutting down...");
  sqlite.close();
  process.exit(0);
});
