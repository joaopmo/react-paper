export function imply(p: unknown, q: unknown): boolean {
  return Boolean(p != null || q);
}
