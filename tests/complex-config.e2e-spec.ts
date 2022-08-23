import type { ConfigSchema } from '../src';
import { compileConfig, ConfigField } from '../src';
import {
  E2E_YAMLS,
  getE2EYamlPath,
  setArgs,
  setEnvs,
} from './utils/test-utils';

describe('Complex config positive scenario (e2e)', () => {
  it('Complex config', async () => {
    class Nested {
      @ConfigField()
      host!: string;

      @ConfigField()
      autoReconnect!: boolean;
    }

    class ComplexConfig {
      @ConfigField({ nested: true, nestedKey: 'db.mysql' })
      dbMysql!: Nested;

      @ConfigField({ genericKey: 'app.port_mistake_use_default' })
      appPort: number = 8989;

      @ConfigField({ genericKey: 'app.host' })
      appHost!: string;

      @ConfigField({ arrayOf: 'strings', arraySeparator: ':' })
      tasks!: string[];

      @ConfigField({ arrayOf: 'ints', yamlKey: 'intsArray' })
      intsArr!: number[];

      @ConfigField({ arrayOf: 'ints', cliKey: 'some.arrayOfInts' })
      arrFromArgs!: number[];
    }

    setEnvs(
      ['TASKS', 'one:two:three'],
      ['APP_PORT', '8989'],
      ['DB_MYSQL_AUTO_RECONNECT', 'true'],
    );
    setArgs('--some.arrayOfInts=1,6,10');

    const { config, configSchema } = await compileConfig(ComplexConfig, {
      ymlFiles: [
        getE2EYamlPath(E2E_YAMLS.COMPLEX),
        getE2EYamlPath(E2E_YAMLS.OVERRIDE),
      ],
    });

    const expected = new ComplexConfig();
    expected.dbMysql = new Nested();
    expected.dbMysql.autoReconnect = true;
    expected.dbMysql.host = 'notLocalhost';
    expected.appHost = 'localhost';
    expected.appPort = 8989;
    expected.tasks = ['one', 'two', 'three'];
    expected.intsArr = [1, 2, 3];
    expected.arrFromArgs = [1, 6, 10];

    expect(config).toStrictEqual(expected);

    const expectedConfigSchema: ConfigSchema = {
      dbMysql: {
        children: {
          host: {
            type: String,
            defaultValue: undefined,
            keys: {
              env: 'DB_MYSQL_HOST',
              yaml: 'db.mysql.host',
              cli: 'db.mysql.host',
            },
          },
          autoReconnect: {
            type: Boolean,
            defaultValue: undefined,
            keys: {
              env: 'DB_MYSQL_AUTO_RECONNECT',
              yaml: 'db.mysql.autoReconnect',
              cli: 'db.mysql.autoReconnect',
            },
          },
        },
      },
      appPort: {
        type: Number,
        defaultValue: 8989,
        keys: {
          env: 'APP_PORT_MISTAKE_USE_DEFAULT',
          yaml: 'app.port_mistake_use_default',
          cli: 'app.port_mistake_use_default',
        },
      },
      appHost: {
        type: String,
        defaultValue: undefined,
        keys: { env: 'APP_HOST', yaml: 'app.host', cli: 'app.host' },
      },
      tasks: {
        type: Array,
        defaultValue: undefined,
        keys: { env: 'TASKS', yaml: 'tasks', cli: 'tasks' },
      },
      intsArr: {
        type: Array,
        defaultValue: undefined,
        keys: { env: 'INTS_ARR', yaml: 'intsArray', cli: 'intsArr' },
      },
      arrFromArgs: {
        type: Array,
        defaultValue: undefined,
        keys: {
          env: 'ARR_FROM_ARGS',
          yaml: 'arrFromArgs',
          cli: 'some.arrayOfInts',
        },
      },
    };

    expect(configSchema).toStrictEqual(expectedConfigSchema);
  });
});
