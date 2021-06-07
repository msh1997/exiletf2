import "reflect-metadata";
import { COMMANDS } from "./server-commands-list";

export const Handle = metaValue => {
  return Reflect.metadata("handle", metaValue);
};

export const Teardown = metaValue => {
  return Reflect.metadata("teardown", metaValue);
};

export const CommandHandler = <T extends { new (...args: any[]): {} }>(Base: T) => {
  return class extends Base {
    constructor(...args: any[]) {
      super(...args);
      for (const functionName in this) {
        if (Reflect.getMetadata("handle", this, functionName)) {
          console.log(Reflect.getMetadata("handle", this, functionName));
          COMMANDS[Reflect.getMetadata("handle", this, functionName)].handler = this[functionName];
        }
        if (Reflect.getMetadata("teardown", this, functionName)) {
          console.log(Reflect.getMetadata("teardown", this, functionName));
          COMMANDS[Reflect.getMetadata("teardown", this, functionName)].teardown =
            this[functionName];
        }
      }
    }
  };
};
