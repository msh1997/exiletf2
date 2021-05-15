import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm";

@Entity()
export class Command {

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
