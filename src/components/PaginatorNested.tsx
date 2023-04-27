/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import React from 'react';
import { useColumnsMap, SubscribersContext, type State } from './Paginator';
import { DimensionProvider } from './Dimension';
import { zip, debounce, getStyle } from '../utils';
import { PageNested } from './PageNested';
import {
  type Path,
  type Schema,
  type SchemaColumn,
  type SchemaPage,
  type Structure,
  type Style,
} from '../types';

export interface Node {
  path: Path;
  children: number;
  content: 'block' | 'text' | null;
  element: Element;
}

function useNodePathMap() {
  // const elementToNode = React.useRef<Map<Element, Node>>(new Map());
  const pathToNode = React.useRef<Map<string, Node>>(new Map());
  const pathToChildren = React.useRef<Map<string, number>>(new Map());

  return React.useMemo(() => {
    return {
      set(node: Node) {
        pathToNode.current.set(node.path.join('.'), node);
        // elementToNode.current.set(node.element, node);

        const childCount = pathToChildren.current.get(node.path.join('.'));
        if (childCount === undefined) {
          pathToChildren.current.set(node.path.join('.'), 0);
        }

        for (let i = node.path.length - 1; i > 0; i--) {
          let parentChildCount = pathToChildren.current.get(node.path.slice(0, i).join('.'));

          if (parentChildCount === undefined && childCount === undefined) {
            pathToChildren.current.set(node.path.slice(0, i).join('.'), 1);
            continue;
          }

          if (parentChildCount !== undefined && childCount === undefined) {
            pathToChildren.current.set(node.path.slice(0, i).join('.'), ++parentChildCount);
          }
          break;
        }
      },
      get(key: Element | Path) {
        if (Array.isArray(key)) {
          const children = pathToChildren.current.get(key.join('.'));
          const node = pathToNode.current.get(key.join('.'));
          if (children !== undefined && node !== undefined) {
            return {
              ...node,
              children,
            };
          }
          return node;
        }

        if (key instanceof Element) {
          for (const node of pathToNode.current.values()) {
            if (
              node.element.isEqualNode(key) ||
              node.element === key ||
              node.element.getAttribute('data-id') === key.getAttribute('data-id')
            ) {
              const children = pathToChildren.current.get(node.path.join('.'));
              if (children !== undefined) {
                return {
                  ...node,
                  children,
                };
              }
              return node;
            }
          }

          return undefined;

          // const node = elementToNode.current.get(key);
          // if (node !== undefined) {
          //   const children = pathToChildren.current.get(node.path.join('.'));
          //   if (children !== undefined)
          //     return {
          //       ...node,
          //       children,
          //     };
          // }
          //
          // return node;
        }
      },
      has(path: Path) {
        return pathToNode.current.has(path.join('.'));
      },
      delete(node: Node) {
        pathToNode.current.delete(node.path.join('.'));
        // elementToNode.current.delete(node.element);

        const childDeleted = pathToChildren.current.delete(node.path.join('.'));
        let parentChildCount = pathToChildren.current.get(node.path.slice(0, -1).join('.'));
        if (parentChildCount !== undefined && childDeleted) {
          pathToChildren.current.set(node.path.slice(0, -1).join('.'), --parentChildCount);
        }
      },
      log() {
        pathToNode.current.forEach((value, key) => {
          console.log(
            key,
            JSON.stringify(
              { path: value.path, content: value.content, children: value.children },
              null,
              2,
            ),
          );
        });
      },
    };
  }, []);
}

interface PaginatorNestedProps {
  structure: Structure;
  pageWidth: number;
}

