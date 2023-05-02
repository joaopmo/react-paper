export function zip<T extends any[][]>(arr: T): any[][] {
  const maxLengthArr: null[] = Array(Math.max(...arr.map((a) => a.length))).fill(null);
  return maxLengthArr.map((_, i) => arr.map((a) => a[i] ?? null));
}
