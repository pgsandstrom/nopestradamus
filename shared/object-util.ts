// Type-safe Object.keys
export function objectKeys<T extends object>(object: T) {
  return Object.keys(object) as (keyof T)[]
}
