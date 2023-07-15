import React, { useCallback } from 'react';
import { assert, imply } from '../utils';
import { Column } from './Column';
import { Root } from './Root';
import { type Structure, type StructureColumn } from '../types';
import { PaginatorBase, PaginatorMemo } from './Paginator';
interface PaperProps {
  children?: React.ReactNode;
  pageWidth?: number;
  memoize?: boolean;
}

function isString(s: any) {
  return typeof s === 'string' || s instanceof String;
}

export function Paper({ children, pageWidth = 0.6, memoize = false }: PaperProps): React.ReactNode {
  assert(
    pageWidth >= 0.1 && pageWidth <= 1,
    `The pageWidth prop should be a number between 0.1 and 1.`,
  );

  const rootsFromChildren = React.useCallback(
    (children: React.ReactNode): StructureColumn => {
      const structure: StructureColumn = [];

      React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) {
          return;
        }

        if (child.type === React.Fragment) {
          return structure.push(...rootsFromChildren(child.props.children));
        }

        assert(
          child.type === Root,
          `[${
            typeof child.type === 'string' ? child.type : child.type.name
          }] is not a <Root> component. All component children of <Column> must be a <Root>  or <React.Fragment>`,
        );

        assert(
          React.isValidElement(child.props.element),
          `The element prop of a <Root> must be a valid React Element`,
        );

        assert(
          imply(memoize, isString(child.props.rootKey)),
          `When <Paper> has the memoize prop every <Root> must have a rootKey prop of type string`,
        );

        structure.push({
          element: child.props.element,
          rootKey: child.props.rootKey ?? '',
          content: child.props.content ?? 'text',
        });
      });

      return structure;
    },
    [memoize],
  );

  const columnsFromChildren = useCallback(
    (children: React.ReactNode): Structure => {
      const structure: Structure = [];

      React.Children.forEach(children, (column, columnIndex) => {
        assert(
          React.isValidElement(column),
          `Children [${columnIndex}] is an invalid React Element. Expected a <Column> Element`,
        );

        if (column.type === React.Fragment) {
          return structure.push(...columnsFromChildren(column.props.children));
        }

        assert(column.type === Column, `Children [${columnIndex}] is not a <Column>`);

        structure.push(rootsFromChildren(column.props.children));
      });

      return structure;
    },
    [rootsFromChildren],
  );

  const structure = React.useMemo(() => {
    return columnsFromChildren(children);
  }, [children, columnsFromChildren]);

  if (memoize) {
    return <PaginatorMemo structure={structure} pageWidth={pageWidth} />;
  }

  return <PaginatorBase structure={structure} pageWidth={pageWidth} />;
}
