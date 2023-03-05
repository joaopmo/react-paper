import { FieldObjectPartial, FieldObject } from '../components/Field';
import { ColumnObject, ColumnObjectPartial } from '../components/Column';

export type StructureObject = ColumnObject[];
type StructureObjectPartial = ColumnObjectPartial[];

export function fieldNormalizer(field: FieldObjectPartial): FieldObject {
  const { element, render, children } = field;
  let normalized: FieldObject['children'] = null;

  if (children) {
    normalized = [];
    children.forEach((child) => {
      (normalized as FieldObject[]).push(fieldNormalizer(child));
    });
  }

  return {
    element: element || null,
    render: render || null,
    children: normalized,
  };
}

export function createStructure(columns: StructureObjectPartial): StructureObject {
  return columns.map((column) => {
    return column.map((field) => {
      return fieldNormalizer(field);
    });
  });
}
