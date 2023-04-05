import React from 'react';
import { assert, structureFromChildren, xor } from '../utils';
import { Paginator } from './Paginator';
import { Column } from './Column';
import { type Structure } from '../types';

interface BaseProps {
  pageWidth?: number;
}
interface PaperChildrenProps extends BaseProps {
  children: React.ReactNode | null;
  structure?: Structure | null;
}

interface PaperStructureProps extends BaseProps {
  children?: React.ReactNode | null;
  structure: Structure | null;
}

type PaperProps = PaperChildrenProps | PaperStructureProps;

export function Paper({ children, structure, pageWidth = 0.6 }: PaperProps): JSX.Element {
  assert(xor(children, structure), `<Paper> should have either children or structure props`);

  const structFromChildren = React.useMemo(() => {
    if (children === undefined || children === null) return;
    const columnCount = React.Children.toArray(children).length;
    const tempStructure: Structure = Array.from({ length: columnCount }, () => []);

    React.Children.forEach(children, (column, columnIndex) => {
      if (!React.isValidElement(column)) return;

      assert(
        column.type === Column,
        `[${
          typeof column.type === 'string' ? column.type : column.type.name
        }] is not a <Column> component. All component children of <Paper> must be a <Column>`,
      );

      if (column.props.children === undefined || column.props.children === null) return;

      React.Children.forEach(column.props.children, (field) => {
        if (!React.isValidElement(field)) return;
        tempStructure[columnIndex].push(...structureFromChildren(field));
      });
    });

    return tempStructure;
  }, [children]);

  return (
    <Paginator structure={structure ?? (structFromChildren as Structure)} pageWidth={pageWidth} />
  );
}
