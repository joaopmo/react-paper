import React from 'react';
import { Field } from '../components';
import { assert } from './assert';
import {
  type StructureField,
  type StructureFieldPartial,
  type Structure,
  type StructurePartial,
  type StructureColumn,
} from '../types';

export function fieldNormalizer(field: StructureFieldPartial): StructureField {
  const { element, content, children } = field;
  let normalized: StructureField['children'] = null;

  if (children !== null && children !== undefined) {
    normalized = [];
    children.forEach((child) => {
      (normalized as StructureColumn).push(fieldNormalizer(child));
    });
  }

  return {
    element: element ?? null,
    content: content ?? 'text',
    children: normalized,
  };
}

export function createStructure(columns: StructurePartial): Structure {
  return columns.map((column) => {
    return column.map((field) => {
      return fieldNormalizer(field);
    });
  });
}

export function structureFromChildren(children: React.ReactNode): StructureColumn {
  const structure: StructureColumn = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      return;
    }

    if (child.type === React.Fragment) {
      structure.push(...structureFromChildren(child.props.children));
      return;
    }

    assert(
      child.type === Field,
      `[${
        typeof child.type === 'string' ? child.type : child.type.name
      }] is not a <Field> component. All component children of <Column> must be a <Field>  or <React.Fragment>`,
    );

    const field: StructureField = {
      element: child.props.element ?? null,
      content: child.props.content ?? 'text',
      children: null,
    };

    if (child.props.children !== null && child.props.children !== undefined) {
      field.children = structureFromChildren(child.props.children);
    }

    structure.push(field);
  });

  return structure;
}
