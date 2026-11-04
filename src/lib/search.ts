/**
 * Removes keys whose value is undefined, so objects can be passed as route
 * search params under `exactOptionalPropertyTypes`.
 */
export function compact<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined)) as T;
}
