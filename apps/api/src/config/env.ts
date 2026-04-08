import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const rootEnvPath = path.resolve(process.cwd(), "../../.env");
const localEnvPath = path.resolve(process.cwd(), ".env");

if (existsSync(rootEnvPath)) {
  loadEnv({ path: rootEnvPath });
} else if (existsSync(localEnvPath)) {
  loadEnv({ path: localEnvPath });
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID_MONTHLY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_API_URL: z.string().default("http://localhost:4000/api"),
  FILE_TTL_MINUTES: z.coerce.number().default(30),
  TEMP_STORAGE_DIR: z.string().default("./apps/api/uploads"),
  SUPPORT_EMAIL: z.string().email().default("support@quickconvert.app")
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  tempStorageDir: path.resolve(process.cwd(), parsed.TEMP_STORAGE_DIR)
};
