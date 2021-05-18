import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
} from "typeorm";

@Entity()
export class ChannelPermissions extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  guild: string;

  @Column()
  channel: string;

  @Column()
  canSend: boolean;

  @Column()
  canEdit: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
