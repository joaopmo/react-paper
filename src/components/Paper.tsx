import React from 'react';
import { assert } from '../utils';
import { Column } from './Column';
import { Level } from './Level';
import { Node } from './Node';
import { type Structure } from '../types';
import { Paginator } from './Paginator';
interface PaperNestedProps {
  children: React.ReactNode;
  pageWidth: number;
}

export function Paper({ children, pageWidth = 0.6 }: PaperNestedProps): JSX.Element {
  const iterate = React.useCallback(
    (children: React.ReactNode, structure: Structure, index: number = 0) => {
      React.Children.forEach(children, (child, childIndex) => {
        assert(React.isValidElement(child), `Invalid React Element Detected`);

        switch (child.type) {
          case Column:
            iterate(child.props.children, structure, childIndex);
            return;
          case Level:
            iterate(child.props.children, structure, index);
            return;
          case Node: {
            assert(
              child.props.element != null,
              `A <Node> component is lacking the required element prop`,
            );
            return structure[index].push({
              element: child.props.element ?? null,
              content: child.props.content ?? 'text',
            });
          }
          default:
            assert(
              false,
              `Invalid component [${
                typeof child.type === 'string' ? child.type : child.type.name
              }].`,
            );
        }
      });
    },
    [],
  );

  const structure = React.useMemo(() => {
    const columnCount = React.Children.toArray(children).length;
    const tempStructure: Structure = Array.from({ length: columnCount }, () => []);
    iterate(children, tempStructure);
    return tempStructure;
  }, [children]);

  return <Paginator structure={structure} pageWidth={pageWidth} />;
}
