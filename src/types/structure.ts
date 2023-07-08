export interface StructureRoot {
  content: 'block' | 'text' | 'parallel';
  element: JSX.Element;
  rootKey?: string;
}

export type StructureColumn = StructureRoot[];

export type Structure = StructureColumn[];
