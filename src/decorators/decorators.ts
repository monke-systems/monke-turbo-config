import type { ClassConstructor } from 'class-transformer';
import {
  addToPropertiesList,
  genericKeySymbol,
  yamlKeySymbol,
  envKeySymbol,
  cliKeySymbol,
  nestedKeySymbol,
} from './metadata';

export const GenericKey = (key: string) => {
  return (target: object, property: string) => {
    Reflect.defineMetadata(genericKeySymbol, key, target, property);

    addToPropertiesList(target, property);
  };
};

export const NestedKey = (
  key: string,
  configClass: ClassConstructor<object>,
) => {
  return (target: object, property: string) => {
    Reflect.defineMetadata(
      nestedKeySymbol,
      { key, configClass },
      target,
      property,
    );

    addToPropertiesList(target, property);
  };
};

export const EnvKey = (key: string) => {
  return (target: object, property: string) => {
    Reflect.defineMetadata(envKeySymbol, key, target, property);

    addToPropertiesList(target, property);
  };
};

export const YamlKey = (key: string) => {
  return (target: object, property: string) => {
    Reflect.defineMetadata(yamlKeySymbol, key, target, property);

    addToPropertiesList(target, property);
  };
};

export const CliKey = (key: string) => {
  return (target: object, property: string) => {
    Reflect.defineMetadata(cliKeySymbol, key, target, property);

    addToPropertiesList(target, property);
  };
};
