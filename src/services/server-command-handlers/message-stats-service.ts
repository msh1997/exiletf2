import { Message } from "discord.js";
import { inject, injectable } from "inversify";
import { Like, Repository } from "typeorm";
import { DBManager } from "../../db";
import { DiscordMessage } from "../../entity/DiscordMessage";
import { DiscordMessageAttachment } from "../../entity/DiscordMessageAttachment";
import { TYPES } from "../../types";
import { CommandHandler, Handle } from "./server-commands-config";
import { COMMANDS } from "./server-commands-list";

@CommandHandler
@injectable()
export class MessageStatsService {
  private DBManager: DBManager;
  private messageRepository: Repository<DiscordMessage>;

  constructor(@inject(TYPES.DBManager) manager: DBManager) {
    this.DBManager = manager;
    this.DBManager.register(async (dbmanager) => {
      this.messageRepository = dbmanager.getRepository(DiscordMessage);
    });
  }

  public isMessageCountCommand = (message: Message): boolean => {
    return message.content.split(" ")[0] === "!msgcount";
  };

  public getMessageCount = async (message: Message): Promise<number> => {
    const messageCount = new Map();
    const messageMatcher = message.content.split("\"")[1];
    const user = (message.mentions.users as any).first();
    const response = await this.messageRepository.count({
      where: {
        sender: user.id,
        content: Like(`%${messageMatcher}%`),
      },
    });
    const test = await this.messageRepository.find({
      where: {
        sender: "111691572084510720",
        content: Like(`%${messageMatcher}%`),
      },
      relations: ["attachments"],
    });
    messageCount.set(user.id, response);
    console.log(test[0]);
    return messageCount.get(user.id);
  };

  @Handle(COMMANDS.MsgCount)
  public handleMessageCountRequest = async (message: Message) => {
    message.channel.send(await this.getMessageCount(message));
  };
}
