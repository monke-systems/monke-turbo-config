import type { ClassConstructor } from 'class-transformer';
import {
  addToPropertiesList,
  cliKeySymbol,
  envKeySymbol,
  genericKeySymbol,
  nestedKeySymbol,
  optionalConfigFieldKey,
  yamlKeySymbol,
} from './metadata';

export const GenericKey = (key: string): PropertyDecorator => {
  return (target: object, property: string | symbol) => {
    Reflect.defineMetadata(genericKeySymbol, key, target, property);

    addToPropertiesList(target, property.toString());
  };
};

export const ConfigFieldOptional = (): PropertyDecorator => {
  return (target: object, property: string | symbol) => {
    Reflect.defineMetadata(optionalConfigFieldKey, true, target, property);

    addToPropertiesList(target, property.toString());
  };
};

export const NestedKey = (
  key: string,
  configClass: ClassConstructor<object>,
): PropertyDecorator => {
  return (target: object, property: string | symbol) => {
    Reflect.defineMetadata(
      nestedKeySymbol,
      { key, configClass },
      target,
      property,
    );

    addToPropertiesList(target, property.toString());
  };
};

export const EnvKey = (key: string): PropertyDecorator => {
  return (target: object, property: string | symbol) => {
    Reflect.defineMetadata(envKeySymbol, key, target, property);

    addToPropertiesList(target, property.toString());
  };
};

export const YamlKey = (key: string): PropertyDecorator => {
  return (target: object, property: string | symbol) => {
    Reflect.defineMetadata(yamlKeySymbol, key, target, property);

    addToPropertiesList(target, property.toString());
  };
};

export const CliKey = (key: string): PropertyDecorator => {
  return (target: object, property: string | symbol) => {
    Reflect.defineMetadata(cliKeySymbol, key, target, property);

    addToPropertiesList(target, property.toString());
  };
};
