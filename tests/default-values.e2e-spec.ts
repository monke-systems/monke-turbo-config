import { compileConfig, ConfigField, TurboConfigTransformerErr } from '../src';
import { setEnvs } from './utils/test-utils';

describe('Default values (e2e)', () => {
  it('Default values complex test', async () => {
    class Conf {
      @ConfigField({ genericKey: 'app.portWrong' })
      appPort: number = 9999;

      @ConfigField({ arrayOf: 'strings' })
      tasks: string[] = ['task5', 'task6'];

      @ConfigField({ arrayOf: 'ints', genericKey: 'wrong.Key' })
      intsArr: number[] = [1, 2, 3];
    }

    setEnvs(['TASKS', 'opa,zhopa,loh']);

    const { config } = await compileConfig(Conf);

    const expected = new Conf();
    expected.tasks = ['opa', 'zhopa', 'loh'];
    expected.intsArr = [1, 2, 3];

    expect(config).toStrictEqual(expected);
  });

  it('Disable default values', async () => {
    class Conf {
      @ConfigField()
      appPort: number = 9999;
    }

    const fn = () =>
      compileConfig(Conf, {
        classTransformerOptions: {
          exposeDefaultValues: false,
        },
      });

    await expect(fn()).rejects.toThrowError(TurboConfigTransformerErr);
  });
});
