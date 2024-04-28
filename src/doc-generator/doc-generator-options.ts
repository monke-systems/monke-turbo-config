import * as deepMerge from 'deepmerge';
import { CONFIG_SOURCE } from '../builder/config-sources';

export enum DOC_FORMAT {
  MARKDOWN = 'markdown',
}

export type GenerateConfigDocOptions = {
  title?: string;
  writeToFile?: string;
  format?: DOC_FORMAT;
  keysType?: CONFIG_SOURCE;
};

export const defaultGenerateConfigDocOptions: GenerateConfigDocOptions = {
  title: 'Turbo config',
  writeToFile: undefined,
  format: DOC_FORMAT.MARKDOWN,
  keysType: CONFIG_SOURCE.ENV,
};

export const mergeDocOptionsWithDefault = (
  options: GenerateConfigDocOptions,
): GenerateConfigDocOptions => {
  return deepMerge(defaultGenerateConfigDocOptions, options, {
    clone: true,
    arrayMerge: (_, source) => {
      return source;
    },
  });
};
