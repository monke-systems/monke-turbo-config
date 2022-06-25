import * as util from 'util';
import { CommonTransformerErr } from '../errors';

export const intParse = (
  value: unknown,
  throwOnNaN: boolean,
  radix: number,
): number => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseInt(value, radix);

    if (throwOnNaN && Number.isNaN(parsed)) {
      throw new CommonTransformerErr(
        `int parse error - value '${value}' parsed into NaN`,
      );
    }
    return parsed;
  }

  throw new CommonTransformerErr(
    `int parse error - cannot parse '${util.format(value)}' to int`,
  );
};

export const floatParse = (value: unknown, throwOnNaN: boolean): number => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);

    if (throwOnNaN && Number.isNaN(parsed)) {
      throw new CommonTransformerErr(
        `float parse error - value '${value}' parsed into NaN`,
      );
    }

    return parsed;
  }

  throw new CommonTransformerErr(
    `float parse error - cannot parse '${util.format(value)}' to float'`,
  );
};

export const booleanParse = (
  value: unknown,
  throwOnBadValue: boolean,
): boolean => {
  if (throwOnBadValue) {
    if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
      throw new CommonTransformerErr(
        `boolean parse error - '${value}' is not correct boolean value`,
      );
    }
  }

  return value === true || value === 'true';
};

export const arrayParse = (
  value: unknown,
  separator: string,
): unknown[] | string[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const splitted = value.split(separator);

    return splitted;
  }

  throw new CommonTransformerErr(
    `array parse error. value ${util.format(
      value,
    )} cannot be parsed into array`,
  );
};
