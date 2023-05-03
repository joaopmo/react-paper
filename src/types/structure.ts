export interface StructureNode {
  content: 'block' | 'text';
  element: JSX.Element | null;
}

export type StructureColumn = StructureNode[];

export type Structure = StructureColumn[];
