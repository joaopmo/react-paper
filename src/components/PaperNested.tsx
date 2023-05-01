import React from 'react';
import { assert } from '../utils';
import { Column } from './Column';
import { Level } from './Level';
import { Node } from './Node';
import { type Structure } from '../types';
import { PaginatorNested } from './PaginatorNested';
interface PaperNestedProps {
  children: React.ReactNode;
  pageWidth: number;
}

export function PaperNested({ children, pageWidth = 0.6 }: PaperNestedProps): JSX.Element {
  const structure = React.useMemo(() => {
    const columnCount = React.Children.toArray(children).length;
    const tempStructure: Structure = Array.from({ length: columnCount }, () => []);
    const iterate = (children: React.ReactNode, columnIndex: number = 0) => {
      React.Children.forEach(children, (child, childIndex) => {
        assert(React.isValidElement(child), `Column ${childIndex} is an invalid React Element`);

        switch (child.type) {
          case Column: {
            iterate(child.props.children, childIndex);
            return;
          }
          case Level: {
            iterate(child.props.children, columnIndex);
            return;
          }
          case Node: {
            return tempStructure[columnIndex].push({
              element: child.props.element ?? null,
              content: child.props.content ?? 'text',
              children: null,
            });
          }
          default:
            assert(
              false,
              `Invalid component [${
                typeof child.type === 'string' ? child.type : child.type.name
              }].`,
            );
            break;
        }
      });
    };

    iterate(children);
    return tempStructure;
  }, [children]);

  // console.log(structure);

  return <PaginatorNested structure={structure} pageWidth={pageWidth} />;
}
