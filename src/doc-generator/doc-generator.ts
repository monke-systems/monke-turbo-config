import { writeFile } from 'fs/promises';
import * as path from 'path';
import type { JSONSchema7 } from 'json-schema';
import { stringify } from 'yaml';
import type { GenerateConfigDocOptions } from './doc-generator-options';
import { mergeDocOptionsWithDefault } from './doc-generator-options';

export type TurboConfigDoc = {
  docText: string;
};

export const generateConfigDoc = async (
  schema: JSONSchema7,
  opts: GenerateConfigDocOptions = {},
): Promise<TurboConfigDoc> => {
  const mergedOptions = mergeDocOptionsWithDefault(opts);

  const docText = generateDoc(schema, mergedOptions.title!);

  if (mergedOptions.writeToFile !== undefined) {
    const fullFilePath = path.resolve(mergedOptions.writeToFile);

    await writeFile(fullFilePath, docText, 'utf-8');
  }

  return {
    docText,
  };
};

const generateDoc = (schema: JSONSchema7, title: string): string => {
  const example = generateExampleFromSchema(schema);
  const ymlDoc = stringify(example);

  const envs = collectEnvs(schema);

  return `# ${title}

## Yaml reference

\`\`\`yaml\n${ymlDoc}\n\`\`\`

## Env variables reference

${envs.join('\n\n')}
`;
};

const collectEnvs = (schema: JSONSchema7): string[] => {
  const envs: string[] = [];

  if (schema.type === 'object') {
    for (const key in schema.properties) {
      const innerSchema = schema.properties[key] as JSONSchema7;
      if ('configKeys' in innerSchema) {
        // @ts-expect-error выше чекнул
        const envKey = innerSchema.configKeys.env;

        envs.push(`${envKey}=${innerSchema.default ?? innerSchema.type}`);
      }
      envs.push(...collectEnvs(innerSchema));
    }
  }

  return envs;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateExampleFromSchema = (schema: JSONSchema7): any => {
  if (schema.type === 'object') {
    const obj: Record<string, unknown> = {};

    for (const key in schema.properties) {
      obj[key] = generateExampleFromSchema(
        schema.properties[key] as JSONSchema7,
      );
    }

    return obj;
  }

  switch (schema.type) {
    case 'array':
      return schema.default ?? [];
    case 'string':
      return schema.default ?? 'stringVal';
    case 'number':
      return schema.default ?? 98765;
    case 'boolean':
      return schema.default ?? true;
    default:
      return null;
  }
};
