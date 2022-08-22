# Turbo config

[![npm version](https://badge.fury.io/js/@monkee%2Fturbo-config.svg)](https://badge.fury.io/js/@monkee%2Fturbo-config)

Complete configuration solution for typescript codebases:

```typescript
class DbConfig {
  @ConfigField()
  host!: string;

  @ConfigField()
  port = 3306;

  @ConfigField()
  autoReconnect = true;
}

class AppConfig {
  @ConfigField({ nested: true })
  db!: DbConfig;

  // Complex field
  @ConfigField()
  @Transform(({ value }) => moment(value), { toClassOnly: true })
  date!: Moment;

  // Sources overriding
  @ConfigField({
    arrayOf: 'strings',
    yamlKey: 'services.manager.tasks',
    cliKey: 'servicesList',
    arraySeparator: ':',
  })
  tasks!: string[];
}

```

# Main features

1. **Yaml, env, cli** config sources with priority configuration
1. Typed, class-based
1. Built on the top of the mature community driven libraries:
    * [class-validator](https://github.com/typestack/class-validator) as validation solution
    * [class-transformer](https://github.com/typestack/class-transformer) for type management
    * [yargs-parser](https://github.com/yargs/yargs-parser) for cli source

1. [NestJs module out the box](#nestjs-usage)
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

This library depends on decorators, so make sure your tsconfig.json includes this settings:

```json
"compilerOptions": {
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
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
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { compileConfig, ConfigField } from '@monkee/turbo-config';

class AppConfig {
  /*
    Every field with this decorator will be parsed as config field.
    By default keys will be inferred from property name:
    APP_PORT=3000 for env
    appPort: 3000 yaml
    --appPort=3000 for cli
  */
  @ConfigField()
  @Min(0)
  @Max(65535)
  appPort = 3000;

  /*
    There are some transforms and validations under the hood by default.
    parseFloat() and isNumber() validator for numbers for example.
    Its possible to disable everyting and handle it manually.
    Any features of ClassValidator and ClassTransformer is available.
  */
  @ConfigField({
    disableDefaultDecorators: true,
  })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  redisPort!: number;

  /*
    You can override any source key
  */
  @ConfigField({
    envKey: 'SUPER_APP_HOST',
    yamlKey: 'super.app.host',
    cliKey: 'cli.app.host',
  })
  appHost!: string;

  // Array example
  @ConfigField({ arrayOf: 'ints' })
  intsArray = [1, 2, 3];
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
import { compileConfig, ConfigField } from '@monkee/turbo-config';

class Nested {
  ConfigField()
  port = 3000;

  ConfigField()
  autoReconnect = true;
}

class AppConfig {
  ConfigField({ nested: true })
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
  throwOnValidatonError: true,
  throwIfYmlNotExist: false,
  classValidatorOptions: {
    skipMissingProperties: false,
  },
}
```

## NestJs usage

In general you need to register the config globally

```typescript
import { TurboConfigModule } from '@monkee/turbo-config';

@Module({
  imports: [
    TurboConfigModule.forRootAsync(AppConfig),
  ],
})
export class AppModule {}
```

There is also an option to register a scoped config

```typescript
import { TurboConfigModule } from '@monkee/turbo-config';

@Module({
  imports: [
    TurboConfigModule.registerAsync(DatabaseConfig),
  ],
})
export class DatabaseModule {}
```

## Error handling

WIP

## Documentation generator

WIP

# Authors

**Vlad Boroda** - *Initial work* - [Enity](https://github.com/Enity)
