export function zip<T extends any[][]>(arr: T): any[][] {
  const maxLength = Math.max(...arr.map((a) => a.length));
  const maxLengthArr: null[] = Array(isFinite(maxLength) ? maxLength : 0).fill(null);
  const zipped = maxLengthArr.map((_, i) => arr.map((a) => a[i] ?? null));
  return zipped.length > 0 ? zipped : [[]];
}
