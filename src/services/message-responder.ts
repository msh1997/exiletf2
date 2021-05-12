import {Message} from "discord.js";
import {PingFinder} from "./ping-finder";
import {inject, injectable} from "inversify";
import {TYPES} from "../types";
import { InjectRepository } from "typeorm-typedi-extensions";
import { DiscordMessage } from "../entity/DiscordMessage";
import { Connection, Repository } from "typeorm";
import { Service } from "typedi";
import { DBManager } from "../db";
import { EggFinder } from "./egg-finder";

@injectable()
@Service()
export class MessageResponder {
  private pingFinder: PingFinder;
  private eggFinder: EggFinder;

  private messageRepository: Repository<DiscordMessage>;
  private manager: DBManager;

  constructor(
    @inject(TYPES.PingFinder) pingFinder: PingFinder,
    @inject(TYPES.EggFinder) eggFinder: EggFinder,
    @inject(TYPES.DBManager) manager: DBManager
  ) {
    this.pingFinder = pingFinder;
    this.eggFinder = eggFinder;
    this.messageRepository = manager.messageRepository;
    this.manager = manager;
  }

  async handle(message: Message): Promise<Message | Message[]> {
    this.messageRepository = this.manager.messageRepository;
    const discordMessage = new DiscordMessage();
    discordMessage.content = message.content;
    discordMessage.sender = message.member.displayName;
    console.log(discordMessage);
    const savedMessage = await this.messageRepository.save(discordMessage);
    console.log(savedMessage);
    if (this.pingFinder.isPing(message.content)) {
      return await message.reply('pong!');
    }
    if (this.eggFinder.isEgg(message.content)) {
      return await message.channel.send(":egg:");
    }
    throw("error responding");
  }
}