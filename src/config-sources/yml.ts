import * as fs from 'fs';
import * as deepMerge from 'deepmerge';
import * as YAML from 'yaml';

export const getConfigFromYml = (filePaths: string[], keys: string[]) => {
  const yamls = filePaths.map((filePath) => {
    const file = fs.readFileSync(filePath, 'utf-8');
    return YAML.parse(file);
  });

  yamls.reduce((accum, value) => {
    return deepMerge(accum, value);
  }, {});
};
