import { injectable } from 'inversify';
import { createConnection, Repository } from 'typeorm';
import { Command } from '../entity/Command';
import { DiscordMessage } from '../entity/DiscordMessage';


@injectable()
export class DBManager {
  public messageRepository: Repository<DiscordMessage>;
  public commandsRepository: Repository<Command>;

  constructor() {
    createConnection().then(connection => {
      this.messageRepository = connection.getRepository(DiscordMessage);
      this.commandsRepository = connection.getRepository(Command);
    });
  }
}
