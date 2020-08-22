import _ from 'lodash'
import { Dictionary, PartialDict } from '../shared'

/**
 * Traverses the input data and changes all null values to undefined
 */
export function nullToUndefined<T = any>(item: T): T {
  if (Array.isArray(item)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (item.map((arrayItem) => nullToUndefined(arrayItem)) as unknown) as T
  } else if (item === null) {
    return (undefined as unknown) as T
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  } else if ((item as any)?.constructor?.name === 'Object') {
    return (objectKeys(item).reduce((current, key) => {
      return { ...current, [key]: nullToUndefined(item[key]) }
    }, {}) as unknown) as T
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
export function objectKeys<T>(obj: T): Array<keyof T> {
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
