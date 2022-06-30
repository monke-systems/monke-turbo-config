import type { ClassConstructor } from 'class-transformer';
import { getConfigKeyByGenericKey } from '../compiler/keys-convert';
import { CONFIG_SOURCE } from '../config-sources/config-sources';

const turboConfigPropertiesSymbol = Symbol('turboConifgProperties');

export const genericKeySymbol = Symbol('turboConfigGenericKey');
export const nestedKeySymbol = Symbol('turboConfigNestedKey');
export const yamlKeySymbol = Symbol('turboConfigYamlKey');
export const envKeySymbol = Symbol('turboConfigEnvKey');
export const cliKeySymbol = Symbol('turboConfigCliKey');

export const addToPropertiesList = (target: object, propertyName: string) => {
  // get own fields from the target
  let complexFields = Reflect.getOwnMetadata(
    turboConfigPropertiesSymbol,
    target,
  ) as string[];
  if (complexFields === undefined) {
    // merge with inherited fields, if available.
    complexFields = Reflect.hasMetadata(turboConfigPropertiesSymbol, target)
      ? Reflect.getMetadata(turboConfigPropertiesSymbol, target).slice(0)
      : [];

    // define own fields on the target
    Reflect.defineMetadata(turboConfigPropertiesSymbol, complexFields, target);
  }

  if (!complexFields.includes(propertyName)) {
    complexFields.push(propertyName);
  }
};

export const getPropertiesList = (target: object): string[] => {
  return Reflect.getMetadata(turboConfigPropertiesSymbol, target) ?? [];
};

export const getPropertyGenericKey = (
  target: object,
  propertyName: string,
): string | undefined => {
  return Reflect.getMetadata(genericKeySymbol, target, propertyName);
};

export const getPropertyNestedKey = (
  target: object,
  propertyName: string,
): { key: string; configClass: ClassConstructor<object> } | undefined => {
  return Reflect.getMetadata(nestedKeySymbol, target, propertyName);
};

export const getPropertyConfigKeysMap = (
  target: object,
  propertyName: string,
): {
  [key in CONFIG_SOURCE]: string | undefined;
} => {
  const base = {
    [CONFIG_SOURCE.YAML]: Reflect.getMetadata(
      yamlKeySymbol,
      target,
      propertyName,
    ),
    [CONFIG_SOURCE.ENV]: Reflect.getMetadata(
      envKeySymbol,
      target,
      propertyName,
    ),
    [CONFIG_SOURCE.CLI]: Reflect.getMetadata(
      cliKeySymbol,
      target,
      propertyName,
    ),
  };

  const genericKey = getPropertyGenericKey(target, propertyName);

  if (genericKey !== undefined) {
    const res = Object.entries(base).reduce<Record<string, string>>(
      (accum, [key, value]) => {
        if (value === undefined) {
          accum[key] = getConfigKeyByGenericKey(
            genericKey,
            key as CONFIG_SOURCE,
          );
          return accum;
        }

        accum[key] = value;
        return accum;
      },
      {},
    );

    console.log(res);

    // @ts-expect-error asd
    return res;
  }

  return base;
};
