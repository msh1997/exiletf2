import { Message, MessageAttachment } from "discord.js";
import { injectable } from "inversify";
import { CommandHandler, Handle } from "./server-commands-config";
import * as WolframAlphaAPI from "wolfram-alpha-api";
import { MessageResponse } from "../message-handler";

@CommandHandler
@injectable()
export class WolframQueryService {
  private wolfram: WolframAlphaAPI;

  constructor() {
    this.wolfram = new WolframAlphaAPI("GVU4LE-EYT6LRLWTV");
  }

  @Handle("!wolfram")
  public handleWolframQueryRequest = async (message: Message): Promise<MessageResponse> => {
    if (message.content.split(" ").length < 3) {
      return new MessageResponse(
        "Not enough inputs!\nQueries must be in the form !wolfram [text/image] [query].",
        false
      );
    }

    const queryMessage = message.content.split(" ").slice(2).join(" ");
    const responseType = message.content.split(" ")[1].toLowerCase();

    if (responseType === "text") {
      try {
        return new MessageResponse(await this.wolfram.getShort(queryMessage), false);
      } catch {
        return new MessageResponse("Wolfram does not understand your query.", false);
      }
    } else if (responseType === "image") {
      try {
        const imageURI = await this.wolfram.getSimple(queryMessage);
        const stream = Buffer.from(imageURI.split(",")[1], "base64");
        return new MessageResponse(new MessageAttachment(stream), false);
      } catch {
        return new MessageResponse("Wolfram does not understand your query.", false);
      }
    } else {
      return new MessageResponse("Please choose between text or image.", false);
    }
  };
}
