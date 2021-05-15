import {Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "../types";
import { DiscordMessage } from "../entity/DiscordMessage";
import { Repository } from "typeorm";
import { Service } from "typedi";
import { DBManager } from "../db";
import { MiddleFingerRemover } from "./message-handlers/middle-finger-remover";
import { CommandsService } from "./message-handlers/commands-service";

@injectable()
@Service()
export class MessageHandler {
  private middleFingerRemover: MiddleFingerRemover;
  private commandsService: CommandsService;
  private messageRepository: Repository<DiscordMessage>;
  private manager: DBManager;

  constructor(
    @inject(TYPES.DBManager) manager: DBManager,
    @inject(TYPES.MiddleFingerRemover) middleFingerRemover: MiddleFingerRemover,
    @inject(TYPES.CommandsService) commandsService: CommandsService,
  ) {
    this.messageRepository = manager.messageRepository;
    this.manager = manager;
    this.middleFingerRemover = middleFingerRemover;
    this.commandsService = commandsService;
    this.manager.register(dbmanager => {
      this.messageRepository = dbmanager.messageRepository;
    });
  }

  private async saveMessage(message: Message) {
    const discordMessage = new DiscordMessage();
    discordMessage.content = message.content;
    discordMessage.sender = message.member.displayName;
    discordMessage.guild = message.guild.id;
    discordMessage.channel = message.channel.id;
    console.log(discordMessage);
    const savedMessage = await this.messageRepository.save(discordMessage);
  }

  async handle(message: Message): Promise<Message | Message[]> {
    if(this.middleFingerRemover.handleMessage(message)) { return; }
    this.saveMessage(message);
    if(this.commandsService.isAddCom(message.content)){
      this.commandsService.storeCom(message).then(command => {
        console.log(command);
      })
    }
    if(this.commandsService.isCommand(message)) { this.commandsService.replyCommand(message); }
  }
}