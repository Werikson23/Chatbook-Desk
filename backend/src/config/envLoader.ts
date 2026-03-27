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

/**
 * `env/development.ports.json` na raiz do monorepo — fonte única de portas em dev.
 * Aplica-se após `.env*` para alinhar API + CORS ao frontend sem editar vários arquivos.
 */
function applyDevelopmentPortsFromMonorepo(): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  const portsPath = path.join(
    backendRoot,
    "..",
    "env",
    "development.ports.json"
  );
  if (!exists(portsPath)) {
    return;
  }
  try {
    const data = JSON.parse(fs.readFileSync(portsPath, "utf8")) as {
      frontend?: number;
      backend?: number;
      lanHost?: string;
    };
    const be = Number(data.backend);
    if (Number.isFinite(be)) {
      process.env.PORT = String(be);
      process.env.API_PORT = String(be);
    }
    const fe = Number(data.frontend);
    if (Number.isFinite(fe)) {
      const lan =
        typeof data.lanHost === "string" && data.lanHost.trim().length > 0
          ? data.lanHost.trim()
          : "";
      const customUrls = [`http://localhost:${fe}`, `http://127.0.0.1:${fe}`];
      if (lan) {
        customUrls.push(`http://${lan}:${fe}`);
      }
      process.env.FRONTEND_CUSTOM_URL = customUrls.join(",");
      process.env.FRONTEND_URL_REGEX = `^http://[^:]+:${fe}$`;
      const primary = lan ? `http://${lan}:${fe}` : `http://localhost:${fe}`;
      process.env.API_FRONTEND_URL = primary;
      process.env.FRONTEND_URL = primary;
    }
    logger.debug(
      `Applied monorepo development ports from ${path.basename(portsPath)}`
    );
  } catch (err) {
    logger.warn({ err }, `Could not apply ${portsPath}`);
  }
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
  applyDevelopmentPortsFromMonorepo();
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
