export const isNodeJsError = (e: any): e is NodeJS.ErrnoException => {
  return 'code' in e && 'message' in e;
};

export const isError = (e: any): e is Error => {
  return 'message' in e;
};
