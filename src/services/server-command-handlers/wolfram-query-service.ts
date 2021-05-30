import { Message } from "discord.js";
import { injectable } from "inversify";
import { CommandHandler, Handle } from "./server-commands-config";
import * as WolframAlphaAPI from "wolfram-alpha-api";
import { MessageResponse } from "../message-handler";
import * as Base64Img from "base64-img";

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
        Base64Img.img(imageURI, "wolfram", "pootis", function (err, filepath) {
          console.log(err);
          console.log(filepath);
        });
        await message.channel.send({
          files: [
            {
              attachment: "wolfram/pootis.gif",
              name: "FuckYouExileTf2.gif",
            },
          ],
        });
        return new MessageResponse("", false);
      } catch {
        return new MessageResponse("Wolfram does not understand your query.", false);
      }
    } else {
      return new MessageResponse("Please choose between text or image.", false);
    }
  };
}
