import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm";

@Entity()
export class DiscordMessage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column()
    sender: string;

    @CreateDateColumn()
    createdAt: Date;

}
