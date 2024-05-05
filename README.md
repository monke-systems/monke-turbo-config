# Turbo config

[![npm version](https://badge.fury.io/js/@monkee%2Fturbo-config.svg)](https://badge.fury.io/js/@monkee%2Fturbo-config)

Complete configuration solution for typescript codebases.

## Main features

1. **Yaml, env, cli** config sources with priority configuration and overriding
1. Typed, class-based
1. JSON schema generation for yaml autocompletion and validation in editors and IDEs
1. Documentation generator for yaml and env variables
1. Built on the top of the mature community driven libraries:
  * [class-validator](https://github.com/typestack/class-validator) as validation solution
  * [class-transformer](https://github.com/typestack/class-transformer) for type management
  * [dotenv](https://github.com/motdotla/dotenv) for envs parsing

## Example

```typescript
@ConfigPrefix('app')
class AppConfig {
  // Simple field
  @ConfigField({ optional: true })
  httpPort?: number;

  // Nested config
  @ConfigField({ nested: true })
  db!: DbConfig;

  // Sources overriding. Arrays support
  @ConfigField({
    arrayOf: 'strings',
    yamlKey: 'services.manager.tasks',
    cliKey: 'servicesList',
    arraySeparator: ':',
  })
  tasks!: string[];
}

class DbConfig {
  @ConfigField()
  host!: string;

  @ConfigField()
  port: number = 3306;

  @ConfigField()
  autoReconnect = true;
}
```

## Table of contents

- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Basic usage](#basic-usage)
  - [Documentation and json schema generation](#documentation-and-json-schema-generators)
- [Advanced usage](#advanced-usage)
  - [Nested configs](#nested-configs)
  - [Array of non-primitive types](#array-of-non-primitive-types)
  - [Build options reference](#build-options-reference)
  - [Error handling](#error-handling)
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

## Basic usage

```typescript
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { buildConfig, ConfigField } from '@monkee/turbo-config';

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
  appPort: number = 3000;
  /*
    NOTE: due reflect-metadata limitation you should specity property type
    with default value. Othervise library won't infer type and the magic won't work.
    Use ignoreProperties flag with no-inferrable-types eslint rule if necessary
  */

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

  // Array example. Due to reflection limitation you should specify type
  @ConfigField({ arrayOf: 'ints' })
  intsArray: number[] = [1, 2, 3];
}

const main = async () => {
  const { config } = await buildConfig(AppConfig, {
    ymlFiles: ['config.yml', 'override.yml'],
  });

  console.log(config);
};
```

## Documentation and json schema generators

```typescript
import { generateConfigDoc, ConfigPrefix, ConfigField } from '@monkee/turbo-config';
import * as fs from 'fs/promises';

@ConfigPrefix('nest')
class AppConfig {
  @ConfigField()
  port!: number;
}

const main = async () => {
  const { jsonSchema } = await buildConfig(AppConfig);

  // save config reference to file
  await generateConfigDoc(jsonSchema, {
    // you can also use return value of generateConfigDoc to manually write file
    writeToFile: 'CONFIG_REFERENCE.md',
  });

  // write json schema to file
  fs.writeFile('config-schema.json', JSON.stringify(jsonSchema, null, 2), 'utf-8');
};

```

In your yml config file you can include generated json schema. Supported in VSCode and IDEA (Webstorm).

```yaml
# yaml-language-server: $schema=config-schema.json

nest:
  port: 3000
```


# Advanced usage

## Nested configs

```typescript
import { buildConfig, ConfigField } from '@monkee/turbo-config';

class Nested {
  @ConfigField()
  port = 3000;

  @ConfigField()
  autoReconnect = true;
}

class AppConfig {
  @ConfigField({ nested: true })
  nested!: Nested;
}

const main = async () => {
  const { config } = await buildConfig(AppConfig);

  console.log(config.nested);
};
```

## Array of non-primitive types

```typescript
import { buildConfig, ConfigField } from '@monkee/turbo-config';

class Repository {
  @ConfigField()
  url!: string;

  @ConfigField()
  token!: string;
}

class AppConfig {
  @ConfigField({ arrayOf: Repository })
  repositories!: Repository[];
}

const main = async () => {
  process.env.REPOSITORIES = 'url=first;token=someToken,url=second;token=secret';

  const { config } = await buildConfig(AppConfig);

  console.log(config.repositories);
};
```

## Build options reference

```typescript
// Default build options
{
  sourcesPriority: [CONFIG_SOURCE.YAML, CONFIG_SOURCE.ENV, CONFIG_SOURCE.CLI],
  throwOnValidationError: true,
  throwIfYmlNotExist: false,
  throwIfEnvFileNotExist: false,
  ymlFiles: [],
  envFiles: [],
  loadEnvFiles: false,
  classValidatorOptions: {
    skipMissingProperties: false,
  },
  classTransformerOptions: {
    exposeDefaultValues: true,
  },
}
```

## Error handling

```typescript
const main = async () => {
  // manually handle validation errors
  const { config, validationErrors } = await buildConfig(AppConfig, {
    throwOnValidationError: false,
  });

  throw new Error(validationErrors);
};
```

# Authors

**Vlad Boroda** - *Initial work* - [Enity](https://github.com/Enity)
