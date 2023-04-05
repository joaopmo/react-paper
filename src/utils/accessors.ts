import { assert } from './assert';
import { type Structure, type StructureColumn, type StructureField, type Path } from '../types';

type StructUnion = Structure | StructureColumn | StructureField | null;

const isValidArray = (arr: any): arr is any[] => {
  return Array.isArray(arr);
};

export function get(structure: StructUnion, path: Path): StructUnion {
  const isArray = isValidArray(path);
  assert(isArray, `Expected path to be an array but got ${typeof path}`);

  return path.reduce<StructUnion>((acc, key) => {
    if (isValidArray(acc)) return acc[key];
    if (acc?.children !== null && acc?.children !== undefined) return acc.children[key];
    return null;
  }, structure);
}

export function zip<T extends any[][]>(arr: T): any[][] {
  const maxLengthArr: null[] = Array(Math.max(...arr.map((a) => a.length))).fill(null);
  return maxLengthArr.map((_, i) => arr.map((a) => a[i] ?? null));
}
