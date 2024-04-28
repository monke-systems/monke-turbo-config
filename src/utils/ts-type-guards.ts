export const isNodeJsError = (e: unknown): e is NodeJS.ErrnoException => {
  if (typeof e !== 'object' || e === null) return false;

  return 'code' in e && 'message' in e;
};

export const isError = (e: unknown): e is Error => {
  if (typeof e !== 'object' || e === null) return false;

  return 'message' in e;
};
