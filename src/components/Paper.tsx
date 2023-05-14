import React from 'react';
import { assert } from '../utils';
import { Column } from './Column';
import { Root } from './Root';
import { type Structure, type StructureColumn } from '../types';
import { Paginator } from './Paginator';
interface PaperNestedProps {
  children: React.ReactNode;
  pageWidth: number;
}

function isString(s: any) {
  return typeof s === 'string' || s instanceof String;
}

export function Paper({ children, pageWidth = 0.6 }: PaperNestedProps): JSX.Element {
  const rootsFromChildren = React.useCallback((children: React.ReactNode): StructureColumn => {
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

      assert(isString(child.props.rootKey), `The rootKey prop of a <Root> must be of type string`);

      structure.push({
        element: child.props.element,
        content: child.props.content ?? 'text',
        rootKey: child.props.rootKey,
      });
    });

    return structure;
  }, []);

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

  return <Paginator structure={structure} pageWidth={pageWidth} />;
}
