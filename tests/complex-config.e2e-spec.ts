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

      @ConfigField({ genericKey: 'app.port' })
      appPort!: number;

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

    const { config } = await compileConfig(ComplexConfig, {
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
  });
});
