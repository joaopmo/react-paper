interface BaseField<T> {
  children: T[] | null;
  content: 'block' | 'text';
  element: JSX.Element | null;
}

export type StructureField = BaseField<StructureField>;
export type StructureFieldPartial = Partial<BaseField<StructureFieldPartial>>;

export type StructureColumn = StructureField[];
export type StructureColumnPartial = StructureFieldPartial[];

export type Structure = StructureColumn[];
export type StructurePartial = StructureColumnPartial[];
