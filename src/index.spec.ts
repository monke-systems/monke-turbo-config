import { IsBoolean, IsNumber } from 'class-validator';
import {
  ArrayOfIntsTransformer,
  BooleanTransformer,
  IntTransformer,
} from './transform-helpers/common-transformers';
import { EnvKey, compileConfig } from './index';

process.env.ZHOPA = 'true';
process.env.OPA = '1255';
process.env.LOH = '1,55,666';

class Some {
  @EnvKey('zhopa')
  @BooleanTransformer()
  @IsBoolean()
  nodeEnv!: boolean;

  @EnvKey('OPA')
  @IntTransformer()
  @IsNumber()
  nodeZhopa!: number;

  @EnvKey('LOH')
  @ArrayOfIntsTransformer()
  @IsNumber({}, { each: true })
  suck!: number[];
}

const conf = compileConfig(Some);

console.log(conf);

// describe('[zdorova]', () => {
//   it('Just works', () => {
//     const res = zdorova();
//     equal(res, 'zdorova');
//   });
// });
