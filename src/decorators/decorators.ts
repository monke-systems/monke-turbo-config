import { addToPropertiesList } from './metadata';

export const envKeySymbol = Symbol('envKey');

export const EnvKey = (key: string) => {
  return (target: object, property: string) => {
    Reflect.defineMetadata(envKeySymbol, key, target, property);

    addToPropertiesList(target, property);
  };
};
