import { type Path } from './schema';
export * from './style';
export * from './schema';
export * from './structure';
export type Subscribe = (ref: Element, path: Path) => () => void;
