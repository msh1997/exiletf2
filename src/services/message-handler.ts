/*eslint-disable indent, @typescript-eslint/no-unused-vars*/
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { DiscordMessage } from "../entity/DiscordMessage";
import { Repository } from "typeorm";
import { Service } from "typedi";
import { DBManager } from "../db";
import { MiddleFingerRemover } from "./middle-finger-remover";
import { CommandsService } from "./server-command-handlers/custom-commands-service";
import { COMMANDS } from "./server-command-handlers/server-commands-list";
import { DiscordMessageAttachment } from "../entity/DiscordMessageAttachment";
import { MessageStatsService } from "./server-command-handlers/message-stats-service";
import { ChannelPermissionsService } from "./server-command-handlers/channel-permissions-service";
import { ServerImageService } from "./server-command-handlers/server-image-service";
import { WolframQueryService } from "./server-command-handlers/wolfram-query-service";
import { CommandsHelpService } from "./server-command-handlers/commands-help-service";

@injectable()
@Service()
export class MessageHandler {
  private middleFingerRemover: MiddleFingerRemover;
  private commandsService: CommandsService;
  private messageRepository: Repository<DiscordMessage>;
  private manager: DBManager;
  private channelPermissionsService: ChannelPermissionsService;
  private serverImageService: ServerImageService;
  private messageStatsService: MessageStatsService;
  private wolframQueryService: WolframQueryService;
  private commandsHelpService: CommandsHelpService;

  constructor(
    @inject(TYPES.DBManager) manager: DBManager,
    @inject(TYPES.MiddleFingerRemover) middleFingerRemover: MiddleFingerRemover,
    @inject(TYPES.CommandsService) commandsService: CommandsService,
    @inject(TYPES.MessageStatsService) messageStatsService: MessageStatsService,
    @inject(TYPES.ChannelPermissionsService)
    channelPermissionsService: ChannelPermissionsService,
    @inject(TYPES.ServerImageService) serverImageSerice: ServerImageService,
    @inject(TYPES.WolframQueryService) wolframQueryService: WolframQueryService,
    @inject(TYPES.CommandsHelpService) commandsHelpService: CommandsHelpService
  ) {
    this.manager = manager;
    this.middleFingerRemover = middleFingerRemover;
    this.commandsService = commandsService;
    this.channelPermissionsService = channelPermissionsService;
    this.messageStatsService = messageStatsService;
    this.serverImageService = serverImageSerice;
    this.wolframQueryService = wolframQueryService;
    this.commandsHelpService = commandsHelpService;
    this.manager.register(dbmanager => {
      this.messageRepository = dbmanager.getRepository(DiscordMessage);
    });
  }

  private saveMessage = async (message: Message) => {
    const discordMessage = new DiscordMessage();
    discordMessage.content = message.content;
    discordMessage.sender = message.member.id;
    discordMessage.guild = message.guild.id;
    discordMessage.channel = message.channel.id;
    const messageAttachments: DiscordMessageAttachment[] = [];
    const attachments: any = message.attachments;
    if (attachments.size != 0) {
      attachments.each((attachment: MessageAttachment) => {
        const discordMessageAttachment = new DiscordMessageAttachment();
        discordMessageAttachment.message = discordMessage;
        discordMessageAttachment.name = attachment.name;
        discordMessageAttachment.url = attachment.url;
        discordMessageAttachment.attachmentId = attachment.id;
        discordMessageAttachment.size = attachment.size;
        messageAttachments.push(discordMessageAttachment);
      });
    }
    discordMessage.attachments = messageAttachments;
    console.log(discordMessage);
    await this.messageRepository.save(discordMessage);
  };

  private sendMessage = async (
    messageResponse: MessageResponse | MessageEmbedResponse[],
    message: Message
  ) => {
    if (!this.channelPermissionsService.canSend(message)) return;
    if (messageResponse instanceof MessageResponse) {
      if (messageResponse.reply) await message.reply(messageResponse.content);
      else await message.channel.send(messageResponse.content);
    } else {
      messageResponse.forEach(async response => {
        if (response.reply) await message.reply(response.embed);
        else await message.channel.send(response.embed);
      });
    }
  };

  private processMessage = async (message: Message): Promise<void> => {
    try {
      const commandStr = message.content.split(" ")[0].trim();
      const command = COMMANDS[commandStr];
      if (command !== undefined) {
        const context = command.context;
        const messageResponse = await command.handler(message, context);
        await this.sendMessage(messageResponse, message);
        if (command.teardown !== undefined) command.teardown(context);
        if (command.save) this.saveMessage(message);
        return;
      }
      if (this.commandsService.isCommand(message)) {
        const messageResponse = await COMMANDS["ReplyCom"].handler(message);
        this.sendMessage(messageResponse, message);
      }

      this.saveMessage(message);
    } catch (ex) {
      console.log(ex);
    }
  };

  handle = (message: Message, ...args): Promise<Message | Message[]> => {
    if (this.middleFingerRemover.handleMessage(message)) {
      return;
    }
    this.processMessage(message);
  };
}

export class MessageResponse {
  public content: any;
  public reply: boolean;

  constructor(content: any, reply: boolean) {
    this.content = content;
    this.reply = reply;
  }
}

export class MessageEmbedResponse {
  public embed: MessageEmbed;
  public reply: boolean;

  constructor(embed: MessageEmbed, reply: boolean) {
    this.reply = reply;
    this.embed = embed;
  }
}
