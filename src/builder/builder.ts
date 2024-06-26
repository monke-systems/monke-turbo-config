import * as fs from 'fs';
import { promisify } from 'util';
import { plainToInstance } from 'class-transformer';
import type { ValidationError } from 'class-validator';
import { validateSync } from 'class-validator';
import * as deepMerge from 'deepmerge';
import * as dotenv from 'dotenv';
import type { JSONSchema7 } from 'json-schema';
import * as yaml from 'yaml';
import * as yargs from 'yargs-parser';
import {
  getClassConfigPrefix,
  getPropertiesList,
  getPropertyCliKey,
  getPropertyEnvKey,
  getPropertyGenericKey,
  getPropertyIsOptional,
  getPropertyNestedKey,
  getPropertyType,
  getPropertyYamlKey,
} from '../decorators/metadata';
import { TurboConfigBuildError, TurboConfigValidationErr } from '../errors';
import { getByKeyPath } from '../utils/get-by-key-path';
import { isError, isNodeJsError } from '../utils/ts-type-guards';
import type { BuildConfigOptions } from './builder-options';
import { mergeOptionsWithDefault } from './builder-options';
import { CONFIG_SOURCE } from './config-sources';
import { jsonSchemaTypeConvert } from './json-schema-type-convert';
import {
  createKeyFromSegments,
  getConfigKeyByGenericKey,
} from './keys-convert';

const readFile = promisify(fs.readFile);

type ValuesBySource = {
  [key in CONFIG_SOURCE]: unknown;
};

export type BuildResult<T> = {
  config: T;
  jsonSchema: JSONSchema7;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key in CONFIG_SOURCE]: any;
};

type RawConfig = {
  jsonSchema: JSONSchema7;
  rawFields: Record<string, unknown>;
};

