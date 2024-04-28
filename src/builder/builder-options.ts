import type { ClassTransformOptions } from 'class-transformer';
import type { ValidatorOptions } from 'class-validator';
import * as deepMerge from 'deepmerge';
import { CONFIG_SOURCE } from './config-sources';

export type BuildConfigOptions = {
  sourcesPriority?: CONFIG_SOURCE[];
  ymlFiles?: string[];
  envFiles?: string[];
  loadEnvFiles?: boolean;
  topLevelPrefix?: string;
  throwOnValidatonError?: boolean;
  throwIfYmlNotExist?: boolean;
  throwIfEnvFileNotExist?: boolean;
  classValidatorOptions?: ValidatorOptions;
  classTransformerOptions?: ClassTransformOptions;
};

export const defaultBuildConfigOpts: BuildConfigOptions = {
  sourcesPriority: [CONFIG_SOURCE.YAML, CONFIG_SOURCE.ENV, CONFIG_SOURCE.CLI],
  throwOnValidatonError: true,
  throwIfYmlNotExist: false,
  throwIfEnvFileNotExist: false,
  topLevelPrefix: undefined,
  ymlFiles: [],
  envFiles: [],
  loadEnvFiles: false,
  classValidatorOptions: {
    skipMissingProperties: false,
  },
  classTransformerOptions: {
    exposeDefaultValues: true,
  },
};

export const mergeOptionsWithDefault = (
  options: BuildConfigOptions,
): BuildConfigOptions => {
  return deepMerge(defaultBuildConfigOpts, options, {
    clone: true,
    arrayMerge: (_, source) => {
      return source;
    },
  });
};
