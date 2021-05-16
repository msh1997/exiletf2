import { Message } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { DiscordMessage } from "../entity/DiscordMessage";
import { Repository } from "typeorm";
import { Service } from "typedi";
import { DBManager } from "../db";
import { MiddleFingerRemover } from "./middle-finger-remover";
import { CommandsService } from "./server-command-handlers/custom-commands-service";
import { MessageStatsService } from "./server-command-handlers/message-stats-service";
import { COMMANDS } from "./server-command-handlers/server-commands-list";

@injectable()
@Service()
export class MessageHandler {
  private middleFingerRemover: MiddleFingerRemover;
  private commandsService: CommandsService;
  private messageStatsService: MessageStatsService;
  private messageRepository: Repository<DiscordMessage>;
  private manager: DBManager;

  constructor(
    @inject(TYPES.DBManager) manager: DBManager,
    @inject(TYPES.MiddleFingerRemover) middleFingerRemover: MiddleFingerRemover,
    @inject(TYPES.CommandsService) commandsService: CommandsService,
    @inject(TYPES.MessageStatsService) messageStatsService: MessageStatsService
  ) {
    this.messageRepository = manager.messageRepository;
    this.manager = manager;
    this.middleFingerRemover = middleFingerRemover;
    this.commandsService = commandsService;
    this.messageStatsService = messageStatsService;
    this.manager.register((dbmanager) => {
      this.messageRepository = dbmanager.messageRepository;
    });
  }

  private async saveMessage(message: Message) {
    const discordMessage = new DiscordMessage();
    discordMessage.content = message.content;
    discordMessage.sender = message.member.id;
    discordMessage.guild = message.guild.id;
    discordMessage.channel = message.channel.id;
    console.log(discordMessage);
    await this.messageRepository.save(discordMessage);
  }

  private processMessage = (message: Message): void => {
    try {
      const commandStr = message.content.split(" ")[0].trim();
      for (const command in COMMANDS) {
        if (COMMANDS[command].value === commandStr) {
          COMMANDS[command].handler(message);
          if (COMMANDS[command].save) this.saveMessage(message);
          return;
        }
      }
      if (this.commandsService.isCommand(message)) {
        COMMANDS.ReplyCom.handler(message);
      }
      this.saveMessage(message);
    } catch (ex) {
      console.log(ex);
    }
  };

  async handle(message: Message): Promise<Message | Message[]> {
    if (this.middleFingerRemover.handleMessage(message)) {
      return;
    }
    this.processMessage(message);
  }
}
