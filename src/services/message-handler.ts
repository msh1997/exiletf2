import {Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "../types";
import { InjectRepository } from "typeorm-typedi-extensions";
import { DiscordMessage } from "../entity/DiscordMessage";
import { Connection, Repository } from "typeorm";
import { Service } from "typedi";
import { DBManager } from "../db";
import { METHODS } from "http";
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
  }

  async handle(message: Message): Promise<Message | Message[]> {
    if(this.middleFingerRemover.handleMessage(message)) { return; }
    this.messageRepository = this.manager.messageRepository;
    const discordMessage = new DiscordMessage();
    discordMessage.content = message.content;
    discordMessage.sender = message.member.displayName;
    console.log(discordMessage);
    const savedMessage = await this.messageRepository.save(discordMessage);
    if(this.commandsService.isAddCom(message.content)){
      this.commandsService.storeCom(message).then(command => {
        console.log(command);
      })
    }
  }
}