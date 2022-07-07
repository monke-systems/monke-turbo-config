[![npm version](https://badge.fury.io/js/@monkee%2Fturbo-config.svg)](https://badge.fury.io/js/@monkee%2Fturbo-config)

# Turbo config

Complete configuration solution for typescript codebases:

```typescript
class AppConfig {
  @GenericKey('app.port')
  @IntTransformer()
  @IsInt()
  port = 3000;

  @GenericKey('app.host')
  @EnvKey('TURBO_APP_HOST')
  @IsString()
  host!: string;

  @GenericKey('services.manager.tasks')
  @ArrayOfStringsTransformer()
  @IsString({ each: true })
  tasks!: string[];
}
```

# Main features

1. **Yaml, env, cli** (WIP) config sources with priority configuration
1. Typed, class-based
1. Built on the top of the mature community driven libraries:
    * [class-validator](https://github.com/typestack/class-validator) as validation solution
    * [class-transformer](https://github.com/typestack/class-transformer) for type management

1. [NestJs](https://nestjs.com/) module out the box (WIP)
1. Config documentation generator (WIP)
1. Well configurable

## Table of contents

- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Basic usage](#basic-usage)
- [Advanced usage](#advanced-usage)
  - [Nested configs](#nested-configs)
  - [Compile options reference](#compile-options-reference)
  - [Error handling](#error-handling)
  - [Documentation generator](#documentation-generator)
  - [NestJs usage](#nestjs-usage)
- [Authors](#authors)

# Getting Started

## Prerequisites

This library depends on decorators, so make sure your tsconfig.json includes this setting:

```json
"compilerOptions": {
  "experimentalDecorators": true
}
```

## Installation

Install via npm

```sh
npm i @monkee/turbo-config
```

Yarn:

```sh
yarn add @monkee/turbo-config
```

## Basic usage

```typescript
import { IsNumber, IsString } from 'class-validator';
import {
  CONFIG_SOURCE,
  GenericKey,
  EnvKey,
  YamlKey,
  CliKey,
  IntTransformer,
  ArrayOfStringsTransformer,
  compileConfig,
} from './index';

class AppConfig {
  // GenericKey it's a little magic that reduces the number of decorators.
  // You can turn it off it in compile settings and compilation will throw an error
  @GenericKey('app.port')
  // Library includes transform helpers for common types like integers, floats, arrays.
  // But you can use all class-transformer library features
  // https://github.com/typestack/class-transformer#additional-data-transformation
  @IntTransformer()
  // You can use any class validator decorators
  // https://github.com/typestack/class-validator
  @IsNumber()
  // Default value example
  appPort = 3000;

  @GenericKey('app.host')
  // It's possible to override generic key with specific keys
  @EnvKey('SUPER_APP_HOST')
  @YamlKey('super.app.host')
  @CliKey('cli.app.host')
  @IsString()
  appHost!: string;

  // Arrays example
  @GenericKey('tasks')
  @ArrayOfStringsTransformer()
  @IsString({ each: true })
  tasks!: string[];
}

const main = async () => {
  const { config } = await compileConfig(AppConfig, {
    ymlFiles: ['config.yml', 'override.yml'],
  });

  console.log(config);
};
```

# Advanced usage

## Nested configs

```typescript
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, ValidateNested } from 'class-validator';
import {
  compileConfig,
  GenericKey,
  IntTransformer,
  NestedKey,
  BooleanTransformer,
} from './index';

class Nested {
  @GenericKey('port')
  @IntTransformer()
  @IsInt()
  port = 3000;

  @GenericKey('autoReconnect')
  @BooleanTransformer()
  @IsBoolean()
  autoReconnect = true;
}

class AppConfig {
  @NestedKey('app.nested', Nested)
  @ValidateNested()
  @Type(() => Nested)
  nested!: Nested;
}

const main = async () => {
  const { config } = await compileConfig(AppConfig);

  console.log(config.nested);
};
```

## Compile options reference

```typescript
// Default compile options
{
  sourcesPriority: [CONFIG_SOURCE.YAML, CONFIG_SOURCE.ENV, CONFIG_SOURCE.CLI],
  ymlFiles: [],
  disallowGenericKeys: false,
  throwOnValidatonError: true,
  classValidatorOptions: {
    skipMissingProperties: false,
  },
}
```

## NestJs usage

WIP

## Error handling

WIP

## Documentation generator

WIP

# Authors

**Vlad Boroda** - *Initial work* - [Enity](https://github.com/Enity)
