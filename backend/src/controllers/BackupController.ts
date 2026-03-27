import { Request, Response } from "express";
import fs from "fs";
import AppError from "../errors/AppError";
import Backup from "../models/Backup";
import RunBackupService from "../services/BackupServices/RunBackupService";
import ListBackupsService from "../services/BackupServices/ListBackupsService";
import DeleteBackupService from "../services/BackupServices/DeleteBackupService";
import RestoreBackupService from "../services/BackupServices/RestoreBackupService";

const mapErr = (err: unknown): never => {
  const msg = err instanceof Error ? err.message : String(err);
  const friendly: Record<string, string> = {
    ERR_BACKUP_ALREADY_RUNNING:
      "Já existe backup em execução para esta empresa",
    ERR_BACKUP_NOT_FOUND: "Backup não encontrado",
    ERR_BACKUP_FILE_NOT_FOUND: "Arquivo de backup não encontrado"
  };
  if (friendly[msg]) {
    throw new AppError(friendly[msg], 400);
  }
  if (/pg_dump|tar\b|ENOENT/i.test(msg)) {
    throw new AppError(
      "Backup exige PostgreSQL client (pg_dump) e tar no PATH do servidor. Em Windows, instale as ferramentas de linha de comando ou rode o backup dentro do contêiner Linux.",
      400
    );
  }
  throw new AppError(msg, 400);
};

export const run = async (req: Request, res: Response): Promise<Response> => {
  try {
    const backup = await RunBackupService({
      companyId: req.user.companyId,
      userId: Number(req.user.id),
      type: req.body?.type || "full"
    });
    return res.status(201).json(backup);
  } catch (err) {
    mapErr(err);
  }
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const data = await ListBackupsService({
    companyId: req.user.companyId,
    pageNumber: String(req.query.pageNumber || "1")
  });
  return res.json(data);
};

export const download = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const row = await Backup.findOne({
      where: { id: Number(req.params.id), companyId: req.user.companyId }
    });
    if (!row?.filePath) {
      throw new Error("ERR_BACKUP_NOT_FOUND");
    }
    if (!fs.existsSync(row.filePath)) {
      throw new Error("ERR_BACKUP_FILE_NOT_FOUND");
    }
    res.download(row.filePath);
    return res;
  } catch (err) {
    mapErr(err);
  }
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await DeleteBackupService({
      companyId: req.user.companyId,
      backupId: Number(req.params.id)
    });
    return res.json({ ok: true });
  } catch (err) {
    mapErr(err);
  }
};

export const restore = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const out = await RestoreBackupService({
      companyId: req.user.companyId,
      backupId: Number(req.body?.backupId),
      userId: Number(req.user.id)
    });
    return res.json(out);
  } catch (err) {
    mapErr(err);
  }
};
