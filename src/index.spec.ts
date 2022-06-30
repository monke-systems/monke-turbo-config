import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsString, ValidateNested } from 'class-validator';
import {
  ArrayOfIntsTransformer,
  ArrayOfStringsTransformer,
  BooleanTransformer,
  IntTransformer,
} from './transform-helpers/common-transformers';
import { compileConfig, EnvKey, GenericKey, NestedKey } from './index';

process.env.APP_PORT = '999999';
process.env.OPA_LOH = '1255';
process.env.LOH = '1,55,666';

class MysqlConfig {
  @GenericKey('host')
  @IsString()
  host!: string;

  @GenericKey('autoReconnect')
  @BooleanTransformer()
  @IsBoolean()
  autoReconnect!: number;
}

class Some {
  @NestedKey('db.mysql', MysqlConfig)
  @ValidateNested()
  @Type(() => MysqlConfig)
  dbMysql!: MysqlConfig;

  @GenericKey('app.port')
  @IntTransformer()
  @IsNumber()
  appPort!: number;

  @GenericKey('app.host')
  @IsString()
  appHost!: string;

  @GenericKey('tasks')
  @ArrayOfStringsTransformer()
  @IsString({ each: true })
  tasks!: string[];

  @GenericKey('intsArray')
  @EnvKey('INTS_ARRAY')
  @ArrayOfIntsTransformer()
  @IsNumber({}, { each: true })
  intsArr!: number[];
}

const m = async () => {
  const conf = await compileConfig(Some, {
    disallowGenericKeys: false,
    ymlFiles: [
      '/Users/boroda/Documents/Js/turbo-ts-config/tests/files/configs/complex-config.yml',
    ],
  });

  console.log(conf);
};

m().catch(console.error);

// describe('[zdorova]', () => {
//   it('Just works', () => {
//     expect(true).toBe(true);
//   });
// });
