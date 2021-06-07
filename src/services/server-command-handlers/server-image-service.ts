/*eslint-disable indent*/
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import { injectable } from "inversify";
import { MessageEmbedResponse, MessageResponse } from "../message-handler";
import { CommandHandler, Handle, Teardown } from "./server-commands-config";
import * as Danbooru from "danbooru";
import * as GoogleSearch from "image-search-google";
import Axios from "axios";

@CommandHandler
@injectable()
export class ServerImageService {
  private danbooru: Danbooru;
  private sankaku: Danbooru;
  private google: GoogleSearch;
  private imageBombAmount = 3;

  constructor() {
    this.danbooru = new Danbooru(process.env.DANBOORU_USERNAME + ":" + process.env.DANBOORU_APIKEY);
    this.sankaku = new Danbooru("capi-beta.sankakucomplex.com");
    this.google = new GoogleSearch(process.env.GOOGLE_CSE, process.env.GOOGLE_APIKEY);
  }

  public getPost = async (search: string, site: Danbooru) => {
    const post =
      search == undefined
        ? await site.get("/posts/random")
        : await site.get("/posts/random", { tags: search });
    return post;
  };

  public getGoogleImageSearch = async search => {
    const randomPage = Math.floor(Math.random() * 5) + 1;
    const searchResults = await this.google.search(search, { page: randomPage });
    const randomResult = Math.floor(Math.random() * searchResults.length);
    const randomPost = searchResults[randomResult];

    console.log(randomPost);
    return randomPost;
  };

  public buildEmbed = (color, description, author, image, footer): MessageEmbed => {
    const embed = new MessageEmbed();
    embed.setColor(color);
    embed.setDescription(description);
    embed.setAuthor(author.name, author.iconUrl, author.url);
    embed.setImage(image);
    embed.setFooter(footer);
    return embed;
  };

  public createEmbed = async (message, site) => {
    let post;
    let imageURL = "";
    let tags = message.content.includes(" ")
      ? message.content.substring(message.content.indexOf(" ") + 1)
      : undefined;

    switch (site) {
      case "d":
        tags =
          tags === undefined
            ? "rating:safe"
            : !tags.includes("rating:")
            ? tags + " rating:safe"
            : tags;
        post = await this.getPost(tags, this.danbooru);
        imageURL = this.danbooru.url(post.file_url).href;
        if (imageURL === "https://danbooru.donmai.us/")
          return this.buildEmbed(0xff0000, "Error: No image found", "ExileTF2Bot", null, null);

        console.log(post);
        return this.buildEmbed(
          0x00ff00,
          "",
          {
            name: post.tag_string_artist,
            iconUrl: null,
            url: `https://danbooru.donmai.us/posts?tags=${post.tag_string_artist}`,
          },
          imageURL,
          "Danbooru"
        );
      case "s":
        tags =
          tags === undefined
            ? "rating:safe"
            : !tags.includes("rating:")
            ? tags + " rating:safe"
            : tags;
        post = await this.getPost(tags, this.sankaku);
        imageURL = this.sankaku.url(post.file_url).href;
        if (imageURL === "https://danbooru.donmai.us/")
          return this.buildEmbed(0xff0000, "Error: No image found", "ExileTF2Bot", null, null);

        return this.buildEmbed(
          0x00ff00,
          "",
          {
            name: post.tag_string_artist,
            iconUrl: null,
            url: `https://chan.sankakucomplex.com/?tags=${post.tag_string_artist}`,
          },
          imageURL,
          "Sankaku"
        );
      default:
        post = await this.getGoogleImageSearch(tags);
        return this.buildEmbed(
          0x00ff00,
          "",
          {
            name: "Google Images",
            iconUrl: null,
            url: post.context,
          },
          post.url,
          post.snippet
        );
    }
  };

  @Handle("!dimg")
  public handleDanbooruImageRequest = async (message: Message): Promise<MessageEmbedResponse[]> => {
    const danbooruImageList: MessageEmbedResponse[] = [];
    danbooruImageList.push(new MessageEmbedResponse(await this.createEmbed(message, "d"), false));
    return danbooruImageList;
  };

  @Handle("!simg")
  public handleSankakuImageRequest = async (message: Message): Promise<MessageEmbedResponse[]> => {
    const sankakuImageList: MessageEmbedResponse[] = [];
    sankakuImageList.push(new MessageEmbedResponse(await this.createEmbed(message, "s"), false));
    return sankakuImageList;
  };

  @Handle("!dimgbomb")
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

  @Handle("!simgbomb")
  public handleSankakuImageBombRequest = async (
    message: Message
  ): Promise<MessageEmbedResponse[]> => {
    const sankakuImageList: MessageEmbedResponse[] = [];
    for (let i = 0; i < this.imageBombAmount; i++) {
      sankakuImageList.push(new MessageEmbedResponse(await this.createEmbed(message, "s"), false));
    }
    return sankakuImageList;
  };

  @Handle("!rimg")
  public handleRandomImageRequest = async (message: Message): Promise<MessageEmbedResponse[]> => {
    const imageList: MessageEmbedResponse[] = [];
    imageList.push(new MessageEmbedResponse(await this.createEmbed(message, null), false));
    return imageList;
  };

  @Handle("!gray")
  public handleGrayImageRequest = async (message: Message): Promise<MessageResponse> => {
    const rootURL = process.env.EXILETF2_ROOT_API;
    const extension = "images";
    const modifier = "grayScale";
    let response: any;

    try {
      const imageURL = message.content.includes("http")
        ? message.content.substring(message.content.indexOf(" ") + 1)
        : (message.attachments as any).first().url;
      response = await Axios({
        method: "POST",
        url: rootURL + extension,
        responseType: "stream",
        data: { image_url: imageURL, image_file: null, modifier: modifier },
      });
    } catch (err) {
      return new MessageResponse("Image is invalid", false);
    }

    const filename = response.headers["content-disposition"].split("=")[1];
    return new MessageResponse(new MessageAttachment(response.data, filename), false);
  };
}
