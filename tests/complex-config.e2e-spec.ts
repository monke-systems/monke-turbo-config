import { Type } from 'class-transformer';
import { IsString, IsBoolean, ValidateNested, IsNumber } from 'class-validator';
import { GenericKey, NestedKey, EnvKey, compileConfig } from '../src';
import {
  BooleanTransformer,
  IntTransformer,
  ArrayOfStringsTransformer,
  ArrayOfIntsTransformer,
} from '../src/transform-helpers/common-transformers';
import { E2E_YAMLS, getE2EYamlPath, setEnvs } from './utils/test-utils';

describe('Complex config positive scenario (e2e)', () => {
  it('Complex config', async () => {
    class Nested {
      @GenericKey('host')
      @IsString()
      host!: string;

      @GenericKey('autoReconnect')
      @BooleanTransformer()
      @IsBoolean()
      autoReconnect!: boolean;
    }

    class ComplexConfig {
      @NestedKey('db.mysql', Nested)
      @ValidateNested()
      @Type(() => Nested)
      dbMysql!: Nested;

      @GenericKey('app.port')
      @IntTransformer()
      @IsNumber()
      appPort!: number;

      @GenericKey('app.host')
      @IsString()
      appHost!: string;

      @GenericKey('tasks')
      // TODO: мержить дефолт настройки у декораторов
      @ArrayOfStringsTransformer({ separator: ':', throwOnInvalidValue: true })
      @IsString({ each: true })
      tasks!: string[];

      @GenericKey('intsArray')
      @EnvKey('INTS_ARRAY')
      @ArrayOfIntsTransformer()
      @IsNumber({}, { each: true })
      intsArr!: number[];
    }

    setEnvs([
      ['TASKS', 'one:two:three'],
      ['APP_PORT', '8989'],
    ]);

    const { config } = await compileConfig(ComplexConfig, {
      ymlFiles: [
        getE2EYamlPath(E2E_YAMLS.COMPLEX),
        getE2EYamlPath(E2E_YAMLS.OVERRIDE),
      ],
    });

    const expected = new ComplexConfig();
    expected.dbMysql = new Nested();
    expected.dbMysql.autoReconnect = false;
    expected.dbMysql.host = 'notLocalhost';
    expected.appHost = 'localhost';
    expected.appPort = 8989;
    expected.tasks = ['one', 'two', 'three'];
    expected.intsArr = [1, 2, 3];

    expect(config).toStrictEqual(expected);
  });
});
