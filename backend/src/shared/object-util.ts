import { Dictionary, PartialDict } from '.'

/**
 * Traverses the input data and changes all null values to undefined
 */
// TODO it would be cool to have correct return type and all that jazz. Currently we need to throw the return type
export function nullToUndefined(item: unknown): unknown {
  if (Array.isArray(item)) {
    return item.map((arrayItem) => nullToUndefined(arrayItem))
  } else if (item === null) {
    return undefined
  } else if (
    typeof item === 'object' &&
    !(item instanceof Date)
    // comment the blob thing since it causes trouble with our shitty frontend/backend structure right now
    /*&& !(item instanceof Blob)*/
  ) {
    const objectType = item as Record<string, unknown>
    const obj: Record<string, unknown> = {}
    for (const key in item) {
      obj[key] = nullToUndefined(objectType[key])
    }
    return obj
  } else {
    return item
  }
}

export function removeUndefined<T = any>(item: T): T {
  return JSON.parse(JSON.stringify(item)) as T
}

/**
 * Object.keys but keeps type safety
 */
export function objectKeys<T extends object>(obj: T): Array<keyof T> {
  const entries = Object.keys(obj)
  return entries as Array<keyof T>
}

/**
 * Object.entries but keeps type safety
 */
export function objectEntries<K extends string | number | symbol, V>(
  obj: Dictionary<K, V>,
): Array<[K, V]> {
  const entries = Object.entries(obj)
  return entries as Array<[K, V]>
}

export function objectEntriesPartial<K extends string | number | symbol, V>(
  obj: PartialDict<K, V>,
): Array<[K, V]> {
  const entries = Object.entries(obj)
  return entries as Array<[K, V]>
}

export const maybeUndefined = <T>(t: T) => {
  return t as T | undefined
}
