import { Message } from "discord.js";
import { injectable } from "inversify";
import { MessageResponse } from "../message-handler";
import { CommandHandler, Handle } from "./server-commands-config";

@CommandHandler
@injectable()
export class CommandsHelpService {
  @Handle("!help")
  public handleHelpRequest = async (message: Message): Promise<MessageResponse> => {
    if (message.content.length === 727) return new MessageResponse("WYSI", true);
    return new MessageResponse(
      "The current list of commands is:\n\n!addcom, !delcom, !msgcount, !setchannelperms, !dimg, !simg, !dimgbomb, !simgbomb, !rimg, !wolfram",
      true
    );
  };
}
