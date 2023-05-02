/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import React from 'react';
import { DimensionProvider } from './Dimension';
import { assert, getStyle, zip } from '../utils';
import { Page } from './Page';
import {
  type Path,
  type Schema,
  type SchemaColumn,
  type SchemaPage,
  type Structure,
  type Style,
  type PartialStyle,
  type Subscribe,
} from '../types';

const COLUMN = 0;
const ROOT_NODE = 1;

export interface Node {
  path: Path;
  children: number;
  content: 'block' | 'text' | null;
  element: Element;
  prevSize: number;
}

function useNodePathMap() {
  const pathToNode = React.useRef<Map<string, Node>>(new Map());
  const pathToChildren = React.useRef<Map<string, number>>(new Map());

  return React.useMemo(function () {
    return {
      set(node: Node) {
        pathToNode.current.set(node.path.join('.'), node);

        const childCount = pathToChildren.current.get(node.path.join('.'));
        if (childCount == null) {
          pathToChildren.current.set(node.path.join('.'), 0);
        }

        for (let i = node.path.length - 1; i > 0; i--) {
          let parentChildCount = pathToChildren.current.get(node.path.slice(0, i).join('.'));

          if (parentChildCount == null && childCount == null) {
            pathToChildren.current.set(node.path.slice(0, i).join('.'), 1);
            continue;
          }

          if (parentChildCount != null && childCount == null) {
            pathToChildren.current.set(node.path.slice(0, i).join('.'), ++parentChildCount);
          }
          break;
        }
      },
      sizeDiff(el: Element) {
        const node = this.get(el);
        if (node == null) return false;
        const currSize = getStyle(el).borderBox;
        this.set({ ...node, prevSize: currSize });
        return node.prevSize !== currSize;
      },
      get(key: Element | Path) {
        if (Array.isArray(key)) {
          const children = pathToChildren.current.get(key.join('.'));
          const node = pathToNode.current.get(key.join('.'));
          if (children != null && node != null) {
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
              if (children != null) {
                return {
                  ...node,
                  children,
                };
              }
              return node;
            }
          }

          return undefined;
        }
      },
      delete(node: Node) {
        pathToNode.current.delete(node.path.join('.'));
        const childDeleted = pathToChildren.current.delete(node.path.join('.'));
        let parentChildCount = pathToChildren.current.get(node.path.slice(0, -1).join('.'));
        if (parentChildCount != null && childDeleted) {
          pathToChildren.current.set(node.path.slice(0, -1).join('.'), --parentChildCount);
        }
      },
    };
  }, []);
}

function useColumnsMap() {
  const columnsMap = React.useRef<Map<number, Element>>(new Map());
  return React.useMemo(() => {
    return {
      set(idx: number, ref: Element) {
        columnsMap.current.set(idx, ref);
      },
      get(idx: number) {
        return columnsMap.current.get(idx);
      },
      delete(idx: number) {
        return columnsMap.current.delete(idx);
      },
    };
  }, []);
}

interface PaginatorNestedProps {
  structure: Structure;
  pageWidth: number;
}

export interface State {
  currPath: Path;
  prevPath: Path;
  leadPage: number;
  currSlice: number;
  upperBound: number;
  lowerBound: number;
  addedHeight: number;
  freeHeight: number;
  field: Node;
  style: Style<number>;
  parentStyle: Style<number>;
  prevSibEl?: Element;
  nextSibEl?: Element;
}

export interface SubContextObject {
  subNode: Subscribe | null;
  unsubNode: Subscribe | null;
  subField: Subscribe | null;
  subColumn: Subscribe | null;
}

interface Action {
  type: string;
  payload: {
    leadChanges?: Map<number, Path>;
  };
}

export const SubscribersContext = React.createContext<SubContextObject>({
  subNode: null,
  unsubNode: null,
  subField: null,
  subColumn: null,
});

export function useSubscribers(): SubContextObject {
  return React.useContext(SubscribersContext);
}

