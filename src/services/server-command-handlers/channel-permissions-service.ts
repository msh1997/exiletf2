import { Message } from "discord.js";
import { inject, injectable } from "inversify";
import { Repository } from "typeorm";
import { DBManager } from "../../db";
import { ChannelPermissions } from "../../entity/ChannelPermissions";
import { TYPES } from "../../types";
import { MessageResponse } from "../message-handler";
import { CommandHandler, Handle } from "./server-commands-config";
import { COMMANDS } from "./server-commands-list";

@CommandHandler
@injectable()
export class ChannelPermissionsService {
  private channelPermissionsRepository: Repository<ChannelPermissions>;
  private permissionsHash = new Map();

  constructor(@inject(TYPES.DBManager) dbManager: DBManager) {
    dbManager.register(async (dbManager) => {
      this.channelPermissionsRepository =
        dbManager.getRepository(ChannelPermissions);
      const permissions = await this.channelPermissionsRepository.find();
      permissions.forEach((permission) => this.updateChannelPerms(permission));
    });
  }

  @Handle(COMMANDS.SetChannelPerm)
  public handleSetChannelPermRequest = async (
    message: Message
  ): Promise<MessageResponse> => {
    let permissions = message.content.split(" ")[1];
    if (!permissions) permissions = "";
    const existingPerms = await this.channelPermissionsRepository.findOne({
      channel: message.channel.id,
    });
    if (!existingPerms) {
      const channelPermissions = new ChannelPermissions();
      channelPermissions.guild = message.guild.id;
      channelPermissions.channel = message.channel.id;
      channelPermissions.canSend = permissions.includes("s");
      channelPermissions.canEdit = permissions.includes("e");
      this.channelPermissionsRepository.save(channelPermissions);
      this.updateChannelPerms(channelPermissions);
    } else {
      existingPerms.canSend = permissions.includes("s");
      existingPerms.canEdit = permissions.includes("e");
      this.channelPermissionsRepository.save(existingPerms);
      this.updateChannelPerms(existingPerms);
    }
    return Promise.resolve(
      new MessageResponse("Permissions set successfully.", false)
    );
  };

  public updateChannelPerms = (channelPermissions: ChannelPermissions) => {
    this.permissionsHash.set(channelPermissions.channel, channelPermissions);
  };

  public canSend = (message: Message) => {
    const permissions = this.permissionsHash.get(message.channel.id);
    return permissions === undefined || permissions.canSend;
  };

  public canEdit = (message: Message) => {
    const permissions = this.permissionsHash.get(message.channel.id);
    return permissions === undefined || permissions.canEdit;
  };
}
