import { config } from "dotenv";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from server directory
config({ path: path.resolve(__dirname, "../../.env") });

const EnvSchema = z.object({
  ANTHROPIC_API_KEY: z.string().default(""),
  GOOGLE_CLIENT_ID: z.string().default(""),
  JWT_SECRET: z.string().default("dev-secret-change-in-production"),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_PATH: z.string().default("./data/receipts.db"),
  UPLOAD_DIR: z.string().default("./uploads"),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