export function Paginator({ structure, pageWidth }: PaginatorNestedProps) {
  const [loading, setLoading] = React.useState(true);
  const columnsMap = useColumnsMap();
  const nodesMap = useNodePathMap();

  function init(schema: Schema): Schema {
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
  }

  function reducer(prevSchema: Schema, { type, payload }: Action) {
    const { leadChanges } = payload;
    switch (type) {
      case 'resize':
        return calcPosition(prevSchema, leadChanges);
      case 'reset':
        return init([]);
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
        sliceIt = column[pageIt].length - 1;
      } else {
        sliceIt--;
      }
    }

    return [page, slice];
  }, []);

  const boxOverflow = React.useCallback(
    (state: State, page: SchemaPage, column: SchemaColumn, box: keyof PartialStyle<number>) => {
      let currentBox = box === 'rowGap' ? state.parentStyle[box] : state.style[box];

      // Logic to handle margin collapse between adjacent siblings.
      // Margin collapse between parent and descendants is handled
      // by .pb-page * { overflow: hidden; } css rule.
      // =================================================================
      if (state.parentStyle.display !== 'flex') {
        if (box === 'marginTop' && state.prevSibEl != null) {
          currentBox = 0;
        }

        if (box === 'marginBottom' && state.nextSibEl != null) {
          const { marginTop } = getStyle(state.nextSibEl);
          currentBox = marginTop > currentBox ? marginTop : currentBox;
        }
      }
      // =================================================================

      if (currentBox === 0) return;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (state.freeHeight >= currentBox) {
          state.freeHeight = state.freeHeight - currentBox;
          state.addedHeight = state.addedHeight + currentBox;
          if (box !== 'rowGap') state.lowerBound = state.lowerBound + currentBox;
          break;
        }

        if (box === 'borderBox') {
          const pageHeight = getStyle(columnsMap.get(state.currPath[COLUMN])!).contentBox;
          assert(
            currentBox <= pageHeight,
            'A <Field> of with content prop = block received a element with height greater than the page',
          );
        }

        if (box === 'contentBox' && state.freeHeight >= state.style.lineHeight) {
          const cap = state.freeHeight - (state.freeHeight % state.style.lineHeight);
          state.lowerBound = state.lowerBound + cap;
          state.addedHeight = state.addedHeight + cap;
          state.freeHeight = state.freeHeight - cap;
          currentBox = currentBox - cap;
        }

        if (state.currSlice === 0) {
          state.leadPage = column.length;
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

  const allocate = React.useCallback(
    (path: Path) => {
      const page: SchemaPage = [];
      const column: SchemaColumn = [];
      const parentStyle = getStyle(columnsMap.get(path[COLUMN])!);
      const addedHeight = 0;
      const freeHeight = parentStyle.contentBox;

      const state: State = {
        prevPath: [],
        currPath: path,
        leadPage: 0,
        currSlice: 0,
        upperBound: 0,
        lowerBound: 0,
        addedHeight,
        freeHeight,
        parentStyle,
        style: getStyle((nodesMap.get(path) as Node).element),
        field: nodesMap.get(path) as Node,
      };

      const pathStack: Path[] = [];
      for (let i = structure[path[COLUMN]].length - 1; i >= path[ROOT_NODE]; i--) {
        pathStack.push([path[COLUMN], i]);
      }

      while (pathStack.length > 0) {
        state.currPath = pathStack.pop()!;
        const parentPath = state.currPath.slice(0, -1);
        state.field = nodesMap.get(state.currPath) as Node;
        state.style = getStyle((nodesMap.get(state.currPath) as Node).element);

        // If currPath is a root node, then the parent is the column
        if (parentPath.length === 1) state.parentStyle = parentStyle;
        else state.parentStyle = getStyle((nodesMap.get(parentPath) as Node).element);
        state.prevSibEl = nodesMap.get([...parentPath, state.currPath.at(-1)! - 1])?.element;
        state.nextSibEl = nodesMap.get([...parentPath, state.currPath.at(-1)! + 1])?.element;

        const prevRoot = state.prevPath[ROOT_NODE];
        const currRoot = state.currPath[ROOT_NODE];
        const rootHasChanged = prevRoot != null && prevRoot !== currRoot;

        if (rootHasChanged) {
          state.currSlice = 0;
          if (state.parentStyle.display !== 'flex') {
            state.upperBound = state.style.marginTop;
            state.lowerBound = state.style.marginTop;
          } else {
            state.upperBound = 0;
            state.lowerBound = 0;
          }
        }

        if (state.field.content === 'text' && state.prevPath.length <= state.currPath.length) {
          boxOverflow(state, page, column, 'marginTop');
          boxOverflow(state, page, column, 'borderTop');
          boxOverflow(state, page, column, 'paddingTop');

          if (state.field.children !== 0) {
            pathStack.push([...state.currPath]);
            for (let i = state.field.children - 1; i >= 0; i--) {
              pathStack.push([...state.currPath, i]);
            }
            state.prevPath = [...state.currPath];
            continue;
          }

          boxOverflow(state, page, column, 'contentBox');
        }

        if (state.field.content === 'text') {
          boxOverflow(state, page, column, 'paddingBottom');
          boxOverflow(state, page, column, 'borderBottom');
        }

        if (state.field.content === 'block') {
          boxOverflow(state, page, column, 'marginTop');
          boxOverflow(state, page, column, 'borderBox');
        }

        boxOverflow(state, page, column, 'marginBottom');

        if (state.parentStyle.display === 'flex') {
          boxOverflow(state, page, column, 'rowGap');
        }

        if (state.currSlice === 0) {
          state.leadPage = column.length;
        }

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
    [columnsMap, structure, boxOverflow],
  );

  const calcPosition = React.useCallback(
    function (oldSchema: Schema, leadChanges?: Map<number, Path>) {
      const schema = structuredClone(oldSchema);
      if (leadChanges == null) {
        leadChanges = new Map();
        structure.forEach((_, columnIndex) => {
          leadChanges?.set(columnIndex, [columnIndex, 0]);
        });
      }

      for (const [column, path] of leadChanges) {
        schema[column] = allocate(path);
      }

      return schema;
    },
    [structure, allocate],
  );

  const [schema, dispatch] = React.useReducer(reducer, [], init);

  const resizeHandler = React.useCallback((entries: ResizeObserverEntry[]) => {
    const leadChanges = entries.reduce((acc, { target: el }) => {
      if (!nodesMap.sizeDiff(el)) return acc;
      const path = (nodesMap.get(el) as Node).path;
      acc.set(path[COLUMN], [path[COLUMN], 0]);
      return acc;
    }, new Map<number, Path>());

    if (leadChanges.size === 0) return;

    setLoading(true);
    dispatch({ type: 'resize', payload: {} });
    setLoading(false);
  }, []);

  const observer = React.useMemo(() => {
    const resize = new ResizeObserver(resizeHandler);
    return {
      observe(node: Node) {
        resize.observe(node.element, { box: 'border-box' });
      },
      unobserve(node: Node) {
        resize.unobserve(node.element);
      },
      disconnect() {
        resize.disconnect();
      },
    };
  }, [resizeHandler]);

  const subNode = React.useCallback(
    (node: Node) => {
      nodesMap.set(node);
      if (node.path.length === 2) {
        observer.observe(node);
      }

      return function unsubscribe() {};
    },
    [observer],
  );

  const unsubNode = React.useCallback(
    (node: Node) => {
      nodesMap.delete(node);
      return function unsubscribe() {};
    },
    [observer],
  );

  const subColumn = React.useCallback(
    (ref: Element, path: Path) => {
      const [pageIdx, columnIdx] = path;
      if (pageIdx === 0) columnsMap.set(columnIdx, ref);
      return function unsubscribe() {};
    },
    [columnsMap],
  );

  React.useEffect(() => {
    dispatch({ type: 'reset', payload: {} });
  }, [structure]);

  React.useEffect(() => {
    return () => {
      observer.disconnect();
    };
  }, [observer]);

  const zipped = React.useMemo(() => zip(schema), [schema]);

  const count = React.useRef(0);
  console.log(count.current++);

  return (
    <SubscribersContext.Provider value={{ subNode, subColumn, subField: null, unsubNode }}>
      <DimensionProvider widthFrac={pageWidth} multiplier={3.78}>
        <div className="rp-container">
          {zipped.map((columns: Array<SchemaPage | null>, index) => {
            return (
              <Page
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
