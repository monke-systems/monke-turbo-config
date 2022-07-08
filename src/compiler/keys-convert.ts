import { TurboConfigUnknownErr } from '../errors';
import { CONFIG_SOURCE } from './config-sources';

const envConvert = (raw: string) => {
  return raw.split('').reduce((result, char, i) => {
    const withoutChanges = /\d/.test(char);

    if (withoutChanges) {
      result += char;
      return result;
    }

    const alwaysReplace = /\./.test(char);

    if (alwaysReplace) {
      result += '_';
      return result;
    }

    const isUpperCaseLetter = /[A-Z]/.test(char);

    if (isUpperCaseLetter) {
      const previousChar = raw[i - 1] ?? '';

      const shouldAddSeparator = /[a-z]/.test(previousChar);

      if (shouldAddSeparator) {
        result += `_${char.toUpperCase()}`;
        return result;
      }
    }

    result += char.toUpperCase();
    return result;
  }, '');
};

export const getConfigKeyByGenericKey = (
  key: string,
  source: CONFIG_SOURCE,
): string => {
  const withoutLeadingDot = key.charAt(0) === '.' ? key.slice(1) : key;

  if (source === CONFIG_SOURCE.YAML) {
    return withoutLeadingDot;
  }
  if (source === CONFIG_SOURCE.CLI) {
    return withoutLeadingDot;
  }
  if (source === CONFIG_SOURCE.ENV) {
    return envConvert(withoutLeadingDot);
  }

  throw new TurboConfigUnknownErr('Uknown source type');
};
