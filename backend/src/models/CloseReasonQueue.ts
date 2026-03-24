import {
  Table,
  Column,
  ForeignKey,
  Model,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";
import CloseReason from "./CloseReason";
import Queue from "./Queue";

@Table
class CloseReasonQueue extends Model<CloseReasonQueue> {
  @ForeignKey(() => CloseReason)
  @Column
  closeReasonId: number;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CloseReasonQueue;
