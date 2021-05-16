import { injectable } from "inversify";
import { createConnection, Repository } from "typeorm";
import { Command } from "../entity/Command";
import { DiscordMessage } from "../entity/DiscordMessage";

@injectable()
export class DBManager {
  public messageRepository: Repository<DiscordMessage>;
  public commandsRepository: Repository<Command>;
  private callbacks: Function[] = [];
  private isInitialized = false;

  constructor() {
    createConnection({
      type: "mysql",
      url: process.env.TYPEORM_URL,
      charset: "utf8mb4",
      entities: process.env.TYPEORM_ENTITIES.split(","),
      synchronize: process.env.TYPEORM_SYNCHRONIZE == "true",
    }).then((connection) => {
      this.messageRepository = connection.getRepository(DiscordMessage);
      this.commandsRepository = connection.getRepository(Command);
      this.isInitialized = true;
      this.callbacks.forEach((callback) => {
        callback(this);
      });
    });
  }

  public register(callback: Function) {
    if (this.isInitialized) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }
}