const buildRawConfig = <T extends object>(
  target: new () => T,
  sources: ResolvedSources,
  opts: BuildConfigOptions = {},
  nestedKeyPrefix?: string,
): RawConfig => {
  // eslint-disable-next-line new-cap
  const instance = new target();
  const classPrefix = getClassConfigPrefix(target);
  const configProperties = getPropertiesList(instance);

  const rawConfig: Record<string, unknown> = {};

  const jsonSchema: JSONSchema7 = {
    type: 'object',
    properties: {},
    required: [],
  };

  let jsonSchemaToFill = jsonSchema;

  if (classPrefix !== undefined) {
    jsonSchema.properties![classPrefix] = {
      type: 'object',
      properties: {},
      required: [],
    };

    jsonSchema.required = [classPrefix];

    jsonSchemaToFill = jsonSchema.properties![classPrefix]! as JSONSchema7;
  }

  for (const propertyName of configProperties) {
    const nestedKey = getPropertyNestedKey(instance, propertyName);

    if (nestedKey !== undefined) {
      const nested = buildRawConfig(
        nestedKey.configClass,
        sources,
        opts,
        createKeyFromSegments(nestedKeyPrefix, classPrefix, nestedKey.key),
      );

      if (nested.rawFields !== undefined) {
        rawConfig[propertyName] = nested.rawFields;
      }

      jsonSchemaToFill.properties![propertyName] = {
        type: 'object',
        properties: nested.jsonSchema.properties,
        required: nested.jsonSchema.required,
      };

      jsonSchemaToFill.required!.push(propertyName);

      continue;
    }

    const genericKey = getPropertyGenericKey(instance, propertyName);

    const envKey =
      getPropertyEnvKey(instance, propertyName) ??
      getConfigKeyByGenericKey(
        createKeyFromSegments(nestedKeyPrefix, classPrefix, genericKey),
        CONFIG_SOURCE.ENV,
      );

    const yamlKey =
      getPropertyYamlKey(instance, propertyName) ??
      getConfigKeyByGenericKey(
        createKeyFromSegments(nestedKeyPrefix, classPrefix, genericKey),
        CONFIG_SOURCE.YAML,
      );

    const cliKey =
      getPropertyCliKey(instance, propertyName) ??
      getConfigKeyByGenericKey(
        createKeyFromSegments(nestedKeyPrefix, classPrefix, genericKey),
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

    jsonSchemaToFill.properties![propertyName] = {};

    const valueType = getPropertyType(instance, propertyName);
    const jsonSchemaType = jsonSchemaTypeConvert(valueType);

    const schema: JSONSchema7 = {
      type: jsonSchemaType,
      // @ts-expect-error по спеке v7 разрешено добавлять любые поля
      configKeys: {
        env: envKey,
        yaml: yamlKey,
        cli: cliKey,
      },
    };

    const isOptional = getPropertyIsOptional(instance, propertyName);

    // @ts-expect-error надо
    if (!isOptional && instance[propertyName] === undefined) {
      jsonSchemaToFill.required!.push(propertyName);
    }

    // @ts-expect-error надо
    if (instance[propertyName] !== undefined) {
      // @ts-expect-error надо
      schema.default = instance[propertyName];
    }

    jsonSchemaToFill.properties![propertyName] = schema;
  }

  return { jsonSchema, rawFields: rawConfig };
};

export const buildConfigSync = <T extends object>(
  configClass: new () => T,
  opts: BuildConfigOptions = {},
): BuildResult<T> => {
  const mergedOpts = mergeOptionsWithDefault(opts);

  const yamls: object[] = [];

  for (const filePath of mergedOpts.ymlFiles!) {
    try {
      const file = fs.readFileSync(filePath, 'utf-8');

      const parsed = yaml.parse(file);

      yamls.push(parsed);
    } catch (e) {
      const shouldNotToThrow =
        !mergedOpts.throwIfYmlNotExist! &&
        isNodeJsError(e) &&
        e.code === 'ENOENT';

      if (!shouldNotToThrow) {
        if (isError(e)) {
          throw new TurboConfigBuildError(e.message);
        } else {
          throw e;
        }
      }
    }
  }

  const envs: Record<string, string>[] = [];

  if (mergedOpts.loadEnvFiles!) {
    for (const filePath of mergedOpts.envFiles!) {
      try {
        const file = fs.readFileSync(filePath, 'utf-8');
        const parsed = dotenv.parse(file);
        envs.push(parsed);
      } catch (e) {
        const shouldNotToThrow =
          !mergedOpts.throwIfEnvFileNotExist! &&
          isNodeJsError(e) &&
          e.code === 'ENOENT';

        if (!shouldNotToThrow) {
          if (isError(e)) {
            throw new TurboConfigBuildError(e.message);
          } else {
            throw e;
          }
        }
      }
    }
  }

  return buildConfigInternal(configClass, mergedOpts, yamls, envs);
};

export const buildConfig = async <T extends object>(
  configClass: new () => T,
  opts: BuildConfigOptions = {},
): Promise<BuildResult<T>> => {
  const mergedOpts = mergeOptionsWithDefault(opts);

  const yamls: object[] = [];

  for (const filePath of mergedOpts.ymlFiles!) {
    try {
      const file = await readFile(filePath, 'utf-8');

      const parsed = yaml.parse(file);

      yamls.push(parsed);
    } catch (e) {
      const shouldNotToThrow =
        !mergedOpts.throwIfYmlNotExist! &&
        isNodeJsError(e) &&
        e.code === 'ENOENT';

      if (!shouldNotToThrow) {
        if (isError(e)) {
          throw new TurboConfigBuildError(e.message);
        } else {
          throw e;
        }
      }
    }
  }

  const envs: Record<string, string>[] = [];

  if (mergedOpts.loadEnvFiles!) {
    for (const filePath of mergedOpts.envFiles!) {
      try {
        const file = await readFile(filePath, 'utf-8');
        const parsed = dotenv.parse(file);
        envs.push(parsed);
      } catch (e) {
        const shouldNotToThrow =
          !mergedOpts.throwIfEnvFileNotExist! &&
          isNodeJsError(e) &&
          e.code === 'ENOENT';

        if (!shouldNotToThrow) {
          if (isError(e)) {
            throw new TurboConfigBuildError(e.message);
          } else {
            throw e;
          }
        }
      }
    }
  }

  return buildConfigInternal(configClass, mergedOpts, yamls, envs);
};

const buildConfigInternal = <T extends object>(
  configClass: new () => T,
  opts: BuildConfigOptions,
  yamls: object[],
  envs: Record<string, string>[],
): BuildResult<T> => {
  const mergedYaml = yamls.reduce((accum, value) => {
    return deepMerge(accum, value);
  }, {});

  const mergedEnvsFromFiles = envs.reduce((accum, value) => {
    return deepMerge(accum, value);
  }, {});

  const mergedEnvs = deepMerge(mergedEnvsFromFiles, process.env);

  const parsedArgs = yargs(process.argv.slice(2));

  const { jsonSchema, rawFields } = buildRawConfig(
    configClass,
    {
      yaml: mergedYaml,
      env: mergedEnvs,
      cli: parsedArgs,
    },
    opts,
  );

  jsonSchema.$schema = 'http://json-schema.org/draft-07/schema#';

  const instanceOfConfig = plainToInstance(
    configClass,
    rawFields,
    opts.classTransformerOptions!,
  );

  const errors = validateSync(instanceOfConfig, opts.classValidatorOptions);

  if (opts.throwOnValidationError === true && errors.length !== 0) {
    throw new TurboConfigValidationErr(
      `\n${errors.map((e) => e.toString()).join('\n')}`,
    );
  }

  return {
    config: instanceOfConfig,
    validationErrors: errors,
    jsonSchema,
  };
};
