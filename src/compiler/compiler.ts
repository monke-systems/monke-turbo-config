import * as fs from 'fs';
import { promisify } from 'util';
import type { ClassConstructor } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import type { ValidationError } from 'class-validator';
import { validateSync } from 'class-validator';
import * as deepMerge from 'deepmerge';
import 'reflect-metadata';
import * as YAML from 'yaml';
import { CONFIG_SOURCE } from '../config-sources/config-sources';
import {
  getPropertiesList,
  getPropertyConfigKeysMap,
  getPropertyGenericKey,
  getPropertyNestedKey,
} from '../decorators/metadata';
import { TurboConfigCompileError } from '../errors';
import { getByKeyPath } from '../utils/get-by-key-path';
import type { CompileConfigOptions } from './compiler-options';
import { mergeOptionsWithDefault } from './compiler-options';
import { getConfigKeyByGenericKey } from './keys-convert';

const readFile = promisify(fs.readFile);

type ValuesBySource = {
  [key in CONFIG_SOURCE]: unknown;
};

export type CompileResult<T> = {
  config: T;
  validationErrors: ValidationError[];
};

const getValueBySourcePriority = (
  values: ValuesBySource,
  priority: CONFIG_SOURCE[],
): unknown => {
  const latestDefined = priority.reverse().find((priority) => {
    return values[priority] !== undefined;
  });

  if (latestDefined === undefined) {
    return undefined;
  }

  return values[latestDefined];
};

type PropertiesMap = Record<
  string,
  {
    [key in CONFIG_SOURCE]?: string;
  }
>;

export const buildPropertiesMap = (
  target: ClassConstructor<object>,
  opts: CompileConfigOptions = {},
): PropertiesMap => {
  // eslint-disable-next-line new-cap
  const instance = new target();
  const configProperties = getPropertiesList(instance);

  const map: PropertiesMap = {};

  for (const property of configProperties) {
    if (
      opts.disallowGenericKeys! &&
      getPropertyGenericKey(instance, property) !== undefined
    ) {
      throw new TurboConfigCompileError(
        `Found generic key on property '${property}'. Generic keys is disabled by compile options`,
      );
    }

    const configKeysMap = getPropertyConfigKeysMap(instance, property);

    map[property] = configKeysMap;
  }

  return map;
};

const buildRawConfig = <T extends ClassConstructor<object>>(
  target: T,
  yml: any,
  opts: CompileConfigOptions = {},
  nestedKeyPrefix = '',
) => {
  // eslint-disable-next-line new-cap
  const instance = new target();
  const configProperties = getPropertiesList(instance);

  const rawConfig: Record<string, unknown> = {};

  for (const key of configProperties) {
    const nestedKey = getPropertyNestedKey(instance, key);

    if (nestedKey !== undefined) {
      const nested = buildRawConfig(
        nestedKey.configClass,
        yml,
        opts,
        `${nestedKeyPrefix}.${nestedKey.key}`,
      );
      rawConfig[key] = nested;
    }

    const genericKey = getPropertyGenericKey(instance, key);

    if (genericKey !== undefined) {
      const envVal =
        process.env[
          getConfigKeyByGenericKey(
            `${nestedKeyPrefix}.${genericKey}`,
            CONFIG_SOURCE.ENV,
          )
        ];

      const yamlVal = getByKeyPath(
        yml,
        getConfigKeyByGenericKey(
          `${nestedKeyPrefix}.${genericKey}`,
          CONFIG_SOURCE.YAML,
        ),
      );

      const prioritizedValue = getValueBySourcePriority(
        {
          [CONFIG_SOURCE.ENV]: envVal,
          [CONFIG_SOURCE.YAML]: yamlVal,
          [CONFIG_SOURCE.CLI]: undefined,
        },
        opts.sourcesPriority!,
      );

      rawConfig[key] = prioritizedValue;
    }
  }

  return rawConfig;
};

export const compileConfig = async <T extends ClassConstructor<object>>(
  configClass: T,
  opts: CompileConfigOptions = {},
): Promise<CompileResult<T>> => {
  const mergedOpts = mergeOptionsWithDefault(opts);

  const readTasks = mergedOpts.ymlFiles!.map(async (filePath) => {
    const file = await readFile(filePath, 'utf-8');
    return YAML.parse(file);
  });

  const yamls = await Promise.all(readTasks);

  const mergedYaml = yamls.reduce((accum, value) => {
    return deepMerge(accum, value);
  }, {});

  const rawConfig = buildRawConfig(configClass, mergedYaml, mergedOpts);

  const instanceOfConfig = plainToInstance(configClass, rawConfig, {
    exposeDefaultValues: true,
  }) as unknown as T;

  const errors = validateSync(
    instanceOfConfig,
    mergedOpts.classValidatorOptions,
  );

  if (mergedOpts.throwOnValidatonError === true && errors.length !== 0) {
    throw new TurboConfigCompileError(
      `\n${errors.map((e) => e.toString()).join('\n')}`,
    );
  }

  return {
    config: instanceOfConfig,
    validationErrors: errors,
  };
};
