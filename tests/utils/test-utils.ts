import * as path from 'path';

export enum E2E_YAMLS {
  COMPLEX = 'complex-config.yml',
  COMPLEX_PREFIXED = 'complex-prefixed.yml',
  OVERRIDE = 'override-config.yml',
  INVALID = 'invalid-config.yml',
  NOT_EXISTS = 'not-exists.yml',
}

export enum E2E_ENV_FILES {
  COMPLEX = '.env.complex',
  OVERRIDE = '.env.override',
}

export const getE2EYamlPath = (file: E2E_YAMLS): string => {
  return path.resolve(process.cwd(), 'tests', 'files', 'configs', file);
};

export const getE2EEnvFilePath = (file: E2E_ENV_FILES): string => {
  return path.resolve(process.cwd(), 'tests', 'files', 'env-files', file);
};

export const setEnvs = (...envs: [string, string][]) => {
  for (const [key, value] of envs) {
    process.env[key] = value;
  }
};

export const setArgs = (...args: string[]) => {
  for (const arg of args) {
    process.argv.push(arg);
  }
};