export function PaginatorNested({ structure, pageWidth }: PaginatorNestedProps) {
  const COLUMN = 0;
  const ROOT_NODE = 1;
  const [loading, setLoading] = React.useState(true);
  const columnsMap = useColumnsMap();
  const nodesMap = useNodePathMap();

  function reducer(
    state: Schema,
    { type, payload }: { type: string; payload: { leadChanges?: Map<number, Path> } },
  ) {
    const { leadChanges } = payload;
    switch (type) {
      case 'resize':
        calcPosition(state, leadChanges);
        return state;

      default:
        throw new Error('Invalid case');
    }
  }

  const findSlice = React.useCallback((path: Path, schema: Schema) => {
    const [columnIndex, fieldIndex] = path;
    const column = schema[columnIndex];
    let pageIt = 0;
    let sliceIt = column[pageIt].length - 1;
    let page = 0;
    let slice = 0;

    while (pageIt < column.length && sliceIt >= 0) {
      if (column[pageIt][sliceIt].path[ROOT_NODE] === fieldIndex) {
        page = column[pageIt][sliceIt].leadPage;
        slice = column[page].findIndex((value) => {
          return value.path[ROOT_NODE] === fieldIndex;
        });
        return [page, slice];
      }

      if (column[pageIt][sliceIt].path[ROOT_NODE] < fieldIndex) {
        pageIt++;
      } else {
        sliceIt--;
      }
    }

    return [page, slice];
  }, []);

  const boxOverflow = React.useCallback(
    (state: State, page: SchemaPage, column: SchemaColumn, box: keyof Style<number>) => {
      let currentBox = state.style[box];

      // Logic to handle margin collapse between adjacent siblings.
      // Margin collapse between parent and descendants is handled
      // by .pb-page * { overflow: hidden; } css rule.
      // =================================================================
      if (box === 'marginTop' && state.prevSibEl != null) {
        currentBox = 0;
      }

      if (box === 'marginBottom' && state.nextSibEl != null) {
        const { marginTop } = getStyle(state.nextSibEl);
        currentBox = marginTop > currentBox ? marginTop : currentBox;
      }
      // =================================================================

      // eslint-disable-next-line no-constant-condition
      while (true) {
        // if (state.field.content === 'block') {
        //   console.log(box);
        //   console.log(currentBox);
        //   console.log(state);
        //   console.log('\n\n');
        // }

        if (state.freeHeight >= currentBox) {
          state.lowerBound = state.lowerBound + currentBox;
          state.addedHeight = state.addedHeight + currentBox;
          state.freeHeight = state.freeHeight - currentBox;
          break;
        }

        if (
          box === 'contentBox' &&
          state.field.content === 'text' &&
          state.freeHeight >= state.style.lineHeight
        ) {
          const cap = state.freeHeight - (state.freeHeight % state.style.lineHeight);
          state.lowerBound = state.lowerBound + cap;
          state.addedHeight = state.addedHeight + cap;
          state.freeHeight = state.freeHeight - cap;
          currentBox = currentBox - cap;
        }

        if (box === 'marginTop' && state.currPath.length === 2) {
          state.leadPage++;
        }

        page.push({
          path: state.currPath.slice(0, 2),
          current: state.currSlice++,
          leadPage: state.leadPage,
          addedHeight: state.addedHeight,
          upperBound: state.upperBound,
          lowerBound: state.lowerBound,
        });

        column.push([...page]);
        page.length = 0;
        state.addedHeight = 0;
        state.upperBound = state.lowerBound;
        state.freeHeight = getStyle(columnsMap.get(state.currPath[COLUMN])!).contentBox;
      }
    },
    [columnsMap],
  );

  const allocateFromStructure = React.useCallback(
    (path: Path, schema: Schema) => {
      const [leadPage, sliceIdx] = findSlice(path, schema);
      const page: SchemaPage = schema[path[COLUMN]][leadPage].slice(0, sliceIdx);
      const column: SchemaColumn = schema[path[COLUMN]].slice(0, leadPage);
      const { contentBox: columnHeight } = getStyle(columnsMap.get(path[COLUMN])!);
      const addedHeight = page.at(-1)?.addedHeight ?? 0;
      const freeHeight = columnHeight - addedHeight;

      const state: State = {
        prevPath: [],
        currPath: path,
        leadPage,
        currSlice: 0,
        upperBound: 0,
        lowerBound: 0,
        addedHeight,
        freeHeight,
        style: getStyle((nodesMap.get(path) as Node).element),
        field: nodesMap.get(path) as Node,
      };

      const pathStack: Path[] = [];
      for (let i = structure[path[COLUMN]].length - 1; i >= path[ROOT_NODE]; i--) {
        pathStack.push([path[COLUMN], i]);
      }

      while (pathStack.length > 0) {
        state.currPath = pathStack.pop()!;
        const parent = state.currPath.slice(0, -1);

        state.style = getStyle((nodesMap.get(state.currPath) as Node).element);

        // console.log(state.currPath);
        // console.log(state.style);
        // console.log(nodesMap.get(state.currPath));
        // console.log('\n');

        state.field = nodesMap.get(state.currPath) as Node;
        state.prevSibEl = nodesMap.get([...parent, state.currPath.at(-1)! - 1])?.element;
        state.nextSibEl = nodesMap.get([...parent, state.currPath.at(-1)! + 1])?.element;

        if (state.prevPath.length > 0 && state.prevPath[ROOT_NODE] !== state.currPath[ROOT_NODE]) {
          state.currSlice = 0;
          state.upperBound = state.style.marginTop;
          state.lowerBound = state.style.marginTop;
        }

        // if (state.field.content === 'block') {
        // }

        if (state.prevPath.length <= state.currPath.length) {
          boxOverflow(state, page, column, 'marginTop');
          boxOverflow(state, page, column, 'borderTop');
          boxOverflow(state, page, column, 'paddingTop');

          if (state.field.children !== 0 && state.field.content !== 'block') {
            pathStack.push([...state.currPath]);
            for (let i = state.field.children - 1; i >= 0; i--) {
              pathStack.push([...state.currPath, i]);
            }
            state.prevPath = [...state.currPath];
            continue;
          }

          boxOverflow(state, page, column, 'contentBox');
        }

        boxOverflow(state, page, column, 'paddingBottom');
        boxOverflow(state, page, column, 'borderBottom');
        boxOverflow(state, page, column, 'marginBottom');

        if (state.currPath.length === 2) {
          page.push({
            path: state.currPath.slice(0, 2),
            current: state.currSlice++,
            leadPage: state.leadPage,
            addedHeight: state.addedHeight,
            upperBound: state.upperBound,
            lowerBound: state.lowerBound,
          });
        }

        state.prevPath = [...state.currPath];
      }

      if (page.length > 0) {
        column.push([...page]);
      }

      return column;
    },
    [findSlice, columnsMap, structure, boxOverflow],
  );

  const calcPosition = React.useCallback(
    function (schema: Schema, leadChanges?: Map<number, Path>) {
      // For the useEffect
      if (leadChanges == null) {
        leadChanges = new Map();
        structure.forEach((_, columnIndex) => {
          leadChanges?.set(columnIndex, [columnIndex, 0]);
        });
      }

      for (const [column, path] of leadChanges) {
        schema[column] = allocateFromStructure(path, schema);
      }
    },
    [structure, allocateFromStructure],
  );

  const [schema, dispatch] = React.useReducer(reducer, [], (schema: Schema): Schema => {
    schema = structure.map((column, columnIndex) => {
      const page = column.map((_, fieldIndex) => {
        return {
          path: [columnIndex, fieldIndex],
          current: 0,
          leadPage: 0,
          upperBound: 0,
          lowerBound: 0,
          addedHeight: 0,
        };
      });
      return [page];
    });

    return schema;
  });

  const resizeHandler = React.useCallback((entries: ResizeObserverEntry[]) => {
    const leadChanges = entries.reduce((acc, { target: el }) => {
      const potentialPath = (nodesMap.get(el) as Node).path;
      const availablePath = acc.get(potentialPath[COLUMN]);

      if (availablePath !== undefined) {
        if (potentialPath[ROOT_NODE] < availablePath[ROOT_NODE]) {
          acc.set(potentialPath[COLUMN], potentialPath.slice(0, 2));
        }
        return acc;
      }

      acc.set(potentialPath[COLUMN], potentialPath.slice(0, 2));

      return acc;
    }, new Map<number, Path>());

    setLoading(true);
    dispatch({ type: 'resize', payload: { leadChanges } });
    setLoading(false);
  }, []);

  const debouncedResizeHandler = React.useMemo(() => {
    return debounce(resizeHandler, 50, true);
  }, [resizeHandler]);

  const observer = React.useMemo(() => {
    const resize = new ResizeObserver(debouncedResizeHandler);

    return {
      observe(node: Node) {
        nodesMap.set(node);
        if (node.path.length === 2) {
          resize.observe(node.element, { box: 'border-box' });
        }
      },
      unobserve(node: Node) {
        nodesMap.delete(node);
        resize.unobserve(node.element);
      },
    };
  }, [debouncedResizeHandler]);

  const subNode = React.useCallback(
    (node: Node) => {
      observer.observe(node);
      return function unsubscribe() {
        observer.unobserve(node);
      };
    },
    [observer],
  );

  const subColumn = React.useCallback(
    (ref: Element, path: Path) => {
      const [pageIdx, columnIdx] = path;
      if (pageIdx === 0) columnsMap.set(columnIdx, ref);
      return function unsubscribe() {
        if (pageIdx === 0) columnsMap.delete(columnIdx);
      };
    },
    [columnsMap],
  );

  React.useEffect(() => {
    console.log('useEffect Main');
    dispatch({ type: 'resize', payload: {} });
  }, [dispatch]);

  return (
    <SubscribersContext.Provider value={{ subNode, subColumn, subField: null }}>
      <DimensionProvider widthFrac={pageWidth} multiplier={3.78}>
        <div className="rp-container">
          {zip(schema).map((columns: Array<SchemaPage | null>, index) => {
            return (
              <PageNested
                columns={columns}
                structure={structure}
                index={index}
                loading={loading}
                key={index}
              />
            );
          })}
        </div>
      </DimensionProvider>
    </SubscribersContext.Provider>
  );
}
