import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";
import { Bot } from "./bot";
import { Client } from "discord.js";
import { MessageHandler } from "./services/message-handler";
import { DBManager } from "./db";
import { MiddleFingerRemover } from "./services/middle-finger-remover";
import { CommandsService } from "./services/server-command-handlers/custom-commands-service";
import { MessageStatsService } from "./services/server-command-handlers/message-stats-service";
import { ChannelPermissionsService } from "./services/server-command-handlers/channel-permissions-service";
import { ServerImageService } from "./services/server-command-handlers/server-image-service";
import { WolframQueryService } from "./services/server-command-handlers/wolfram-query-service";
import { CommandsHelpService } from "./services/server-command-handlers/commands-help-service";

const container = new Container();

container.bind<DBManager>(TYPES.DBManager).to(DBManager).inSingletonScope();
container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.BOT_TOKEN);
container.bind<string>(TYPES.Environment).toConstantValue(process.env.ENVIRONMENT);
container.bind<MessageHandler>(TYPES.MessageHandler).to(MessageHandler).inSingletonScope();
container
  .bind<MiddleFingerRemover>(TYPES.MiddleFingerRemover)
  .to(MiddleFingerRemover)
  .inSingletonScope();
container.bind<CommandsService>(TYPES.CommandsService).to(CommandsService).inSingletonScope();
container
  .bind<MessageStatsService>(TYPES.MessageStatsService)
  .to(MessageStatsService)
  .inSingletonScope();
container
  .bind<ChannelPermissionsService>(TYPES.ChannelPermissionsService)
  .to(ChannelPermissionsService)
  .inSingletonScope();
container
  .bind<ServerImageService>(TYPES.ServerImageService)
  .to(ServerImageService)
  .inSingletonScope();
container
  .bind<WolframQueryService>(TYPES.WolframQueryService)
  .to(WolframQueryService)
  .inSingletonScope();
container
  .bind<CommandsHelpService>(TYPES.CommandsHelpService)
  .to(CommandsHelpService)
  .inSingletonScope();

export default container;
