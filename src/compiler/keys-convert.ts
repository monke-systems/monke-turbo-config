import { TurboConfigUnknownErr } from '../errors';
import { CONFIG_SOURCE } from './config-sources';

const envConvert = (raw: string) => {
  return raw.toUpperCase().replace(/\./g, '_');
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
