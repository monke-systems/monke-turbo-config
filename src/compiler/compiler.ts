import * as fs from 'fs';
import { promisify } from 'util';
import { plainToInstance } from 'class-transformer';
import type { ValidationError } from 'class-validator';
import { validateSync } from 'class-validator';
import * as deepMerge from 'deepmerge';
import * as YAML from 'yaml';
import * as yargs from 'yargs-parser';
import {
  getPropertiesList,
  getPropertyCliKey,
  getPropertyEnvKey,
  getPropertyGenericKey,
  getPropertyNestedKey,
  getPropertyYamlKey,
} from '../decorators/metadata';
import { TurboConfigCompileError, TurboConfigValidationErr } from '../errors';
import { getByKeyPath } from '../utils/get-by-key-path';
import { isError } from '../utils/ts-type-guards';
import type { CompileConfigOptions } from './compiler-options';
import { mergeOptionsWithDefault } from './compiler-options';
import { CONFIG_SOURCE } from './config-sources';
import { getConfigKeyByGenericKey } from './keys-convert';

const readFile = promisify(fs.readFile);

type ValuesBySource = {
  [key in CONFIG_SOURCE]: unknown;
};

export type ConfigSchemaEntry = {
  schema?: {
    [key in CONFIG_SOURCE]: string;
  };

  children?: Record<string, ConfigSchemaEntry>;
};

export type ConfigSchema = Record<string, ConfigSchemaEntry>;

export type CompileResult<T> = {
  config: T;
  configSchema: ConfigSchema;
  validationErrors: ValidationError[];
};

const getValueBySourcePriority = (
  values: ValuesBySource,
  priority: CONFIG_SOURCE[],
): unknown => {
  const latestDefined = priority
    .slice()
    .reverse()
    .find((priority) => {
      return values[priority] !== undefined;
    });

  if (latestDefined === undefined) {
    return undefined;
  }

  return values[latestDefined];
};

type ResolvedSources = {
  [key in CONFIG_SOURCE]: any;
};

type RawConfig = {
  schema: ConfigSchema;
  rawFields: Record<string, unknown>;
};

const buildRawConfig = <T extends object>(
  target: new () => T,
  sources: ResolvedSources,
  opts: CompileConfigOptions = {},
  nestedKeyPrefix = '',
): RawConfig => {
  // eslint-disable-next-line new-cap
  const instance = new target();
  const configProperties = getPropertiesList(instance);

  const rawConfig: Record<string, unknown> = {};
  const configSchema: ConfigSchema = {};

  for (const propertyName of configProperties) {
    const nestedKey = getPropertyNestedKey(instance, propertyName);

    if (nestedKey !== undefined) {
      const nested = buildRawConfig(
        nestedKey.configClass,
        sources,
        opts,
        `${nestedKeyPrefix}.${nestedKey.key}`,
      );
      rawConfig[propertyName] = nested.rawFields;
      configSchema[propertyName] = {
        children: nested.schema,
      };
      continue;
    }

    const genericKey = getPropertyGenericKey(instance, propertyName);

    const envKey =
      getPropertyEnvKey(instance, propertyName) ??
      getConfigKeyByGenericKey(
        `${nestedKeyPrefix}.${genericKey}`,
        CONFIG_SOURCE.ENV,
      );

    const yamlKey =
      getPropertyYamlKey(instance, propertyName) ??
      getConfigKeyByGenericKey(
        `${nestedKeyPrefix}.${genericKey}`,
        CONFIG_SOURCE.YAML,
      );

    const cliKey =
      getPropertyCliKey(instance, propertyName) ??
      getConfigKeyByGenericKey(
        `${nestedKeyPrefix}.${genericKey}`,
        CONFIG_SOURCE.CLI,
      );

    const envVal = sources.env[envKey];
    const yamlVal = getByKeyPath(sources.yaml, yamlKey);
    const cliVal = getByKeyPath(sources.cli, cliKey);

    const prioritizedValue = getValueBySourcePriority(
      {
        [CONFIG_SOURCE.ENV]: envVal,
        [CONFIG_SOURCE.YAML]: yamlVal,
        [CONFIG_SOURCE.CLI]: cliVal,
      },
      opts.sourcesPriority!,
    );

    rawConfig[propertyName] = prioritizedValue;
    configSchema[propertyName] = {
      schema: {
        env: envKey,
        yaml: yamlKey,
        cli: cliKey,
      },
    };
  }

  return { schema: configSchema, rawFields: rawConfig };
};

export const compileConfig = async <T extends object>(
  configClass: new () => T,
  opts: CompileConfigOptions = {},
): Promise<CompileResult<T>> => {
  const mergedOpts = mergeOptionsWithDefault(opts);

  const readTasks = mergedOpts.ymlFiles!.map(async (filePath) => {
    const file = await readFile(filePath, 'utf-8');
    return YAML.parse(file);
  });

  let yamls = [] as object[];
  try {
    yamls = await Promise.all(readTasks);
  } catch (e) {
    if (mergedOpts.throwIfYmlNotExist!) {
      if (isError(e)) {
        throw new TurboConfigCompileError(e.message);
      }
    }
  }

  const mergedYaml = yamls.reduce((accum, value) => {
    return deepMerge(accum, value);
  }, {});

  const parsedArgs = yargs(process.argv.slice(2));

  const { schema, rawFields } = buildRawConfig(
    configClass,
    {
      yaml: mergedYaml,
      env: process.env,
      cli: parsedArgs,
    },
    mergedOpts,
  );

  console.log(schema);

  const instanceOfConfig = plainToInstance(configClass, rawFields, {
    exposeDefaultValues: true,
  });

  const errors = validateSync(
    instanceOfConfig,
    mergedOpts.classValidatorOptions,
  );

  if (mergedOpts.throwOnValidatonError === true && errors.length !== 0) {
    throw new TurboConfigValidationErr(
      `\n${errors.map((e) => e.toString()).join('\n')}`,
    );
  }

  return {
    config: instanceOfConfig,
    validationErrors: errors,
    configSchema: schema,
  };
};
