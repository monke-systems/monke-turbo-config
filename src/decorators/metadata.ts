import type { ClassConstructor } from 'class-transformer';
import { TurboConfigCompileError } from '../errors';

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

export const getPropertyType = (target: object, propertyName: string): any => {
  const type = Reflect.getMetadata('design:type', target, propertyName);

  if (type === undefined) {
    throw new TurboConfigCompileError(
      `Can not detect field type. Does you enabled "emitDecoratorMetadata" option in tsconfig?`,
    );
  }

  return type;
};
