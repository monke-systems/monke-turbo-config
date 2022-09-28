import { prefixSymbol } from './metadata';

export const ConfigPrefix = (prefix: string): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(prefixSymbol, prefix, target);
  };
};
