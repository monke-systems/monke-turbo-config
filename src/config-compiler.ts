import 'reflect-metadata';
import type { ClassConstructor } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { envKeySymbol } from './decorators/decorators';
import { getPropertiesList } from './decorators/metadata';

export const compileConfig = <T extends ClassConstructor<object>>(
  configClass: T,
): T => {
  // eslint-disable-next-line new-cap
  const instance = new configClass();
  const configProperties = getPropertiesList(instance);

  const rawConfig: Record<string, string | undefined> = {};

  for (const key of configProperties) {
    const envKey = Reflect.getMetadata(envKeySymbol, instance, key);

    if (envKey !== undefined) {
      rawConfig[key] = process.env[envKey];
    }
  }

  const instanceOfConfig = plainToInstance(
    configClass,
    rawConfig,
  ) as unknown as T;

  const errors = validateSync(instanceOfConfig, {
    skipMissingProperties: false,
  });

  console.log(errors);

  return instanceOfConfig;
};
