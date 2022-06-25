import { Transform } from 'class-transformer';
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
