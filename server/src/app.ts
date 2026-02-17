import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireAuth } from "./middleware/auth.js";
import authRoutes from "./routes/auth.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import receiptsRoutes from "./routes/receipts.routes.js";
import exportRoutes from "./routes/export.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(
  cors(
    env.NODE_ENV === "production" && env.CLIENT_URL
      ? { origin: env.CLIENT_URL, credentials: true }
      : {}
  )
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));

// ── Public Routes ─────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Protected Routes (require auth) ──────────────────────────────────────────
app.use("/api/categories", requireAuth, categoriesRoutes);
app.use("/api/receipts", requireAuth, receiptsRoutes);
app.use("/api/export", requireAuth, exportRoutes);

// ── Serve React frontend in production ───────────────────────────────────────
if (env.NODE_ENV === "production") {
  const clientDist = path.resolve(__dirname, "../../client/dist");
  app.use(express.static(clientDist));

  // All non-API routes → React's index.html (SPA client-side routing)
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// ── Error Handler (must be last) ──────────────────────────────────────────────
app.use(errorHandler);

export default app;
