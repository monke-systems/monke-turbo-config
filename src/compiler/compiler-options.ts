import type { ValidatorOptions } from 'class-validator';
import * as deepMerge from 'deepmerge';
import { CONFIG_SOURCE } from '../config-sources/config-sources';

export type CompileConfigOptions = {
  sourcesPriority?: CONFIG_SOURCE[];
  ymlFiles?: string[];
  throwOnValidatonError?: boolean;
  disallowGenericKeys?: boolean;
  classValidatorOptions?: ValidatorOptions;
};

export const defaultCompileConfigOpts: CompileConfigOptions = {
  sourcesPriority: [CONFIG_SOURCE.YAML, CONFIG_SOURCE.ENV, CONFIG_SOURCE.CLI],
  throwOnValidatonError: true,
  ymlFiles: [],
  disallowGenericKeys: false,
  classValidatorOptions: {
    skipMissingProperties: false,
  },
};

export const mergeOptionsWithDefault = (
  options: CompileConfigOptions,
): CompileConfigOptions => {
  return deepMerge(defaultCompileConfigOpts, options);
};
