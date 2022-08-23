import { ConfigField, TurboConfigModule } from '../src';
import { setEnvs } from './utils/test-utils';

describe('NestJs module (e2e)', () => {
  it('forRootAsync should return global dynamic module', async () => {
    class Conf {
      @ConfigField()
      appPort!: number;
    }

    setEnvs(['APP_PORT', '3000']);

    const { module, providers, exports, global } =
      await TurboConfigModule.forRootAsync(Conf);

    const expectedConf = new Conf();
    expectedConf.appPort = 3000;

    expect(module).toBe(TurboConfigModule);
    expect(Array.isArray(providers)).toBe(true);
    expect(providers).toHaveLength(1);
    expect(providers![0]).toStrictEqual({
      useValue: expectedConf,
      provide: Conf,
    });
    expect(exports).toStrictEqual(providers);
    expect(global).toBe(true);
  });

  it('registerAsync should return local dynamic module', async () => {
    class Conf {
      @ConfigField()
      appPort!: number;
    }

    setEnvs(['APP_PORT', '3000']);

    const { module, providers, exports, global } =
      await TurboConfigModule.registerAsync(Conf);

    const expectedConf = new Conf();
    expectedConf.appPort = 3000;

    expect(module).toBe(TurboConfigModule);
    expect(Array.isArray(providers)).toBe(true);
    expect(providers).toHaveLength(1);
    expect(providers![0]).toStrictEqual({
      useValue: expectedConf,
      provide: Conf,
    });
    expect(exports).toStrictEqual(providers);
    expect(global).toBe(false);
  });
});
