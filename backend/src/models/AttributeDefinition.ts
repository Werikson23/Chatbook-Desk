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
  DataType,
  HasMany
} from "sequelize-typescript";
import Company from "./Company";
import AttributeContainer from "./AttributeContainer";
import AttributeValue from "./AttributeValue";

@Table({ tableName: "AttributeDefinitions" })
class AttributeDefinition extends Model<AttributeDefinition> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => AttributeContainer)
  @Column
  containerId: number;

  @BelongsTo(() => AttributeContainer)
  container: AttributeContainer;

  @Column
  name: string;

  @Column
  key: string;

  @Column
  dataType: string;

  @Column
  version: number;

  @Column
  isActive: boolean;

  @Column
  isRequired: boolean;

  @Column
  isSearchable: boolean;

  @Column
  isRepeatable: boolean;

  @Column(DataType.JSONB)
  validationRules: any;

  @Column(DataType.JSONB)
  options: any;

  @Column(DataType.JSONB)
  defaultValue: any;

  @Column
  visibility: string;

  @Column
  sortOrder: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => AttributeValue)
  values: AttributeValue[];
}

export default AttributeDefinition;
