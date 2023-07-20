import type React from 'react';
export interface StructureRoot {
  content: 'block' | 'text' | 'parallel' | 'header';
  element: React.ReactNode;
  rootKey?: string;
}

export type StructureColumn = StructureRoot[];

export type Structure = StructureColumn[];
