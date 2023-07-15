import type React from 'react';
export interface StructureRoot {
  content: 'block' | 'text' | 'parallel';
  element: React.ReactNode;
  rootKey?: string;
}

export type StructureColumn = StructureRoot[];

export type Structure = StructureColumn[];
