/*eslint-disable quotes, indent*/
import { Message } from "discord.js";
import { inject, injectable } from "inversify";
import { Like, Repository } from "typeorm";
import { DBManager } from "../../db";
import { DiscordMessage } from "../../entity/DiscordMessage";
import { TYPES } from "../../types";
import { MessageResponse } from "../message-handler";
import { CommandHandler, Handle } from "./server-commands-config";

@CommandHandler
@injectable()
export class MessageStatsService {
  private DBManager: DBManager;
  private messageRepository: Repository<DiscordMessage>;

  constructor(@inject(TYPES.DBManager) manager: DBManager) {
    this.DBManager = manager;
    this.DBManager.register(async dbmanager => {
      this.messageRepository = dbmanager.getRepository(DiscordMessage);
    });
  }

  public isMessageCountCommand = (message: Message): boolean => {
    return message.content.split(" ")[0] === "!msgcount";
  };

  public getMessageCount = async (message: Message): Promise<number> => {
    const user = (message.mentions.users as any).first();
    const messageMatcher = message.content
      .split(" ")
      .slice(user !== undefined ? 2 : 1)
      .join(" ");
    const response = user
      ? await this.messageRepository.count({
          where: {
            sender: user.id,
            content: Like(`%${messageMatcher}%`),
          },
        })
      : await this.messageRepository.count({
          where: {
            content: Like(`%${messageMatcher}%`),
          },
        });
    console.log(response);
    return response;
  };

  @Handle("!msgcount")
  public handleMessageCountRequest = async (message: Message): Promise<MessageResponse> => {
    return new MessageResponse(await this.getMessageCount(message), false);
  };
}
