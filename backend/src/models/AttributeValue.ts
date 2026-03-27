import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import AttributeDefinition from "./AttributeDefinition";
import AttributeGroupInstance from "./AttributeGroupInstance";

@Table({ tableName: "AttributeValues" })
class AttributeValue extends Model<AttributeValue> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => AttributeDefinition)
  @Column
  attributeDefinitionId: number;

  @BelongsTo(() => AttributeDefinition)
  attributeDefinition: AttributeDefinition;

  @Column
  entityType: string;

  @Column
  entityId: number;

  @ForeignKey(() => AttributeGroupInstance)
  @Column({ type: DataType.INTEGER, allowNull: true })
  groupInstanceId: number;

  @BelongsTo(() => AttributeGroupInstance)
  groupInstance: AttributeGroupInstance;

  @Column
  valueText: string;

  @Column
  valueNumber: number;

  @Column
  valueBoolean: boolean;

  @Column
  valueDate: Date;

  @Column(DataType.JSONB)
  valueJson: any;

  @Column
  valueStringIndex: string;

  @Column
  valueNumberIndex: number;

  @Column
  valueDateIndex: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default AttributeValue;
