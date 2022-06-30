import { CliKey, EnvKey, GenericKey, YamlKey } from '../decorators/decorators';
import { TurboConfigCompileError } from '../errors';
import { buildPropertiesMap } from './compiler';

describe('Compiler spec', () => {
  describe('buildPropertiesMap spec', () => {
    it('Should build correct property map', () => {
      class TestConf {
        @GenericKey('gen')
        @YamlKey('yml')
        @EnvKey('ENV')
        @CliKey('cli')
        p!: string;

        @YamlKey('gYaml')
        g!: string;

        @GenericKey('only.generic')
        c!: number;
      }

      const res = buildPropertiesMap(TestConf);

      expect(res).toEqual({
        p: { cli: 'cli', env: 'ENV', yaml: 'yml' },
        g: { yaml: 'gYaml', cli: undefined, env: undefined },
        c: {
          cli: 'only.generic',
          yaml: 'only.generic',
          env: 'ONLY_GENERIC',
        },
      });
    });

    it('Should throw an error if generic keys are disabled', () => {
      class TestConf2 {
        @GenericKey('ke')
        p!: string;
      }
      expect(() =>
        buildPropertiesMap(TestConf2, { disallowGenericKeys: true }),
      ).toThrowError(TurboConfigCompileError);
    });
  });
});
