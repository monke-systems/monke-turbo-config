import type { DynamicModule } from '@nestjs/common';
import { compileConfig } from '../compiler/compiler';
import type { CompileConfigOptions } from '../compiler/compiler-options';

export class TurboConfigModule {
  static async forRootAsync<T extends object>(
    configClass: new () => T,
    opts: CompileConfigOptions = {},
  ): Promise<DynamicModule> {
    return TurboConfigModule.register(configClass, opts, true);
  }

  static async registerAsync<T extends object>(
    configClass: new () => T,
    opts: CompileConfigOptions = {},
  ): Promise<DynamicModule> {
    return TurboConfigModule.register(configClass, opts, false);
  }

  private static async register<T extends object>(
    configClass: new () => T,
    opts: CompileConfigOptions,
    global: boolean,
  ): Promise<DynamicModule> {
    const { config } = await compileConfig(configClass, opts);

    const providers = [
      {
        useValue: config,
        provide: configClass,
      },
    ];

    return {
      module: TurboConfigModule,
      providers,
      global,
    };
  }
}
