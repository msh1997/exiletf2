import { injectable } from 'inversify';
import { createConnection, Repository } from 'typeorm';
import { DiscordMessage } from '../entity/DiscordMessage';

@injectable()
export class DBManager {
  public messageRepository: Repository<DiscordMessage>;

  constructor() {
    createConnection().then(connection => {
      this.messageRepository = connection.getRepository(DiscordMessage);
    });
  }
}
