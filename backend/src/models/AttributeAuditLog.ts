import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  DataType
} from "sequelize-typescript";
import Company from "./Company";

@Table({ tableName: "AttributeAuditLogs", timestamps: false })
class AttributeAuditLog extends Model<AttributeAuditLog> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column
  actorId: number;

  @Column
  actorType: string;

  @Column
  action: string;

  @Column
  entityType: string;

  @Column
  entityId: number;

  @Column
  fieldName: string;

  @Column(DataType.JSONB)
  oldValue: object;

  @Column(DataType.JSONB)
  newValue: object;

  @Column(DataType.JSONB)
  metadata: object;

  @Column
  ipAddress: string;

  @Column
  userAgent: string;

  @Column
  source: string;

  @CreatedAt
  createdAt: Date;
}

export default AttributeAuditLog;
