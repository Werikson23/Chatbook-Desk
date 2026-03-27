import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
  ForeignKey,
  DataType,
} from "sequelize-typescript";
import User from "./User";
import Chat from "./Chat";

@Table({ tableName: "ChatMessages" })
class ChatMessage extends Model<ChatMessage> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Chat)
  @Column
  chatId: number;

  @ForeignKey(() => User)
  @Column
  senderId: number;

  @Column({ defaultValue: "" })
  message: string;

  @Column(DataType.STRING)
  get mediaPath(): string | null {
    const value = this.getDataValue("mediaPath");
    if (value) {
      if (/^https?:\/\//i.test(value)) {
        try {
          const parsed = new URL(value);
          if (parsed.pathname.startsWith("/public/")) {
            return `${parsed.pathname}${parsed.search || ""}`;
          }
        } catch {
          // keep original URL when parsing fails
        }
        return value;
      }
      return `/public/${value}`;
    }
    return null;
  }

  @Column
  mediaType: string;

  @Column
  mediaName: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Chat)
  chat: Chat;

  @BelongsTo(() => User)
  sender: User;
}

export default ChatMessage;
