import { compileConfigSync } from '../src';
import { E2E_YAMLS, getE2EYamlPath } from './utils/test-utils';

describe('Sync compiler (e2e)', () => {
  it('Sync compiler should work', () => {
    class Conf {}

    expect(() => {
      return compileConfigSync(Conf, {
        ymlFiles: [getE2EYamlPath(E2E_YAMLS.COMPLEX)],
      });
    }).not.toThrow();
  });
});
