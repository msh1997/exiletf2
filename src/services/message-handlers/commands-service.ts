import { Message } from "discord.js";
import {inject, injectable} from "inversify";
import { Repository } from "typeorm";
import { DBManager } from "../../db";
import { Command } from "../../entity/Command";
import { TYPES } from "../../types";

@injectable()
export class CommandsService {

  private regexp = '!addcom';
  private DBManager: DBManager;

  constructor(@inject(TYPES.DBManager) manager: DBManager,){
      this.DBManager = manager;
  }

  public isAddCom(stringToSearch: string): boolean {
    const spcSplit = stringToSearch.split(' ');
    return spcSplit[0] === '!addcom';
  }

  public storeCom(message: Message): Promise<Command> {
    const spcSplit = message.content.split(' ');
    const command = new Command();
    const commandsRepository = this.DBManager.commandsRepository;

    command.commandName = spcSplit[1];
    command.response = spcSplit[2];
    command.reply = false;
    command.guild = message.guild.id;
   

    return commandsRepository.save(command);
  }



}