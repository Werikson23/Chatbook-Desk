import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import AttributeContainer from "./AttributeContainer";

@Table({ tableName: "AttributeContainerProfilePermissions" })
class AttributeContainerProfilePermission extends Model<AttributeContainerProfilePermission> {
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
  profile: string;

  @Column
  canView: boolean;

  @Column
  canEdit: boolean;

  @Column
  canCopy: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default AttributeContainerProfilePermission;
