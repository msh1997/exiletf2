import "reflect-metadata";
import {Container, interfaces} from "inversify";
import {TYPES} from "./types";
import {Bot} from "./bot";
import {Client} from "discord.js";
import { MessageResponder } from "./services/message-responder";
import { PingFinder } from "./services/ping-finder";
import { DBManager } from "./db";
import { EggFinder } from "./services/egg-finder";

let container = new Container();

container.bind<DBManager>(TYPES.DBManager).to(DBManager).inSingletonScope();
container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.BOT_TOKEN);
container.bind<MessageResponder>(TYPES.MessageResponder).to(MessageResponder).inSingletonScope();
container.bind<PingFinder>(TYPES.PingFinder).to(PingFinder).inSingletonScope();
container.bind<EggFinder>(TYPES.EggFinder).to(EggFinder).inSingletonScope();

export default container;