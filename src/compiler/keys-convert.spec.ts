import { CONFIG_SOURCE } from './config-sources';
import { getConfigKeyByGenericKey } from './keys-convert';

describe('Keys convertions spec', () => {
  describe('Yml keys convertions', () => {
    it('Should correctly handle various values', () => {
      const keys = [
        ['app', 'app'],
        ['.app', 'app'],
        ['APP', 'APP'],
        ['opa.zhopa', 'opa.zhopa'],
        ['OPA123_ZHOPA', 'OPA123_ZHOPA'],
        ['very.nested.key.very.very', 'very.nested.key.very.very'],
      ];

      for (const [input, output] of keys) {
        expect(getConfigKeyByGenericKey(input!, CONFIG_SOURCE.YAML)).toBe(
          output,
        );
      }
    });
  });

  describe('Env keys convertions', () => {
    it('Should correctly handle various values', () => {
      const keys = [
        ['app', 'APP'],
        ['.app', 'APP'],
        ['APP', 'APP'],
        ['opa.zhopa', 'OPA_ZHOPA'],
        ['OPA123_2ZHOPA', 'OPA123_2ZHOPA'],
        ['very.nested.key.very.very', 'VERY_NESTED_KEY_VERY_VERY'],
      ];

      for (const [input, output] of keys) {
        expect(getConfigKeyByGenericKey(input!, CONFIG_SOURCE.ENV)).toBe(
          output,
        );
      }
    });
  });
});
