import { injectable } from "inversify";
import { EntityTarget } from "typeorm";
import { Connection, createConnection, Repository } from "typeorm";
import { Command } from "../entity/Command";
import { DiscordMessage } from "../entity/DiscordMessage";

@injectable()
export class DBManager {
  private callbacks: Function[] = [];
  private isInitialized = false;
  private connection: Connection;

  constructor() {
    createConnection({
      type: "mysql",
      url: process.env.TYPEORM_URL,
      charset: "utf8mb4",
      entities: process.env.TYPEORM_ENTITIES.split(","),
      synchronize: true,
      logging: true,
    }).then((connection) => {
      this.connection = connection;
      this.isInitialized = true;
      this.callbacks.forEach((callback) => {
        callback(this);
      });
    });
  }

  public register = (callback: Function) => {
    if (this.isInitialized) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  };

  public getRepository = <Entity>(
    entity: EntityTarget<Entity>
  ): Repository<Entity> => {
    return this.connection.getRepository(entity);
  };
}
