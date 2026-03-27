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
  BelongsTo,
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";

@Table
class Backup extends Model<Backup> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Default("full")
  @Column
  type: string;

  @AllowNull(false)
  @Default("pending")
  @Column
  status: string;

  @Column
  filePath: string;

  @Column
  checksum: string;

  @Column
  sizeBytes: number;

  @Column
  errorMessage: string;

  @Column(DataType.JSONB)
  metadata: unknown;

  @Column(DataType.DATE)
  startedAt: Date;

  @Column(DataType.DATE)
  finishedAt: Date;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => User)
  @Column
  triggeredByUserId: number;

  @BelongsTo(() => User, "triggeredByUserId")
  triggeredBy: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Backup;
