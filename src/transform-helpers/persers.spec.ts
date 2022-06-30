import { TurboConfigTransformerErr } from '../errors';
import { arrayParse, booleanParse, floatParse, intParse } from './parsers';

describe('Parsers spec', () => {
  describe('Int parser', () => {
    it('Should correctly parse valid number string', () => {
      const res = intParse('100', true, 10);
      expect(res).toBe(100);
    });

    it('Should handle already parsed value', () => {
      const res = intParse(100, true, 10);
      expect(res).toBe(100);
    });

    it('Should throw an error on invalid values', () => {
      expect(() => intParse({}, true, 10)).toThrowError(
        TurboConfigTransformerErr,
      );
      expect(() => intParse([], true, 10)).toThrowError(
        TurboConfigTransformerErr,
      );
      expect(() => intParse(true, true, 10)).toThrowError(
        TurboConfigTransformerErr,
      );
    });

    it('Should throw an error on NaN by default', () => {
      expect(() => intParse('aqwe', true, 10)).toThrowError(
        TurboConfigTransformerErr,
      );
    });

    it('Should not throw an error on NaN if it disabled by arg', () => {
      expect(() => intParse('aqwe', false, 10)).not.toThrow();
    });
  });

  describe('Float parser', () => {
    it('Should correctly parse valid float string', () => {
      const res = floatParse('999.57', true);
      expect(res).toBe(999.57);
    });

    it('Should handle already parsed value', () => {
      const res = intParse(9912.55, true, 10);
      expect(res).toBe(9912.55);
    });

    it('Should throw an error on invalid values', () => {
      expect(() => intParse({}, true, 10)).toThrowError(
        TurboConfigTransformerErr,
      );
      expect(() => intParse([], true, 10)).toThrowError(
        TurboConfigTransformerErr,
      );
      expect(() => intParse(true, true, 10)).toThrowError(
        TurboConfigTransformerErr,
      );
    });

    it('Should throw an error on NaN by default', () => {
      expect(() => floatParse('zxcqw', true)).toThrowError(
        TurboConfigTransformerErr,
      );
    });

    it('Should not throw an error on NaN if it disabled by arg', () => {
      expect(() => floatParse('zqwgg', false)).not.toThrow();
    });
  });

  describe('Boolean parser', () => {
    it('Should correctly parse valid boolean strings', () => {
      const res1 = booleanParse('true', true);
      expect(res1).toBe(true);

      const res2 = booleanParse('false', true);
      expect(res2).toBe(false);
    });

    it('Should handle already parsed value', () => {
      const res1 = booleanParse(true, true);
      expect(res1).toBe(true);

      const res2 = booleanParse(false, true);
      expect(res2).toBe(false);
    });

    it('Should throw an error on invalid value by default', () => {
      expect(() => booleanParse('zxcqw', true)).toThrowError(
        TurboConfigTransformerErr,
      );
    });

    it('Should not throw an error on invalid value if it disabled by arg', () => {
      expect(() => floatParse('xzxczxc', false)).not.toThrow();
    });
  });

  describe('Array parser', () => {
    it('Should process already parsed value', () => {
      const res = arrayParse([1, 2, 3], ',');
      expect(res).toEqual([1, 2, 3]);
    });

    it('Should parse correct array string with default separator', () => {
      const res = arrayParse('o,p,a', ',');
      expect(res).toEqual(['o', 'p', 'a']);
    });

    it('Should parse correct array string with custom separator', () => {
      const res = arrayParse('o|p|a', '|');
      expect(res).toEqual(['o', 'p', 'a']);
    });

    it('Should throw an error on invalid values', () => {
      expect(() => arrayParse({}, ',')).toThrowError(TurboConfigTransformerErr);
      expect(() => arrayParse(true, ',')).toThrowError(
        TurboConfigTransformerErr,
      );
    });
  });
});
