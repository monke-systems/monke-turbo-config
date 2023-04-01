import { ConfigField, TurboConfigModule } from '../src';
import { setEnvs } from './utils/test-utils';

describe('NestJs module (e2e)', () => {
  it('forRootAsync should return global dynamic modules', async () => {
    class Conf {
      @ConfigField()
      appPort!: number;
    }

    class AnotherConf {
      @ConfigField()
      appHost!: string;
    }

    setEnvs(['APP_PORT', '3000'], ['APP_HOST', 'localhost']);

    const { module, providers, exports, global } =
      await TurboConfigModule.forRootAsync([Conf, AnotherConf]);

    const expectedConf = new Conf();
    expectedConf.appPort = 3000;

    const expectedAnotherConf = new AnotherConf();
    expectedAnotherConf.appHost = 'localhost';

    expect(module).toBe(TurboConfigModule);
    expect(Array.isArray(providers)).toBe(true);
    expect(providers).toHaveLength(2);
    expect(providers![0]).toStrictEqual({
      useValue: expectedConf,
      provide: Conf,
    });
    expect(providers![1]).toStrictEqual({
      useValue: expectedAnotherConf,
      provide: AnotherConf,
    });
    expect(exports).toStrictEqual(providers);
    expect(global).toBe(true);
  });

  it('registerAsync should return local dynamic module', async () => {
    class Conf {
      @ConfigField()
      appPort!: number;
    }

    class AnotherConf {
      @ConfigField()
      appHost!: string;
    }

    setEnvs(['APP_PORT', '3000'], ['APP_HOST', 'localhost']);

    const { module, providers, exports, global } =
      await TurboConfigModule.registerAsync([Conf, AnotherConf]);

    const expectedConf = new Conf();
    expectedConf.appPort = 3000;

    const expectedAnotherConf = new AnotherConf();
    expectedAnotherConf.appHost = 'localhost';

    expect(module).toBe(TurboConfigModule);
    expect(Array.isArray(providers)).toBe(true);
    expect(providers).toHaveLength(2);
    expect(providers![0]).toStrictEqual({
      useValue: expectedConf,
      provide: Conf,
    });
    expect(providers![1]).toStrictEqual({
      useValue: expectedAnotherConf,
      provide: AnotherConf,
    });
    expect(exports).toStrictEqual(providers);
    expect(global).toBe(false);
  });
});
