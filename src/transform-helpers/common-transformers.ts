import type { ClassConstructor } from 'class-transformer';
import { plainToInstance, Transform } from 'class-transformer';
import { arrayParse, booleanParse, floatParse, intParse } from './parsers';

export type CommonTransformerArgs = {
  // Default true
  throwOnInvalidValue: boolean;
};

export type IntTransformerArgs = CommonTransformerArgs & {
  radix?: number;
};

export type PrimitiveTransformer =
  | typeof BooleanTransformer
  | typeof IntTransformer
  | typeof FloatTransformer;

export type ArrayTransformerArgs = CommonTransformerArgs & {
  // by default is ','
  separator?: string;
  transformer?: {
    type: PrimitiveTransformer;
    args: IntTransformerArgs | CommonTransformerArgs;
  };
};

export const IntTransformer = (
  args: IntTransformerArgs = {
    throwOnInvalidValue: true,
    radix: 10,
  },
) => {
  return Transform(({ value }) => {
    return intParse(value, args.throwOnInvalidValue, args.radix ?? 10);
  });
};

export const FloatTransformer = (
  args: CommonTransformerArgs = {
    throwOnInvalidValue: true,
  },
) => {
  return Transform(({ value }) => {
    return floatParse(value, args.throwOnInvalidValue);
  });
};

export const BooleanTransformer = (
  args: CommonTransformerArgs = {
    throwOnInvalidValue: true,
  },
) => {
  return Transform(({ value }) => {
    return booleanParse(value, args.throwOnInvalidValue);
  });
};

export const ArrayOfStringsTransformer = (
  args: ArrayTransformerArgs = {
    separator: ',',
    throwOnInvalidValue: true,
  },
) => {
  return Transform(({ value }) => {
    const parsedArray = arrayParse(value, args.separator ?? ',');

    return parsedArray;
  });
};

export const ArrayOfIntsTransformer = (
  args: ArrayTransformerArgs & { radix: number } = {
    separator: ',',
    throwOnInvalidValue: true,
    radix: 10,
  },
) => {
  return Transform(({ value }) => {
    const parsedArray = arrayParse(value, args.separator ?? ',');

    return parsedArray.map((val) =>
      intParse(val, args.throwOnInvalidValue, args.radix ?? 10),
    );
  });
};

export const ArrayOfFloatsTransformer = (
  args: ArrayTransformerArgs = {
    separator: ',',
    throwOnInvalidValue: true,
  },
) => {
  return Transform(({ value }) => {
    const parsedArray = arrayParse(value, args.separator ?? ',');

    return parsedArray.map((val) => floatParse(val, args.throwOnInvalidValue));
  });
};

export const ArrayOfClassesTransformer = (
  args: ArrayTransformerArgs & { type?: ClassConstructor<unknown> } = {
    separator: ',',
    throwOnInvalidValue: true,
  },
) => {
  return Transform(({ value }) => {
    const parsedArray = arrayParse(value, args.separator ?? ',');

    return parsedArray.map((val) => {
      if (typeof val === 'string' && args.type !== undefined) {
        const parsedVal = val
          .split(';')
          .reduce<Record<string, string>>((accum, entry) => {
            const [key, value] = entry.split('=');
            if (key !== undefined && value !== undefined) {
              accum[key] = value;
            }

            return accum;
          }, {});

        return plainToInstance(args.type, parsedVal);
      }
      return val;
    });
  });
};
