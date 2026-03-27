import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { spawn } from "child_process";
import crypto from "crypto";
import Backup from "../../models/Backup";
import uploadConfig from "../../config/upload";
import privateFilesConfig from "../../config/privateFiles";

interface Params {
  companyId: number;
  userId?: number;
  type?: "full" | "incremental" | "differential" | "snapshot";
}

const run = (command: string, args: string[], env?: Record<string, string>) =>
  new Promise<void>((resolve, reject) => {
    const p = spawn(command, args, { env: { ...process.env, ...(env || {}) } });
    let stderr = "";
    p.stderr.on("data", d => {
      stderr += String(d);
    });
    p.on("error", reject);
    p.on("close", code => {
      if (code === 0) return resolve();
      reject(new Error(`${command} failed (${code}): ${stderr}`));
    });
  });

const sha256File = (filePath: string) =>
  new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fsSync.createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", chunk => {
      const normalized =
        typeof chunk === "string" ? chunk : Uint8Array.from(chunk as Buffer);
      hash.update(normalized);
    });
    stream.on("end", () => resolve(hash.digest("hex")));
  });

const RunBackupService = async ({
  companyId,
  userId,
  type = "full"
}: Params): Promise<Backup> => {
  const backup = await Backup.create({
    companyId,
    triggeredByUserId: userId || null,
    type,
    status: "running",
    startedAt: new Date()
  });

  const backupRoot =
    process.env.BACKUP_DIRECTORY || path.resolve(process.cwd(), "backups");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const workDir = path.join(
    backupRoot,
    "tmp",
    `${companyId}-${backup.id}-${stamp}`
  );
  const payloadDir = path.join(workDir, "payload");
  const dataDir = path.join(payloadDir, "data");
  const outDir = path.join(
    backupRoot,
    String(new Date().getUTCFullYear()),
    String(new Date().getUTCMonth() + 1).padStart(2, "0"),
    String(new Date().getUTCDate()).padStart(2, "0")
  );

  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(outDir, { recursive: true });

    const dbHost = process.env.DB_HOST || "127.0.0.1";
    const dbPort = process.env.DB_PORT || "5432";
    const dbName = process.env.DB_NAME || "ticketz";
    const dbUser = process.env.DB_USER || "ticketz";
    const dbPass = process.env.DB_PASS || "";
    const dumpFile = path.join(dataDir, "database.sql");
    await run(
      "pg_dump",
      [
        "--format=plain",
        "--no-owner",
        "--no-privileges",
        "--host",
        dbHost,
        "--port",
        dbPort,
        "--username",
        dbUser,
        "--dbname",
        dbName,
        "--file",
        dumpFile
      ],
      dbPass ? { PGPASSWORD: dbPass } : undefined
    );

    if (fsSync.existsSync(uploadConfig.directory)) {
      await fs.cp(uploadConfig.directory, path.join(dataDir, "public"), {
        recursive: true
      });
    }
    if (fsSync.existsSync(privateFilesConfig.directory)) {
      await fs.cp(privateFilesConfig.directory, path.join(dataDir, "private"), {
        recursive: true
      });
    }

    const archive = path.join(
      outDir,
      `backup-${companyId}-${backup.id}-${stamp}.tar.gz`
    );
    await run("tar", ["-czf", archive, "-C", payloadDir, "."]);

    const stat = await fs.stat(archive);
    const checksum = await sha256File(archive);
    await backup.update({
      status: "completed",
      filePath: archive,
      sizeBytes: stat.size,
      checksum,
      finishedAt: new Date()
    });

    return backup;
  } catch (err) {
    await backup.update({
      status: "failed",
      errorMessage: err instanceof Error ? err.message : String(err),
      finishedAt: new Date()
    });
    throw err;
  } finally {
    if (fsSync.existsSync(workDir)) {
      await fs.rm(workDir, { recursive: true, force: true });
    }
  }
};

export default RunBackupService;
