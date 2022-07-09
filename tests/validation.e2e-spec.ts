import { IsHexColor, IsNumber, Min, ValidationError } from 'class-validator';
import {
  compileConfig,
  EnvKey,
  TurboConfigValidationErr,
  IntTransformer,
} from '../src';
import { setEnvs } from './utils/test-utils';

describe('Validation spec (e2e)', () => {
  it('Should throw validation error', async () => {
    class Config {
      @EnvKey('APP_PORT')
      @IntTransformer()
      @Min(1)
      @IsNumber()
      appPort!: number;
    }

    setEnvs(['APP_PORT', '-125125']);

    await expect(compileConfig(Config)).rejects.toThrowError(
      TurboConfigValidationErr,
    );
  });

  it('Should not throw and return validation errors', async () => {
    class ColorConfig {
      @EnvKey('COLOR')
      @IsHexColor()
      color!: string;
    }

    setEnvs(['COLOR', 'notHexColor']);

    await expect(
      compileConfig(ColorConfig, {
        throwOnValidatonError: false,
      }),
    ).resolves.not.toThrow();

    const res = await compileConfig(ColorConfig, {
      throwOnValidatonError: false,
    });

    expect(Array.isArray(res.validationErrors)).toBe(true);
    expect(res.validationErrors).toHaveLength(1);
    expect(res.validationErrors[0]).toBeInstanceOf(ValidationError);
  });
});
