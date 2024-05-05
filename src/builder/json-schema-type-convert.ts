import type { JSONSchema7TypeName } from 'json-schema';
import { TurboConfigBuildError } from '../errors';

export const jsonSchemaTypeConvert = (value: unknown): JSONSchema7TypeName => {
  if (value === String) {
    return 'string';
  } else if (value === Number) {
    return 'number';
  } else if (value === Boolean) {
    return 'boolean';
  } else if (value === Array) {
    return 'array';
  } else {
    throw new TurboConfigBuildError(
      `[json-schema-generator] Unknown type ${typeof value}`,
    );
  }
};
