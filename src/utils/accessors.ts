import { invariant } from '../invariant';
import { Path } from '../components/Field';
import { StructureObject } from './transforms';
import { ColumnObject } from '../components/Column';
import { FieldObject } from '../components/Field';

type StructUnion = StructureObject | ColumnObject | FieldObject | null;

const isValidArray = (arr: any): arr is Array<any> => {
  return Array.isArray(arr);
};

export function get(structure: StructUnion, path: Path) {
  const isArray = isValidArray(path);
  invariant(isArray, `Expected path to be an array but got ${typeof path}`);

  const result = path.reduce((acc, key) => {
    if (isValidArray(acc)) return acc[key];
    if (acc && Object.hasOwn(acc, 'children')) return acc.children![key];
    return null;
  }, structure as StructUnion);

  return result;
}

export function zip<T extends any[][]>(arr: T) {
  const maxLengthArr: null[] = Array(Math.max(...arr.map((a) => a.length))).fill(null);
  return maxLengthArr.map((_, i) => arr.map((a) => a[i] ?? null));
}
