import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";
import Backup from "./Backup";

@Table
class BackupRestoreLog extends Model<BackupRestoreLog> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Backup)
  @AllowNull(false)
  @Column
  backupId: number;

  @BelongsTo(() => Backup)
  backup: Backup;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => User)
  @Column
  executedByUserId: number;

  @BelongsTo(() => User, "executedByUserId")
  executedBy: User;

  @AllowNull(false)
  @Default("running")
  @Column
  status: string;

  @Column
  notes: string;

  @Column
  errorMessage: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default BackupRestoreLog;
