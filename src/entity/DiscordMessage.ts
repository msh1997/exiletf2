import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm";

@Entity()
export class DiscordMessage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column()
    sender: string;

    @Column()
    guild: string;

    @Column()
    channel: string;

    @CreateDateColumn()
    createdAt: Date;

}
