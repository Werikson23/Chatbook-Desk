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
  HasMany
} from "sequelize-typescript";
import Company from "./Company";
import AttributeContainer from "./AttributeContainer";
import AttributeValue from "./AttributeValue";

@Table({ tableName: "AttributeGroupInstances" })
class AttributeGroupInstance extends Model<AttributeGroupInstance> {
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
  entityType: string;

  @Column
  entityId: number;

  @Column
  label: string;

  @Column
  sortOrder: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => AttributeValue)
  values: AttributeValue[];
}

export default AttributeGroupInstance;
