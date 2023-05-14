export interface StructureRoot {
  content: 'block' | 'text';
  element: JSX.Element;
  rootKey: string;
}

export type StructureColumn = StructureRoot[];

export type Structure = StructureColumn[];
