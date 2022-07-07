export const getByKeyPath = (
  target: Record<string, unknown>,
  path: string,
): unknown => {
  return path.split('.').reduce((previous: unknown, current) => {
    if (
      typeof previous === 'object' &&
      previous !== null &&
      current in previous
    ) {
      // @ts-expect-error 'current in previous' is checked above
      return previous[current];
    }
    return undefined;
  }, target);
};
