import { ConfigField, buildConfig } from '../src';
import { E2E_YAMLS, getE2EYamlPath } from './utils/test-utils';

describe('Files (e2e)', () => {
  it('Should not throw if second yml not exists', async () => {
    class Config {
      @ConfigField({ arrayOf: 'strings', arraySeparator: ':' })
      tasks!: string[];
    }

    const { config } = await buildConfig(Config, {
      ymlFiles: [
        getE2EYamlPath(E2E_YAMLS.COMPLEX),
        getE2EYamlPath(E2E_YAMLS.NOT_EXISTS),
      ],
      throwIfYmlNotExist: false,
    });

    expect(config.tasks).toBeDefined();
    expect(config.tasks.length).toBe(3);
  });
});
