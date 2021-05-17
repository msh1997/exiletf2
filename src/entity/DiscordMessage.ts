import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
} from "typeorm";

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

  @CreateDateColumn()
  createdAt: Date;
}
