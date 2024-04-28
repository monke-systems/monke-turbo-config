import type { ConfigSchema } from '../src';
import { CONFIG_SOURCE, buildConfig, ConfigField } from '../src';
import {
  E2E_ENV_FILES,
  E2E_YAMLS,
  getE2EEnvFilePath,
  getE2EYamlPath,
  setArgs,
  setEnvs,
} from './utils/test-utils';

describe('Complex config positive scenario (e2e)', () => {
  it('Complex config', async () => {
    class Repository {
      @ConfigField()
      url!: string;

      @ConfigField()
      token!: string;

      @ConfigField()
      someFlag: boolean = false;
    }

    class Nested {
      @ConfigField()
      host!: string;

      @ConfigField()
      autoReconnect!: boolean;
    }

    class ComplexConfig {
      @ConfigField({ nested: true, nestedKey: 'db.mysql' })
      dbMysql!: Nested;

      @ConfigField({ arrayOf: Repository })
      repositories!: Repository[];

      @ConfigField({ arrayOf: Repository })
      repositoriesEnvs!: Repository[];

      @ConfigField({ arrayOf: Repository })
      repositoriesCli!: Repository[];

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
      [
        'REPOSITORIES_ENVS',
        'url=https://github.com/1;token=someToken;someFlag=true',
      ],
    );
    setArgs(
      '--some.arrayOfInts=1,6,10',
      '--repositoriesCli=url=https://gitpop.com/555;token=gitpopToken;',
    );

    const { config, configSchema } = await buildConfig(ComplexConfig, {
      sourcesPriority: [
        CONFIG_SOURCE.YAML,
        CONFIG_SOURCE.ENV,
        CONFIG_SOURCE.CLI,
      ],
      ymlFiles: [
        getE2EYamlPath(E2E_YAMLS.COMPLEX),
        getE2EYamlPath(E2E_YAMLS.OVERRIDE),
      ],
      envFiles: [getE2EEnvFilePath(E2E_ENV_FILES.OVERRIDE)],
      loadEnvFiles: true,
    });

    const expected = new ComplexConfig();
    expected.dbMysql = new Nested();
    expected.dbMysql.autoReconnect = true;
    expected.dbMysql.host = 'notLocalhost';

    const repository1 = new Repository();
    repository1.url = 'https://gitlab.com/123';
    repository1.token = 'secretToken';
    repository1.someFlag = false;
    expected.repositories = [repository1];

    const repository2 = new Repository();
    repository2.url = 'https://github.com/1';
    repository2.token = 'someToken';
    repository2.someFlag = true;
    expected.repositoriesEnvs = [repository2];

    const repository3 = new Repository();
    repository3.url = 'https://gitpop.com/555';
    repository3.token = 'gitpopToken';
    repository3.someFlag = false;
    expected.repositoriesCli = [repository3];

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
      repositories: {
        type: Array,
        defaultValue: undefined,
        keys: {
          env: 'REPOSITORIES',
          yaml: 'repositories',
          cli: 'repositories',
        },
      },
      repositoriesEnvs: {
        type: Array,
        defaultValue: undefined,
        keys: {
          env: 'REPOSITORIES_ENVS',
          yaml: 'repositoriesEnvs',
          cli: 'repositoriesEnvs',
        },
      },
      repositoriesCli: {
        type: Array,
        defaultValue: undefined,
        keys: {
          env: 'REPOSITORIES_CLI',
          yaml: 'repositoriesCli',
          cli: 'repositoriesCli',
        },
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
