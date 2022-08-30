import type { ClassTransformOptions } from 'class-transformer';
import type { ValidatorOptions } from 'class-validator';
import * as deepMerge from 'deepmerge';
import { CONFIG_SOURCE } from './config-sources';

export type CompileConfigOptions = {
  sourcesPriority?: CONFIG_SOURCE[];
  ymlFiles?: string[];
  envFiles?: string[];
  loadEnvFiles?: boolean;
  throwOnValidatonError?: boolean;
  throwIfYmlNotExist?: boolean;
  throwIfEnvFileNotExist?: boolean;
  classValidatorOptions?: ValidatorOptions;
  classTransformerOptions?: ClassTransformOptions;
};

export const defaultCompileConfigOpts: CompileConfigOptions = {
  sourcesPriority: [CONFIG_SOURCE.YAML, CONFIG_SOURCE.ENV, CONFIG_SOURCE.CLI],
  throwOnValidatonError: true,
  throwIfYmlNotExist: false,
  throwIfEnvFileNotExist: false,
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
  options: CompileConfigOptions,
): CompileConfigOptions => {
  return deepMerge(defaultCompileConfigOpts, options, {
    clone: true,
    arrayMerge: (_, source) => {
      return source;
    },
  });
};
