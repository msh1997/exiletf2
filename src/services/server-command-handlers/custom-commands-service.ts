import { Message } from "discord.js";
import {inject, injectable} from "inversify";
import { Repository } from "typeorm";
import { DBManager } from "../../db";
import { Command } from "../../entity/Command";
import { TYPES } from "../../types";
import { CommandHandler, Handle } from "./server-commands-config";
import { COMMANDS } from "./server-commands-list";

@CommandHandler
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
    });
  }

  public isAddCom = (message: Message): boolean => {
    const spcSplit = message.content.split(' ');
    return spcSplit[0] === '!addcom';
  }

  public isDelCom = (message: Message): boolean => {
    const spcSplit = message.content.split(' ');
    return spcSplit[0] === '!delcom';
  }

  @Handle(COMMANDS.AddCom)
  public addCom = async (message: Message) => {
    const spcSplit = message.content.split('"');
    const command = new Command();

    command.commandName = spcSplit[1].trim();
    command.response = spcSplit[3].trim();
    command.reply = false;
    command.guild = message.guild.id;

    const existingCommand = await this.commandsRepository.find({
      commandName: command.commandName
    });
    if (existingCommand.length === 0) {
      this.addToHash(command);
      await this.commandsRepository.save(command);
      message.channel.send("Command has been added");
    }
    else {
      message.channel.send("Command already exists");
    }
  }

  @Handle(COMMANDS.DelCom)
  private delCom = async (message: Message) => {
    const spcSplit = message.content.split('"');
    console.log(spcSplit[1]);
    let deleteResult = await this.commandsRepository.delete({
      commandName: spcSplit[1]
    });
    if (deleteResult.affected == 0) message.channel.send("No commands deleted");
    else message.channel.send("Command deleted");
  }

  private addToHash = (command: Command) => {
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

  public isCommand = (message: Message): boolean => {
    return this.commandsMap.get(message.guild.id) !== undefined && this.commandsMap.get(message.guild.id).get(message.content) !== undefined;
  }

  @Handle(COMMANDS.ReplyCom)
  public replyCommand = (message: Message) => {
    let command = this.commandsMap.get(message.guild.id).get(message.content);
    if(command.reply) {
      message.reply(command.response);
    } else {
      message.channel.send(command.response);
    }
  }
}