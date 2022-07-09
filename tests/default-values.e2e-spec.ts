import {
  compileConfig,
  GenericKey,
  ArrayOfIntsTransformer,
  ArrayOfStringsTransformer,
  IntTransformer,
} from '../src';
import { setEnvs } from './utils/test-utils';

describe('Default values (e2e)', () => {
  it('Default values complex test', async () => {
    class Conf {
      @GenericKey('app.portWrong')
      @IntTransformer()
      appPort = 9999;

      @GenericKey('tasks')
      @ArrayOfStringsTransformer()
      tasks: string[] = ['task5', 'task6'];

      @GenericKey('wrong.key')
      @ArrayOfIntsTransformer()
      intsArr: number[] = [1, 2, 3];
    }

    setEnvs(['TASKS', 'opa,zhopa,loh']);

    const { config } = await compileConfig(Conf);

    const expected = new Conf();
    expected.tasks = ['opa', 'zhopa', 'loh'];
    expected.intsArr = [1, 2, 3];

    expect(config).toStrictEqual(expected);
  });
});
