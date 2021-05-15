import "reflect-metadata";
import {Container, interfaces} from "inversify";
import {TYPES} from "./types";
import {Bot} from "./bot";
import {Client} from "discord.js";
import { MessageHandler } from "./services/message-handler";
import { DBManager } from "./db";
import { MiddleFingerRemover } from "./services/message-handlers/middle-finger-remover";
import { CommandsService } from "./services/message-handlers/commands-service";

let container = new Container();

container.bind<DBManager>(TYPES.DBManager).to(DBManager).inSingletonScope();
container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.BOT_TOKEN);
container.bind<MessageHandler>(TYPES.MessageHandler).to(MessageHandler).inSingletonScope();
container.bind<MiddleFingerRemover>(TYPES.MiddleFingerRemover).to(MiddleFingerRemover).inSingletonScope();
container.bind<CommandsService>(TYPES.CommandsService).to(CommandsService).inSingletonScope();

export default container;