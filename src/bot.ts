import { Client, Message } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "./types";
import { MessageHandler } from "./services/message-handler";

@injectable()
export class Bot {
  private client: Client;
  private readonly token: string;
  private messageHandler: MessageHandler;

  constructor(
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.Token) token: string,
    @inject(TYPES.MessageHandler) messageResponder: MessageHandler
  ) {
    this.client = client;
    this.token = token;
    this.messageHandler = messageResponder;
  }

  public listen = (): Promise<string> => {
    this.client.on("message", async (message: Message) => {
      if (message.author.bot) {
        console.log("Ignoring bot message!");
        return;
      }

      try {
        await this.messageHandler.handle(message);
      } catch (ex) {
        console.log(ex);
      }
    });

    return this.client.login(this.token);
  };
}
