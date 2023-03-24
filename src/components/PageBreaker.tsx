import React from 'react';
import { invariant } from '../invariant';
import { structureFromChildren } from './Field';
import { Paginator } from './Paginator';
import { StructureObject } from '../utils/transforms';
import { Column } from './Column';
import { DimensionProvider } from './Dimension';
import { xor } from '../utils/operators';

interface ChildrenPBProps {
  children: React.ReactNode | null;
  structure?: StructureObject | null;
}

interface StructurePBProps {
  children?: React.ReactNode | null;
  structure: StructureObject | null;
}

type PageBreakerProps = ChildrenPBProps | StructurePBProps;

export function PageBreaker({ children, structure }: PageBreakerProps): JSX.Element {
  invariant(
    xor(children, structure),
    `<PageBreaker> should have either children or structure props`,
  );

  const structFromChildren = React.useMemo(() => {
    if (!children) return;
    const columnCount = React.Children.toArray(children).length;
    const tempStructure: StructureObject = Array.from({ length: columnCount }, () => []);

    React.Children.forEach(children, (column, columnIndex) => {
      if (!React.isValidElement(column)) return;

      invariant(
        column.type === Column,
        `[${
          typeof column.type === 'string' ? column.type : column.type.name
        }] is not a <Column> component. All component children of <PageBreaker> must be a <Column>`,
      );

      if (!column.props.children) return;

      React.Children.forEach(column.props.children, (field) => {
        if (!React.isValidElement(field)) return;
        tempStructure[columnIndex].push(...structureFromChildren(field));
      });
    });

    return tempStructure;
  }, [children]);

  return (
    <DimensionProvider widthFrac={0.8} multiplier={3.78}>
      <Paginator structure={structure || (structFromChildren as StructureObject)} />
    </DimensionProvider>
  );
}
