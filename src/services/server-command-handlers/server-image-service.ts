import { Message, MessageEmbed } from "discord.js";
import { inject, injectable } from "inversify";
import { Like, Repository } from "typeorm";
import { DBManager } from "../../db";
import { DiscordMessage } from "../../entity/DiscordMessage";
import { DiscordMessageAttachment } from "../../entity/DiscordMessageAttachment";
import { TYPES } from "../../types";
import { MessageEmbedResponse, MessageResponse } from "../message-handler";
import { CommandHandler, Handle } from "./server-commands-config";
import { COMMANDS } from "./server-commands-list";
import * as Danbooru from "danbooru";

@CommandHandler
@injectable()
export class ServerImageService {
  private danbooru: Danbooru;
  private sankaku: Danbooru;
  private imageBombAmount = 3;

  constructor() {
    this.danbooru = new Danbooru(process.env.DANBOORU_USERNAME + ":" + process.env.DANBOORU_APIKEY);
    this.sankaku = new Danbooru("capi-beta.sankakucomplex.com");
  }

  public getPost = async (search: string, site: Danbooru) => {
    const post =
      search == undefined
        ? await site.get("/posts/random")
        : await site.get("/posts/random", { tags: search });
    return post;
  };

  public createEmbed = async (message, site) => {
    const embed = new MessageEmbed();
    let post;
    let tags = message.content.includes("\"")
      ? message.content.split("\"")[1]
      : message.content.split(" ")[1];
    let imageURL = "";
    embed.setColor(0xff0000);
    embed.setDescription("Error: No image found");
    embed.setAuthor("ExileTF2Bot");

    tags =
      tags === undefined ? "rating:safe" : !tags.includes("rating:") ? tags + " rating:safe" : tags;

    switch (site) {
    case "s":
      post = await this.getPost(tags, this.sankaku);
      imageURL = this.sankaku.url(post.file_url).href;
      if (imageURL === "https://danbooru.donmai.us/") return embed;

      embed.setColor(0x00ff00);
      embed.setImage(imageURL);
      embed.setDescription("");
      embed.setAuthor(
        post.tag_string_artist,
        null,
        `https://chan.sankakucomplex.com/?tags=${post.tag_string_artist}`
      );
      embed.setFooter("Sankaku");
      break;
    default:
      post = await this.getPost(tags, this.danbooru);
      imageURL = this.danbooru.url(post.file_url).href;
      if (imageURL === "https://danbooru.donmai.us/") return embed;

      embed.setColor(0x00ff00);
      embed.setImage(imageURL);
      embed.setAuthor(
        post.tag_string_artist,
        null,
        `https://danbooru.donmai.us/posts?tags=${post.tag_string_artist}`
      );
      embed.setDescription("");
      embed.setFooter("Danbooru");
      break;
    }

    return embed;
  };

  @Handle(COMMANDS.DanbooruImage)
  public handleDanbooruImageRequest = async (message: Message): Promise<MessageEmbedResponse[]> => {
    const danbooruImageList: MessageEmbedResponse[] = [];
    danbooruImageList.push(new MessageEmbedResponse(await this.createEmbed(message, "d"), false));
    return danbooruImageList;
  };

  @Handle(COMMANDS.SankakuImage)
  public handleSankakuImageRequest = async (message: Message): Promise<MessageEmbedResponse[]> => {
    const sankakuImageList: MessageEmbedResponse[] = [];
    sankakuImageList.push(new MessageEmbedResponse(await this.createEmbed(message, "s"), false));
    return sankakuImageList;
  };

  @Handle(COMMANDS.DanbooruImageBomb)
  public handleDanbooruImageBombRequest = async (
    message: Message
  ): Promise<MessageEmbedResponse[]> => {
    const danbooruImageList: MessageEmbedResponse[] = [];
    console.log("e");
    for (let i = 0; i < this.imageBombAmount; i++) {
      danbooruImageList.push(new MessageEmbedResponse(await this.createEmbed(message, "d"), false));
    }
    return danbooruImageList;
  };

  @Handle(COMMANDS.SankakuImageBomb)
  public handleSankakuImageBombRequest = async (
    message: Message
  ): Promise<MessageEmbedResponse[]> => {
    const sankakuImageList: MessageEmbedResponse[] = [];
    for (let i = 0; i < this.imageBombAmount; i++) {
      sankakuImageList.push(new MessageEmbedResponse(await this.createEmbed(message, "s"), false));
    }
    return sankakuImageList;
  };
}
