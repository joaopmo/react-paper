import React from 'react';
import { invariant } from '../invariant';

export type Path = number[];

export type Subscribe = (ref: Element, path: Path) => () => void;

interface BaseField<T> {
  children: T[] | null;
}

interface ElementField<T> extends BaseField<T> {
  element: React.ReactNode | null;
  render?: ((ref: Element) => React.ReactNode | null) | null;
}

interface RenderField<T> extends BaseField<T> {
  element?: React.ReactNode | null;
  render: ((ref: Element) => React.ReactNode | null) | null;
}

export type FieldObject = ElementField<FieldObject> | RenderField<FieldObject>;
export type FieldObjectPartial =
  | Partial<ElementField<FieldObjectPartial>>
  | Partial<RenderField<FieldObjectPartial>>;

interface FieldProps {
  element?: React.ReactNode;
  render?: (ref: Element) => React.ReactNode | null;
  children?: React.ReactNode;
}

export function Field(props: FieldProps): JSX.Element {
  invariant(
    false,
    `A <Field> is only ever to be used as the child of <Fields> element, ` +
      `never rendered directly. Please wrap your <Field> in a <Fields>.`,
  );
}

export function structureFromChildren(children: React.ReactNode): FieldObject[] {
  const structure: FieldObject[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      return;
    }

    invariant(
      child.type === Field,
      `[${
        typeof child.type === 'string' ? child.type : child.type.name
      }] is not a <Field> component. All component children of <Column> must be a <Field>`,
    );

    const field: FieldObject = {
      element: child.props.element || null,
      render: child.props.render || null,
      children: null,
    };

    if (child.props.children) {
      field.children = structureFromChildren(child.props.children);
    }

    structure.push(field);
  });

  return structure;
}
