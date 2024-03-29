import { CONFIG_SOURCE } from './config-sources';
import {
  createKeyFromSegments,
  getConfigKeyByGenericKey,
} from './keys-convert';

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
        ['app.camelCaseTest', 'app.camelCaseTest'],
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
        ['app.camelCaseTest', 'APP_CAMEL_CASE_TEST'],
        ['app.CUMelCasETest', 'APP_CUMEL_CAS_ETEST'],
        ['app.124Cam456elcase', 'APP_124CAM456ELCASE'],
      ];

      for (const [input, output] of keys) {
        expect(getConfigKeyByGenericKey(input!, CONFIG_SOURCE.ENV)).toBe(
          output,
        );
      }
    });
  });

  describe('Create keys from segments', () => {
    it('Should correctly create keys from segments', () => {
      const cases = [
        {
          input: ['oneSegment'],
          expect: 'oneSegment',
        },
        {
          input: ['two', 'segments'],
          expect: 'two.segments',
        },
        {
          input: [undefined, 'leadingUndefined'],
          expect: 'leadingUndefined',
        },
        {
          input: ['trailingUndefined', undefined],
          expect: 'trailingUndefined',
        },
        {
          input: ['in', undefined, 'theMiddle'],
          expect: 'in.theMiddle',
        },
        {
          input: [undefined, 'everywhere', undefined],
          expect: 'everywhere',
        },
        {
          input: ['what', 'this', 'is', 'five', 'segments'],
          expect: 'what.this.is.five.segments',
        },
      ];

      for (const oneCase of cases) {
        expect(createKeyFromSegments(...oneCase.input)).toBe(oneCase.expect);
      }
    });
  });
});
