import * as deepMerge from 'deepmerge';

export enum DOC_FORMAT {
  MARKDOWN = 'markdown',
}

export type GenerateConfigDocOptions = {
  title?: string;
  writeToFile?: string;
  format?: DOC_FORMAT;
};

export const defaultGenerateConfigDocOptions: GenerateConfigDocOptions = {
  title: 'Config reference',
  writeToFile: undefined,
  format: DOC_FORMAT.MARKDOWN,
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
