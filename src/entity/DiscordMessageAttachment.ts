import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { DiscordMessage } from "./DiscordMessage";

@Entity("discord_message_attachment")
export class DiscordMessageAttachment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() url: string;

  @Column() name: string;

  @Column()
  attachmentId: string;

  @Column()
  size: number;

  @ManyToOne(() => DiscordMessage, message => message.attachments)
  message: DiscordMessage;

  @CreateDateColumn()
  createdAt: Date;
}
