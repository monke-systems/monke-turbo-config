import type { ClassConstructor } from 'class-transformer';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TurboConfigBuildError } from '../errors';
import {
  ArrayOfClassesTransformer,
  ArrayOfFloatsTransformer,
  ArrayOfIntsTransformer,
  ArrayOfStringsTransformer,
  BooleanTransformer,
  FloatTransformer,
} from '../transform-helpers/common-transformers';
import { CliKey, EnvKey, GenericKey, NestedKey, YamlKey } from './decorators';
import { getPropertyType } from './metadata';

export type ArrayOfOptions =
  | 'strings'
  | 'ints'
  | 'floats'
  | ClassConstructor<unknown>;

export type ConfigFieldOptions = {
  arrayOf?: ArrayOfOptions;
  arraySeparator?: string;
  disableDefaultDecorators?: boolean;
  genericKey?: string;
  envKey?: string;
  yamlKey?: string;
  cliKey?: string;
  nested?: boolean;
  nestedKey?: string;
};

const primitiveReflectTypes = [
  {
    reflectType: String,
    decorators: [IsString()],
  },
  {
    reflectType: Number,
    decorators: [IsNumber(), FloatTransformer()],
  },
  {
    reflectType: Boolean,
    decorators: [IsBoolean(), BooleanTransformer()],
  },
];

const getArrayDecorators = (type: ArrayOfOptions, separator: string) => {
  switch (type) {
    case 'strings':
      return [
        ArrayOfStringsTransformer({ separator, throwOnInvalidValue: true }),
        IsString({ each: true }),
      ];
    case 'ints':
      return [
        ArrayOfIntsTransformer({
          separator,
          radix: 10,
          throwOnInvalidValue: true,
        }),
        IsNumber(undefined, { each: true }),
      ];
    case 'floats':
      return [
        ArrayOfFloatsTransformer({
          separator,
          throwOnInvalidValue: true,
        }),
        IsNumber(undefined, { each: true }),
      ];
    default:
      return [
        IsArray(),
        ValidateNested({ each: true }),
        Type(() => type),
        ArrayOfClassesTransformer({
          separator,
          throwOnInvalidValue: true,
          type,
        }),
      ];
  }
};

export const ConfigField = (opts: ConfigFieldOptions = {}) => {
  return (target: object, property: string) => {
    const decoratorsToApply: PropertyDecorator[] = [];

    // Define generic key
    decoratorsToApply.push(GenericKey(opts.genericKey ?? property));

    const type = getPropertyType(target, property);

    if (opts.nested === true) {
      decoratorsToApply.push(
        ...[
          NestedKey(opts.nestedKey ?? property, type),
          ValidateNested(),
          Type(() => type),
        ],
      );
    } else {
      if (opts.cliKey !== undefined) {
        decoratorsToApply.push(CliKey(opts.cliKey));
      }

      if (opts.yamlKey !== undefined) {
        decoratorsToApply.push(YamlKey(opts.yamlKey));
      }

      if (opts.envKey !== undefined) {
        decoratorsToApply.push(EnvKey(opts.envKey));
      }

      if (
        opts.disableDefaultDecorators === false ||
        opts.disableDefaultDecorators === undefined
      ) {
        const typeOptions = primitiveReflectTypes.find(
          (t) => t.reflectType === type,
        );

        if (typeOptions !== undefined) {
          decoratorsToApply.push(...typeOptions.decorators);
        }

        if (type === Array) {
          if (opts.arrayOf === undefined) {
            throw new TurboConfigBuildError(
              `Property "${property}" has array type but no arrayOf option is passed`,
            );
          }
          decoratorsToApply.push(
            ...getArrayDecorators(opts.arrayOf, opts.arraySeparator ?? ','),
          );
        }
      }
    }

    for (const decorator of decoratorsToApply) {
      decorator(target, property);
    }
  };
};
