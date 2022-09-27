import { compileConfig, ConfigField } from '../src';
import { ConfigPrefix } from '../src/decorators/decorators';
import { E2E_YAMLS, getE2EYamlPath, setEnvs } from './utils/test-utils';

describe('Config prefix (e2e)', () => {
  it('Prefix usage without nested configs', async () => {
    @ConfigPrefix('app')
    class AppConfig {
      @ConfigField()
      host!: string;
    }

    const { config, configSchema } = await compileConfig(AppConfig, {
      ymlFiles: [getE2EYamlPath(E2E_YAMLS.COMPLEX)],
    });

    const expected = new AppConfig();
    expected.host = 'localhost';

    expect(config).toStrictEqual(expected);
    expect(configSchema).toStrictEqual({
      host: {
        type: String,
        defaultValue: undefined,
        keys: { env: 'APP_HOST', yaml: 'app.host', cli: 'app.host' },
      },
    });
  });

  it('Toplevel prefix option', async () => {
    class AppConfig {
      @ConfigField()
      host!: string;
    }

    const { config, configSchema } = await compileConfig(AppConfig, {
      ymlFiles: [getE2EYamlPath(E2E_YAMLS.COMPLEX)],
      topLevelPrefix: 'app',
    });

    const expected = new AppConfig();
    expected.host = 'localhost';

    expect(config).toStrictEqual(expected);
    expect(configSchema).toStrictEqual({
      host: {
        type: String,
        defaultValue: undefined,
        keys: { env: 'APP_HOST', yaml: 'app.host', cli: 'app.host' },
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

    const { config, configSchema } = await compileConfig(AppConfig);

    const expected = new AppConfig();
    const nested = new Nested();
    nested.port = 3000;
    expected.nested = nested;

    expect(config).toStrictEqual(expected);
    expect(configSchema).toStrictEqual({
      nested: {
        children: {
          port: {
            type: Number,
            defaultValue: undefined,
            keys: {
              env: 'APP_NESTED_ANOTHER_PORT',
              yaml: 'app.nested.another.port',
              cli: 'app.nested.another.port',
            },
          },
        },
      },
    });
  });
});
