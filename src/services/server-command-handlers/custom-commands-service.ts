import { Message } from "discord.js";
import { inject, injectable } from "inversify";
import { Repository } from "typeorm";
import { DBManager } from "../../db";
import { Command } from "../../entity/Command";
import { TYPES } from "../../types";
import { MessageResponse } from "../message-handler";
import { CommandHandler, Handle } from "./server-commands-config";
import { COMMANDS } from "./server-commands-list";

@CommandHandler
@injectable()
export class CommandsService {
  private DBManager: DBManager;
  private commandsMap = new Map();
  private commandsRepository: Repository<Command>;

  constructor(@inject(TYPES.DBManager) manager: DBManager) {
    this.DBManager = manager;
    this.DBManager.register(async (dbmanager) => {
      this.commandsRepository = dbmanager.getRepository(Command);
      const commands = await this.commandsRepository.find();
      commands.forEach((command) => this.addToHash(command));
    });
  }

  public isAddCom = (message: Message): boolean => {
    const spcSplit = message.content.split(" ");
    return spcSplit[0] === "!addcom";
  };

  public isDelCom = (message: Message): boolean => {
    const spcSplit = message.content.split(" ");
    return spcSplit[0] === "!delcom";
  };

  @Handle(COMMANDS.AddCom)
  public addCom = async (message: Message): Promise<MessageResponse> => {
    const spcSplit = message.content.split("\"");
    const command = new Command();

    command.commandName = spcSplit[1].trim();
    command.response = spcSplit[3].trim();
    command.reply = false;
    command.guild = message.guild.id;

    const existingCommand = await this.commandsRepository.find({
      commandName: command.commandName,
    });
    if (existingCommand.length === 0) {
      this.addToHash(command);
      await this.commandsRepository.save(command);
      return new MessageResponse("Command has been added", false);
    } else {
      return new MessageResponse("Command already exists", false);
    }
  };

  @Handle(COMMANDS.DelCom)
  private delCom = async (message: Message): Promise<MessageResponse> => {
    const spcSplit = message.content.split("\"");
    console.log(spcSplit[1]);
    const deleteResult = await this.commandsRepository.delete({
      commandName: spcSplit[1],
    });
    if (deleteResult.affected == 0)
      return new MessageResponse("No commands deleted", false);
    else return new MessageResponse("Command deleted", false);
  };

  private addToHash = (command: Command) => {
    const guild = command.guild;
    const commandName = command.commandName;
    if (!this.commandsMap.has(guild)) {
      const nameMap = new Map();
      nameMap.set(commandName, command);
      this.commandsMap.set(guild, nameMap);
    } else {
      const nameMap = this.commandsMap.get(guild);
      nameMap.set(commandName, command);
    }
  };

  public isCommand = (message: Message): boolean => {
    return (
      this.commandsMap.get(message.guild.id) !== undefined &&
      this.commandsMap.get(message.guild.id).get(message.content) !== undefined
    );
  };

  @Handle(COMMANDS.ReplyCom)
  public replyCommand = (message: Message): Promise<MessageResponse> => {
    const command = this.commandsMap.get(message.guild.id).get(message.content);
    if (command.reply) {
      return Promise.resolve(new MessageResponse(command.response, true));
    } else {
      return Promise.resolve(new MessageResponse(command.response, false));
    }
  };
}
