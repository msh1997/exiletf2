import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity } from "typeorm";

@Entity()
export class Command extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  commandName: string;

  @Column()
  response: string;

  @Column()
  guild: string;

  @Column()
  reply: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
