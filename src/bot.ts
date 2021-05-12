import {Client, Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "./types";
import {MessageResponder} from "./services/message-responder";

@injectable()
export class Bot {
  private client: Client;
  private readonly token: string;
  private messageResponder: MessageResponder;

  constructor(
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.Token) token: string,
    @inject(TYPES.MessageResponder) messageResponder: MessageResponder) {
    this.client = client;
    this.token = token;
    this.messageResponder = messageResponder;
  }

  public listen(): Promise<string> {
    this.client.on('message', async (message: Message) => {
      if (message.author.bot) {
        console.log('Ignoring bot message!')
        return;
      }

      try {
        await this.messageResponder.handle(message);
      } catch (ex) { console.log(ex); }
    });

    return this.client.login(this.token);
  }
}