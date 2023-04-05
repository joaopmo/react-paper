export function assert(value: boolean, message?: string): asserts value;

export function assert<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T;

export function assert(value: unknown, message?: string): void | never {
  if (value === false || value === null || value === undefined) {
    throw new Error(message);
  }
}