import express from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import * as BackupController from "../controllers/BackupController";

const backupRoutes = express.Router();

backupRoutes.post("/backup/run", isAuth, isAdmin, BackupController.run);
backupRoutes.get("/backup/list", isAuth, isAdmin, BackupController.list);
backupRoutes.post("/backup/restore", isAuth, isAdmin, BackupController.restore);
backupRoutes.get(
  "/backup/download/:id",
  isAuth,
  isAdmin,
  BackupController.download
);
backupRoutes.delete("/backup/:id", isAuth, isAdmin, BackupController.remove);

export default backupRoutes;
