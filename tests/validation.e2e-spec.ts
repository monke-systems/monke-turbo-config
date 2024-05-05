import { IsHexColor, IsNumber, Min, ValidationError } from 'class-validator';
import { buildConfig, ConfigField, TurboConfigValidationErr } from '../src';
import { setEnvs } from './utils/test-utils';

describe('Validation spec (e2e)', () => {
  it('Should throw validation error', async () => {
    class Config {
      @ConfigField()
      @Min(1)
      @IsNumber()
      appPort!: number;
    }

    setEnvs(['APP_PORT', '-125125']);

    await expect(buildConfig(Config)).rejects.toThrowError(
      TurboConfigValidationErr,
    );
  });

  it('Should not throw and return validation errors', async () => {
    class ColorConfig {
      @ConfigField()
      @IsHexColor()
      color!: string;
    }

    setEnvs(['COLOR', 'notHexColor']);

    await expect(
      buildConfig(ColorConfig, {
        throwOnValidationError: false,
      }),
    ).resolves.not.toThrow();

    const res = await buildConfig(ColorConfig, {
      throwOnValidationError: false,
    });

    expect(Array.isArray(res.validationErrors)).toBe(true);
    expect(res.validationErrors).toHaveLength(1);
    expect(res.validationErrors[0]).toBeInstanceOf(ValidationError);
  });
});
