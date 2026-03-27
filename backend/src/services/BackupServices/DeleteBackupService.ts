import fs from "fs/promises";
import fsSync from "fs";
import Backup from "../../models/Backup";

interface Params {
  companyId: number;
  backupId: number;
}

const DeleteBackupService = async ({
  companyId,
  backupId
}: Params): Promise<{ ok: boolean }> => {
  const row = await Backup.findOne({ where: { id: backupId, companyId } });
  if (!row) {
    throw new Error("ERR_BACKUP_NOT_FOUND");
  }
  if (row.filePath && fsSync.existsSync(row.filePath)) {
    await fs.unlink(row.filePath);
  }
  await row.destroy();
  return { ok: true };
};

export default DeleteBackupService;
