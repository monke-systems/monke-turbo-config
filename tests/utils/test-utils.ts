import * as path from 'path';

export enum E2E_YAMLS {
  COMPLEX = 'complex-config.yml',
  OVERRIDE = 'override-config.yml',
}

export const getE2EYamlPath = (file: E2E_YAMLS): string => {
  return path.resolve(process.cwd(), 'tests', 'files', 'configs', file);
};

export const setEnvs = (envs: [string, string][]) => {
  for (const [key, value] of envs) {
    process.env[key] = value;
  }
};
