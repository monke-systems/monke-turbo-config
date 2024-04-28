import { buildConfig, ConfigField } from '../src';
import { setEnvs } from './utils/test-utils';

describe('Config field decorator options (e2e)', () => {
  it('Disable default decorators', async () => {
    class Conf {
      @ConfigField({ disableDefaultDecorators: true })
      appPort!: string;

      @ConfigField({ disableDefaultDecorators: true })
      tasks!: string[];
    }

    setEnvs(['TASKS', 'opa,zhopa,loh'], ['APP_PORT', 'not_number']);

    const { config } = await buildConfig(Conf);

    const expected = new Conf();
    // @ts-expect-error for this test case its necessary
    expected.tasks = 'opa,zhopa,loh';
    expected.appPort = 'not_number';

    expect(config).toStrictEqual(expected);
  });
});
