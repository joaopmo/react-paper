export function imply(p: unknown, q: unknown): boolean {
  return p != null && p !== false ? Boolean(q) : true;
}
