import { buildConfig, ConfigField, ConfigPrefix } from '../src';
import { E2E_YAMLS, getE2EYamlPath } from './utils/test-utils';

describe('Json schema generator (e2e)', () => {
  it('Should generate valid schema', async () => {
    class CacheConfig {
      @ConfigField()
      ttlSec!: number;

      @ConfigField({ optional: true })
      lockTime?: number;
    }

    class AppConfig {
      @ConfigField()
      port!: number;

      @ConfigField()
      host!: string;

      @ConfigField({ optional: true })
      optionalField?: string;

      @ConfigField({ nested: true })
      cache!: CacheConfig;
    }

    @ConfigPrefix('nest')
    class Config {
      @ConfigField({ nested: true })
      app!: AppConfig;

      @ConfigField({ arrayOf: 'strings' })
      tasks!: string[];
    }

    const { jsonSchema } = await buildConfig(Config, {
      ymlFiles: [getE2EYamlPath(E2E_YAMLS.COMPLEX_PREFIXED)],
    });

    const expected = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        nest: {
          type: 'object',
          properties: {
            app: {
              type: 'object',
              properties: {
                port: {
                  configKeys: {
                    cli: 'nest.app.port',
                    env: 'NEST_APP_PORT',
                    yaml: 'nest.app.port',
                  },
                  type: 'number',
                },
                host: {
                  configKeys: {
                    cli: 'nest.app.host',
                    env: 'NEST_APP_HOST',
                    yaml: 'nest.app.host',
                  },
                  type: 'string',
                },
                optionalField: {
                  configKeys: {
                    cli: 'nest.app.optionalField',
                    env: 'NEST_APP_OPTIONAL_FIELD',
                    yaml: 'nest.app.optionalField',
                  },
                  type: 'string',
                },
                cache: {
                  type: 'object',
                  properties: {
                    ttlSec: {
                      configKeys: {
                        cli: 'nest.app.cache.ttlSec',
                        env: 'NEST_APP_CACHE_TTL_SEC',
                        yaml: 'nest.app.cache.ttlSec',
                      },
                      type: 'number',
                    },
                    lockTime: {
                      configKeys: {
                        cli: 'nest.app.cache.lockTime',
                        env: 'NEST_APP_CACHE_LOCK_TIME',
                        yaml: 'nest.app.cache.lockTime',
                      },
                      type: 'number',
                    },
                  },
                  required: ['ttlSec'],
                },
              },
              required: ['port', 'host', 'cache'],
            },
            tasks: {
              configKeys: {
                cli: 'nest.tasks',
                env: 'NEST_TASKS',
                yaml: 'nest.tasks',
              },
              type: 'array',
            },
          },
          required: ['app', 'tasks'],
        },
      },
      required: ['nest'],
    };

    expect(jsonSchema).toStrictEqual(expected);
  });
});
