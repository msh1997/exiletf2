import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { DiscordMessageAttachment } from "./DiscordMessageAttachment";

@Entity("discord_message")
export class DiscordMessage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() content: string;

  @Column() sender: string;

  @Column()
  guild: string;

  @Column()
  channel: string;

  @OneToMany(() => DiscordMessageAttachment, attachment => attachment.message, { cascade: true })
  attachments: DiscordMessageAttachment[];

  @CreateDateColumn()
  createdAt: Date;
}
