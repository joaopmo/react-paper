import { invariant } from '../invariant';

type PathImplStr<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? T[K] extends ArrayLike<any>
      ? K | `${K}.${PathImplStr<T[K], Exclude<keyof T[K], keyof any[]>>}`
      : K | `${K}.${PathImplStr<T[K], keyof T[K]>}`
    : K
  : never;

type PathImplArr<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? T[K] extends ArrayLike<any>
      ? [K] | [K, ...PathImplArr<T[K], Exclude<keyof T[K], keyof any[]>>]
      : [K] | [K, ...PathImplArr<T[K], keyof T[K]>]
    : [K]
  : never;

type Path<T> = PathImplStr<T, keyof T> | PathImplArr<T, keyof T>;

type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

// declare function get<T, P extends Path<T>>(obj: T, path: P): PathValue<T, P>;

const isValidString = (str: any): str is string => {
  const isString = typeof str === 'string' || str instanceof String;
  return isString && str.trim() !== '';
};

const isValidArray = (arr: any): arr is string[] => {
  return Array.isArray(arr) && arr.length !== 0;
};

export const stringToArray = <T>(str: Path<T>): string[] => {
  if (!isValidString(str)) return [];
  const path = str.match(/([^[.\]"'])+/g);
  return path ? path.map((val) => val.replaceAll(' ', '')) : [];
};

export function get<T, P extends Path<T>>(obj: T, path: P): PathValue<T, P> {
  const isString = isValidString(path);
  const isArray = isValidArray(path);
  invariant(isArray || isString, `Expected path to be an array or string but got ${typeof path}`);

  const pathArray = isString ? stringToArray<T>(path) : path;

  const result = pathArray.reduce((acc, key) => acc && acc[key], obj as PathValue<T, P>);

  return result;
}

// export const set = (obj, path, value) => {
//   const isString = isValidString(path);
//   const isArray = isValidArray(path);

//   if (!isString && !isArray) return obj;

//   const pathArray = isArray ? path : stringToPath(path);

//   pathArray.reduce((acc, key, i) => {
//     if (acc[key] === undefined) acc[key] = {};
//     if (i === pathArray.length - 1) acc[key] = value;
//     return acc[key];
//   }, obj);

//   return obj;
// };
