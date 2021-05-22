import "reflect-metadata";

export const Handle = metaValue => {
  return Reflect.metadata("handle", metaValue);
};

export const CommandHandler = <T extends { new (...args: any[]): {} }>(Base: T) => {
  return class extends Base {
    constructor(...args: any[]) {
      super(...args);
      for (const functionName in this) {
        if (Reflect.getMetadata("handle", this, functionName)) {
          Reflect.getMetadata("handle", this, functionName).handler = this[functionName];
        }
      }
    }
  };
};
