import { buildConfig, ConfigField, ConfigPrefix } from '../src';
import { E2E_YAMLS, getE2EYamlPath, setEnvs } from './utils/test-utils';

describe('Config prefix (e2e)', () => {
  it('Prefix usage without nested configs', async () => {
    @ConfigPrefix('app')
    class AppConfig {
      @ConfigField()
      host!: string;
    }

    const { config, jsonSchema } = await buildConfig(AppConfig, {
      ymlFiles: [getE2EYamlPath(E2E_YAMLS.COMPLEX)],
    });

    const expected = new AppConfig();
    expected.host = 'localhost';

    expect(config).toStrictEqual(expected);
    expect(jsonSchema).toStrictEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      required: ['app'],
      properties: {
        app: {
          type: 'object',
          required: ['host'],
          properties: {
            host: {
              type: 'string',
              configKeys: {
                cli: 'app.host',
                env: 'APP_HOST',
                yaml: 'app.host',
              },
            },
          },
        },
      },
    });
  });

  it('Nested config should inherit parent prefix', async () => {
    @ConfigPrefix('another')
    class Nested {
      @ConfigField()
      port!: number;
    }

    @ConfigPrefix('app')
    class AppConfig {
      @ConfigField({ nested: true })
      nested!: Nested;
    }

    setEnvs(['APP_NESTED_ANOTHER_PORT', '3000']);

    const { config, jsonSchema } = await buildConfig(AppConfig);

    const expected = new AppConfig();
    const nested = new Nested();
    nested.port = 3000;
    expected.nested = nested;

    expect(config).toStrictEqual(expected);
    expect(jsonSchema).toStrictEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      required: ['app'],
      properties: {
        app: {
          type: 'object',
          required: ['nested'],
          properties: {
            nested: {
              type: 'object',
              required: ['another'],
              properties: {
                another: {
                  type: 'object',
                  required: ['port'],
                  properties: {
                    port: {
                      type: 'number',
                      configKeys: {
                        cli: 'app.nested.another.port',
                        env: 'APP_NESTED_ANOTHER_PORT',
                        yaml: 'app.nested.another.port',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  });
});
