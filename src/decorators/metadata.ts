import type { ClassConstructor } from 'class-transformer';
import { TurboConfigBuildError } from '../errors';

const turboConfigPropertiesSymbol = Symbol('turboConifgProperties');

export const genericKeySymbol = Symbol('turboConfigGenericKey');
export const nestedKeySymbol = Symbol('turboConfigNestedKey');
export const yamlKeySymbol = Symbol('turboConfigYamlKey');
export const envKeySymbol = Symbol('turboConfigEnvKey');
export const cliKeySymbol = Symbol('turboConfigCliKey');
export const prefixSymbol = Symbol('turboConfigPrefix');
export const optionalConfigFieldKey = Symbol('turboConfigOptional');

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

export const getPropertyEnvKey = (
  target: object,
  propertyName: string,
): string | undefined => {
  return Reflect.getMetadata(envKeySymbol, target, propertyName);
};

export const getPropertyYamlKey = (
  target: object,
  propertyName: string,
): string | undefined => {
  return Reflect.getMetadata(yamlKeySymbol, target, propertyName);
};

export const getPropertyCliKey = (
  target: object,
  propertyName: string,
): string | undefined => {
  return Reflect.getMetadata(cliKeySymbol, target, propertyName);
};

export const getClassConfigPrefix = (target: object): string | undefined => {
  return Reflect.getMetadata(prefixSymbol, target);
};

export const getPropertyIsOptional = (
  target: object,
  propertyName: string,
): boolean => {
  return (
    Reflect.getMetadata(optionalConfigFieldKey, target, propertyName) !==
    undefined
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getPropertyType = (target: object, propertyName: string): any => {
  const type = Reflect.getMetadata('design:type', target, propertyName);

  if (type === undefined) {
    throw new TurboConfigBuildError(
      `Can not detect ${propertyName} field type. Does you enabled "emitDecoratorMetadata" option in tsconfig?.
Also make sure there is no circular dependencies.`,
    );
  }

  return type;
};
