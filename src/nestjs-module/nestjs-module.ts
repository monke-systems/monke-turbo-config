import type { DynamicModule, Provider } from '@nestjs/common';
import { compileConfig } from '../compiler/compiler';
import type { CompileConfigOptions } from '../compiler/compiler-options';

export class TurboConfigModule {
  static async forRootAsync(
    configClasses: (new () => any)[],
    opts: CompileConfigOptions = {},
  ): Promise<DynamicModule> {
    return TurboConfigModule.register(configClasses, opts, true);
  }

  static async registerAsync(
    configClasses: (new () => any)[],
    opts: CompileConfigOptions = {},
  ): Promise<DynamicModule> {
    return TurboConfigModule.register(configClasses, opts, false);
  }

  private static async register(
    configClasses: (new () => any)[],
    opts: CompileConfigOptions,
    global: boolean,
  ): Promise<DynamicModule> {
    const providers: Provider[] = await Promise.all(
      configClasses.map(async (c) => {
        const { config } = await compileConfig(c, opts);

        return {
          provide: c,
          useValue: config,
        };
      }),
    );

    return {
      module: TurboConfigModule,
      exports: providers,
      providers,
      global,
    };
  }
}
