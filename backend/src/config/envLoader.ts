import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

const backendRoot = path.resolve(__dirname, "..", "..");

function exists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function setIfMissing(key: string, value: string | undefined): void {
  if (value !== undefined && value !== "" && !process.env[key]) {
    process.env[key] = value;
  }
}

/**
 * New names (API_*, REDIS_URL) are normalized into legacy names the codebase expects.
 */
function applyAliases(): void {
  setIfMissing("PORT", process.env.API_PORT);
  setIfMissing("REDIS_URI", process.env.REDIS_URL);
  setIfMissing("BACKEND_URL", process.env.API_PUBLIC_URL);
  setIfMissing("FRONTEND_URL", process.env.API_FRONTEND_URL);
}

const REQUIRED_KEYS = [
  "PORT",
  "DB_HOST",
  "DB_USER",
  "DB_NAME",
  "FRONTEND_URL",
  "BACKEND_URL",
  "REDIS_URI"
] as const;

export function loadEnvFiles(): void {
  const nodeEnv = process.env.NODE_ENV || "development";
  const base = path.join(backendRoot, ".env");
  let specific: string;
  if (nodeEnv === "test") {
    specific = path.join(backendRoot, ".env.test");
  } else if (nodeEnv === "production") {
    specific = path.join(backendRoot, ".env.production");
  } else {
    specific = path.join(backendRoot, ".env.development");
  }

  if (exists(base)) {
    dotenv.config({ path: base, override: false });
    logger.debug("Loaded env file: .env");
  }
  if (exists(specific)) {
    dotenv.config({ path: specific, override: true });
    logger.debug(`Loaded env file: ${path.basename(specific)}`);
  }

  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = nodeEnv;
  }

  applyAliases();
}

export function validateEnv(): void {
  const missing: string[] = [];
  for (const key of REQUIRED_KEYS) {
    const v = process.env[key];
    if (v === undefined || v === "") {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    logger.error(
      `Missing required environment variables: ${missing.join(", ")}. See backend/.env.example`
    );
    process.exit(1);
  }
}
