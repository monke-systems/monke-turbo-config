export const getFromEnvs = (keys: string[]) => {
  const rawConfig: Record<string, string | undefined> = {};

  for (const key of keys) {
    rawConfig[key] = process.env[key];
  }

  return rawConfig;
};
