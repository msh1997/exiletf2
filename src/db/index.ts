import { injectable } from 'inversify';
import { createConnection, Repository } from 'typeorm';
import { Command } from '../entity/Command';
import { DiscordMessage } from '../entity/DiscordMessage';


@injectable()
export class DBManager {
  public messageRepository: Repository<DiscordMessage>;
  public commandsRepository: Repository<Command>;
  private callbacks: Function[] = [];
  private isInitialized: boolean = false;

  constructor() {
    createConnection().then(connection => {
      this.messageRepository = connection.getRepository(DiscordMessage);
      this.commandsRepository = connection.getRepository(Command);
      this.isInitialized = true;
      this.callbacks.forEach(callback => {
        callback(this);
      })
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
