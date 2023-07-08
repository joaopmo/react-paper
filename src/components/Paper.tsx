import React from 'react';
import { assert, imply } from '../utils';
import { Column } from './Column';
import { Root } from './Root';
import { type Structure, type StructureColumn } from '../types';
import { PaginatorBase, PaginatorMemo } from './Paginator';
interface PaperNestedProps {
  children: React.ReactNode;
  pageWidth: number;
  memoize: boolean;
}

function isString(s: any) {
  return typeof s === 'string' || s instanceof String;
}

export function Paper({
  children,
  pageWidth = 0.6,
  memoize = false,
}: PaperNestedProps): JSX.Element {
  const rootsFromChildren = React.useCallback(
    (children: React.ReactNode): StructureColumn => {
      const structure: StructureColumn = [];

      React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) {
          return;
        }

        if (child.type === React.Fragment) {
          structure.push(...rootsFromChildren(child.props.children));
          return;
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

  const structure = React.useMemo(() => {
    const structure: Structure = [];

    React.Children.forEach(children, (column, columnIndex) => {
      assert(
        React.isValidElement(column),
        `Children [${columnIndex}] is a invalid React Element. Expected a <Column> Element`,
      );
      assert(column.type === Column, `Children [${columnIndex}] is not a <Column>`);

      structure.push(rootsFromChildren(column.props.children));
    });

    return structure;
  }, [children, rootsFromChildren]);

  if (memoize) {
    return <PaginatorMemo structure={structure} pageWidth={pageWidth} />;
  }

  return <PaginatorBase structure={structure} pageWidth={pageWidth} />;
}
