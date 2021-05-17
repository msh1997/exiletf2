import { Message } from "discord.js";
import { injectable } from "inversify";

@injectable()
export class MiddleFingerRemover {
  public handleMessage = (message: Message): boolean => {
    if (message.content.includes("🖕")) {
      message.delete();
      return true;
    }
    return false;
  };
}
