import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
  BelongsToMany
} from "sequelize-typescript";
import Company from "./Company";
import Queue from "./Queue";
import CloseReasonQueue from "./CloseReasonQueue";

@Table
class CloseReason extends Model<CloseReason> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @Default("#607D8B")
  @Column
  color: string;

  @Default(true)
  @Column
  isActive: boolean;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @BelongsToMany(() => Queue, () => CloseReasonQueue)
  queues: Array<Queue & { CloseReasonQueue: CloseReasonQueue }>;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CloseReason;
