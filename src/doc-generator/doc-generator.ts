import { writeFileSync } from 'fs';
import type { ConfigSchema } from '../compiler/compiler';
import { compileConfig } from '../compiler/compiler';
import { CONFIG_SOURCE } from '../compiler/config-sources';

export enum DOC_FORMAT {
  MARKDOWN = 'markdown',
}

export type GenerateConfigDocOptions = {
  format: DOC_FORMAT;
};

const generateMdDoc = (schema: ConfigSchema) => {
  let doc = '';

  for (const [, propertySchema] of Object.entries(schema)) {
    if (
      propertySchema.children !== undefined &&
      Object.keys(propertySchema.children).length > 0
    ) {
      doc += generateMdDoc(propertySchema.children);
    } else if (propertySchema.schema !== undefined) {
      doc += `**${propertySchema.schema[CONFIG_SOURCE.ENV]}**: env\n\n`;
    }
  }

  return doc;
};

export const generateConfigDoc = async <T extends object>(
  target: new () => T,
  opts: GenerateConfigDocOptions = {
    format: DOC_FORMAT.MARKDOWN,
  },
) => {
  const { configSchema } = await compileConfig(target, {
    throwOnValidatonError: false,
  });

  const md = generateMdDoc(configSchema);
  const complete = `# Turbo config\n\n${md}`;
  writeFileSync('DOC.md', complete, 'utf-8');
};
