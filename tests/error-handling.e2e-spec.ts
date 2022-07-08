import { compileConfig, TurboConfigCompileError } from '../src';
import { E2E_YAMLS, getE2EYamlPath } from './utils/test-utils';

describe('Error handling (e2e)', () => {
  it('Should now throw an error if yml file not exists', async () => {
    class Conf {}

    const fn = () =>
      compileConfig(Conf, {
        ymlFiles: [getE2EYamlPath(E2E_YAMLS.COMPLEX), 'not_exist2'],
      });

    await expect(fn()).resolves.not.toThrow();
  });

  it('Should throw an error if throwIfYmlNotExist option enabled', async () => {
    class Conf {}

    const fn = () =>
      compileConfig(Conf, {
        ymlFiles: [getE2EYamlPath(E2E_YAMLS.COMPLEX), 'not_exist2'],
        throwIfYmlNotExist: true,
      });

    await expect(fn()).rejects.toThrowError(TurboConfigCompileError);
  });
});
