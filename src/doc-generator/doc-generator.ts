import { writeFileSync } from 'fs';
import * as path from 'path';
import type { ConfigSchema } from '../builder/builder';
import { buildConfigSync } from '../builder/builder';
import { CONFIG_SOURCE } from '../builder/config-sources';
import type { GenerateConfigDocOptions } from './doc-generator-options';
import { mergeDocOptionsWithDefault } from './doc-generator-options';

const typeToStringMap = new Map();
typeToStringMap.set(String, 'string');
typeToStringMap.set(Number, 'number');
typeToStringMap.set(Boolean, 'boolean');
typeToStringMap.set(Array, 'array');

export type TurboConfigDoc = {
  doc: string;
};

const generateMdDoc = (
  schema: ConfigSchema,
  opts: GenerateConfigDocOptions,
) => {
  let doc = '';

  for (const [, propertySchema] of Object.entries(schema)) {
    if (
      propertySchema.children !== undefined &&
      Object.keys(propertySchema.children).length > 0
    ) {
      doc += generateMdDoc(propertySchema.children, opts);
    } else if (propertySchema.keys !== undefined) {
      const key = `${opts.keysType === CONFIG_SOURCE.CLI ? '--' : ''}${
        propertySchema.keys[opts.keysType!]
      }`;

      doc += `**${key}**: ${
        typeToStringMap.get(propertySchema.type) ?? 'unknown type'
      };`;

      doc +=
        propertySchema.defaultValue !== undefined
          ? ` *default ${propertySchema.defaultValue}*`
          : ` *required*`;

      doc += '\n\n';
    }
  }

  return doc;
};

export const generateConfigDoc = <T extends object>(
  target: new () => T,
  opts: GenerateConfigDocOptions = {},
): TurboConfigDoc => {
  const mergedOptions = mergeDocOptionsWithDefault(opts);

  const { configSchema } = buildConfigSync(target, {
    throwOnValidatonError: false,
  });

  const md = generateMdDoc(configSchema, mergedOptions);
  const complete = `# ${mergedOptions.title!}\n\n${md}`;

  if (mergedOptions.writeToFile !== undefined) {
    const fullFilePath = path.resolve(mergedOptions.writeToFile);

    writeFileSync(fullFilePath, complete, 'utf-8');

    console.log(`Generated doc file "${fullFilePath}"`);
  }

  return {
    doc: complete,
  };
};
