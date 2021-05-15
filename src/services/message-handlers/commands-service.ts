import { Message } from "discord.js";
import {inject, injectable} from "inversify";
import { Repository } from "typeorm";
import { DBManager } from "../../db";
import { Command } from "../../entity/Command";
import { TYPES } from "../../types";

@injectable()
export class CommandsService {

  private DBManager: DBManager;
  private commandsMap = new Map();
  private commandsRepository: Repository<Command>;

  constructor(@inject(TYPES.DBManager) manager: DBManager,){
      this.DBManager = manager;
      this.DBManager.register(async dbmanager => {
        this.commandsRepository = dbmanager.commandsRepository;
        let commands = await this.commandsRepository.find();

        commands.forEach(command => this.addToHash(command));
        console.log(commands);
      });
  }

  public isAddCom(stringToSearch: string): boolean {
    const spcSplit = stringToSearch.split(' ');
    return spcSplit[0] === '!addcom';
  }

  public storeCom(message: Message): Promise<Command> {
    const spcSplit = message.content.split(' ');
    const command = new Command();

    command.commandName = spcSplit[1];
    command.response = spcSplit[2];
    command.reply = false;
    command.guild = message.guild.id;

    this.addToHash(command);
    return this.commandsRepository.save(command);
  }

  private addToHash(command: Command) {
    let guild = command.guild;
      let commandName = command.commandName;
      if (!this.commandsMap.has(guild)) {
        let nameMap = new Map();
        nameMap.set(commandName, command);
        this.commandsMap.set(guild, nameMap);
      } else {
        let nameMap = this.commandsMap.get(guild);
        nameMap.set(commandName, command);
      }
  }

  public isCommand(message: Message): boolean {
    return this.commandsMap.get(message.guild.id) !== undefined && this.commandsMap.get(message.guild.id).get(message.content) !== undefined;
  }

  public replyCommand(message: Message) {
    let command = this.commandsMap.get(message.guild.id).get(message.content);
    if(command.reply) {
      message.reply(command.response);
    } else {
      message.channel.send(command.response);
    }
  }
}