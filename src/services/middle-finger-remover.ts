import { Message } from "discord.js";
import {injectable} from "inversify";
import { COMMANDS } from "./server-command-handlers/server-commands-list";

@injectable()
export class MiddleFingerRemover {

  public handleMessage(message: Message): boolean {
    if (message.content.includes('🖕')) {
        message.delete();
        return true;
    }
    return false;
  }
}