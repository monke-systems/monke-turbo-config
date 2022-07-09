import {
  compileConfig,
  EnvKey,
  GenericKey,
  YamlKey,
  ArrayOfStringsTransformer,
  BooleanTransformer,
  IntTransformer,
  CliKey,
} from '../src';
import { CONFIG_SOURCE } from '../src/compiler/config-sources';
import {
  E2E_YAMLS,
  getE2EYamlPath,
  setArgs,
  setEnvs,
} from './utils/test-utils';

describe('Overriding (e2e)', () => {
  it('Specific keys should override generic key', async () => {
    class Conf {
      @GenericKey('app.portWrong')
      @YamlKey('app.port')
      @IntTransformer()
      appPort!: number;

      @GenericKey('tasksWrong')
      @EnvKey('TASKS')
      @ArrayOfStringsTransformer()
      tasks!: string[];

      @GenericKey('app.host')
      @CliKey('host')
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
      @GenericKey('db.mysql.host')
      mysqlHost!: string;

      @YamlKey('db.mysql.autoReconnect')
      @BooleanTransformer()
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

  it('Sources priority: env', async () => {
    class Conf {
      @GenericKey('db.mysql.host')
      mysqlHost!: string;

      @GenericKey('db.mysql.autoReconnect')
      @BooleanTransformer()
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
      @GenericKey('db.mysql.host')
      mysqlHost!: string;

      @GenericKey('db.mysql.autoReconnect')
      @BooleanTransformer()
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
      @GenericKey('db.mysql.host')
      mysqlHost!: string;

      @GenericKey('db.mysql.autoReconnect')
      @BooleanTransformer()
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
