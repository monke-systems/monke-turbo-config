import { compileConfig, ConfigField } from '../src';
import { CONFIG_SOURCE } from '../src/compiler/config-sources';
import {
  E2E_ENV_FILES,
  E2E_YAMLS,
  getE2EEnvFilePath,
  getE2EYamlPath,
  setArgs,
  setEnvs,
} from './utils/test-utils';

describe('Overriding (e2e)', () => {
  it('Specific keys should override generic key', async () => {
    class Conf {
      @ConfigField({ genericKey: 'app.portWrong', yamlKey: 'app.port' })
      appPort!: number;

      @ConfigField({
        genericKey: 'tasksWrong',
        envKey: 'TASKS',
        arrayOf: 'strings',
      })
      tasks!: string[];

      @ConfigField({ genericKey: 'app.host', cliKey: 'host' })
      appHost!: string;
    }

    setEnvs(['TASKS', 'task1,task2']);
    setArgs('--host=hostFromCli');

    const { config } = await compileConfig(Conf, {
      ymlFiles: [getE2EYamlPath(E2E_YAMLS.COMPLEX)],
    });

    const expected = new Conf();
    expected.appPort = 5000;
    expected.appHost = 'hostFromCli';
    expected.tasks = ['task1', 'task2'];

    expect(config).toStrictEqual(expected);
  });

  it('Yml files overriding', async () => {
    class Conf {
      @ConfigField({ genericKey: 'db.mysql.host' })
      mysqlHost!: string;

      @ConfigField({ yamlKey: 'db.mysql.autoReconnect' })
      mysqlAutoReconnect!: boolean;
    }

    const { config } = await compileConfig(Conf, {
      ymlFiles: [
        getE2EYamlPath(E2E_YAMLS.COMPLEX),
        getE2EYamlPath(E2E_YAMLS.OVERRIDE),
      ],
    });

    const expected = new Conf();
    expected.mysqlHost = 'notLocalhost';
    expected.mysqlAutoReconnect = false;

    expect(config).toStrictEqual(expected);
  });

  it('Env files overriding', async () => {
    class Conf {
      @ConfigField({ genericKey: 'db.mysql.host' })
      mysqlHost!: string;

      @ConfigField({ genericKey: 'db.mysql.autoReconnect' })
      mysqlAutoReconnect!: boolean;

      @ConfigField({ genericKey: 'db.redis.host' })
      redisHost!: string;
    }

    setEnvs(['DB_REDIS_HOST', 'redis-555']);

    const { config } = await compileConfig(Conf, {
      envFiles: [
        getE2EEnvFilePath(E2E_ENV_FILES.COMPLEX),
        getE2EEnvFilePath(E2E_ENV_FILES.OVERRIDE),
      ],
      loadEnvFiles: true,
    });

    const expected = new Conf();
    expected.mysqlHost = 'notLocalhost';
    expected.mysqlAutoReconnect = true;
    expected.redisHost = 'redis-555';

    expect(config).toStrictEqual(expected);
  });

  it('Sources priority: env', async () => {
    class Conf {
      @ConfigField({ genericKey: 'db.mysql.host' })
      mysqlHost!: string;

      @ConfigField({ genericKey: 'db.mysql.autoReconnect' })
      mysqlAutoReconnect!: boolean;
    }

    setEnvs(
      ['DB_MYSQL_HOST', 'mysqlHostFromEnvs'],
      ['DB_MYSQL_AUTO_RECONNECT', 'false'],
    );

    const { config } = await compileConfig(Conf, {
      sourcesPriority: [CONFIG_SOURCE.YAML, CONFIG_SOURCE.ENV],
      ymlFiles: [getE2EYamlPath(E2E_YAMLS.COMPLEX)],
    });

    const expected = new Conf();
    expected.mysqlHost = 'mysqlHostFromEnvs';
    expected.mysqlAutoReconnect = false;

    expect(config).toStrictEqual(expected);
  });

  it('Sources priority: yaml', async () => {
    class Conf {
      @ConfigField({ genericKey: 'db.mysql.host' })
      mysqlHost!: string;

      @ConfigField({ genericKey: 'db.mysql.autoReconnect' })
      mysqlAutoReconnect!: boolean;
    }

    setEnvs(
      ['DB_MYSQL_HOST', 'mysqlHostFromEnvs'],
      ['DB_MYSQL_AUTORECONNECT', 'false'],
    );

    const { config } = await compileConfig(Conf, {
      sourcesPriority: [CONFIG_SOURCE.ENV, CONFIG_SOURCE.YAML],
      ymlFiles: [getE2EYamlPath(E2E_YAMLS.COMPLEX)],
    });

    const expected = new Conf();
    expected.mysqlHost = 'localhost';
    expected.mysqlAutoReconnect = true;

    expect(config).toStrictEqual(expected);
  });

  it('Sources priority: cli', async () => {
    class Conf {
      @ConfigField({ genericKey: 'db.mysql.host' })
      mysqlHost!: string;

      @ConfigField({ genericKey: 'db.mysql.autoReconnect' })
      mysqlAutoReconnect!: boolean;
    }

    setArgs('--db.mysql.host=hostFromCli', '--db.mysql.autoReconnect=false');

    const { config } = await compileConfig(Conf, {
      sourcesPriority: [CONFIG_SOURCE.YAML, CONFIG_SOURCE.CLI],
      ymlFiles: [getE2EYamlPath(E2E_YAMLS.COMPLEX)],
    });

    const expected = new Conf();
    expected.mysqlHost = 'hostFromCli';
    expected.mysqlAutoReconnect = false;

    expect(config).toStrictEqual(expected);
  });
});
