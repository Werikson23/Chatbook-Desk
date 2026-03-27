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
import AttributeDefinition from "./AttributeDefinition";
import AttributeGroupInstance from "./AttributeGroupInstance";
import AttributeContainerProfilePermission from "./AttributeContainerProfilePermission";

@Table({ tableName: "AttributeContainers" })
class AttributeContainer extends Model<AttributeContainer> {
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
  name: string;

  @Column
  key: string;

  @Column
  entityType: string;

  @Column
  category: string;

  @Column
  icon: string;

  @Column
  color: string;

  @Column
  uiLayout: string;

  @Column
  isRepeatable: boolean;

  @Column
  isCollapsible: boolean;

  @Column
  sortOrder: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => AttributeDefinition)
  definitions: AttributeDefinition[];

  @HasMany(() => AttributeGroupInstance)
  groupInstances: AttributeGroupInstance[];

  @HasMany(() => AttributeContainerProfilePermission)
  profilePermissions: AttributeContainerProfilePermission[];
}

export default AttributeContainer;
