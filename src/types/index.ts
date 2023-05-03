export * from './style';
export * from './schema';
export * from './structure';
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];
