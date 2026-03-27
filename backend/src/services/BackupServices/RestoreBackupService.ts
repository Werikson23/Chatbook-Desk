import fs from "fs";
import fsPromises from "fs/promises";
import { spawn } from "child_process";
import Backup from "../../models/Backup";
import BackupRestoreLog from "../../models/BackupRestoreLog";

interface Params {
  companyId: number;
  backupId: number;
  userId?: number;
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

const RestoreBackupService = async ({
  companyId,
  backupId,
  userId
}: Params): Promise<{ ok: boolean }> => {
  const backup = await Backup.findOne({ where: { id: backupId, companyId } });
  if (!backup || !backup.filePath) {
    throw new Error("ERR_BACKUP_NOT_FOUND");
  }
  if (!fs.existsSync(backup.filePath)) {
    throw new Error("ERR_BACKUP_FILE_NOT_FOUND");
  }

  const log = await BackupRestoreLog.create({
    companyId,
    backupId,
    executedByUserId: userId || null,
    status: "running",
    notes: "Restore iniciado"
  });

  try {
    const dbHost = process.env.DB_HOST || "127.0.0.1";
    const dbPort = process.env.DB_PORT || "5432";
    const dbName = process.env.DB_NAME || "ticketz";
    const dbUser = process.env.DB_USER || "ticketz";
    const dbPass = process.env.DB_PASS || "";

    const tmpDir = `${backup.filePath}.restore`;
    await fsPromises.mkdir(tmpDir, { recursive: true });
    await run("tar", ["-xzf", backup.filePath, "-C", tmpDir]);
    await run(
      "psql",
      [
        "--host",
        dbHost,
        "--port",
        dbPort,
        "--username",
        dbUser,
        "--dbname",
        dbName,
        "--set",
        "ON_ERROR_STOP=1",
        "--file",
        `${tmpDir}/data/database.sql`
      ],
      dbPass ? { PGPASSWORD: dbPass } : undefined
    );

    await log.update({
      status: "completed",
      notes: "Restore concluído"
    });
    return { ok: true };
  } catch (err) {
    await log.update({
      status: "failed",
      errorMessage: err instanceof Error ? err.message : String(err)
    });
    throw err;
  }
};

export default RestoreBackupService;
