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
} from '../types';

const COLUMN = 0;
const ROOT = 1;

export interface Node {
  path: Path;
  children: number;
  content: 'block' | 'text' | 'parallel' | null;
  element: Element;
  prevSize: number;
}

function useNodesMap() {
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
        const currSize = getStyle(el, 'borderBox');
        this.set({ ...node, prevSize: currSize });
        return node.prevSize !== currSize;
      },
      hasParents(el: Element) {
        const node = this.get(el);
        if (node == null) return false;
        for (let i = node.path.length - 1; i >= 2; i--) {
          if (!this.has(node.path.slice(0, i))) {
            return false;
          }
        }
        return true;
      },
      has(path: Path) {
        return pathToNode.current.has(path.join('.'));
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
              node.element.getAttribute('data-rp-id') === key.getAttribute('data-rp-id')
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
      childCount(path: Path) {
        return pathToChildren.current.get(path.join('.'));
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

interface PaginatorProps {
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
  parentStyle: {
    rowGap: Style<number>['rowGap'];
    display: Style<number>['display'];
  };
  prevSibEl?: Element;
  nextSibEl?: Element;
}

export interface SubContextObject {
  subNode: ((node: Node) => (() => void) | undefined) | null;
  subColumn: ((el: Element, columnIndex: number) => void) | null;
}

interface Action {
  type: string;
  payload: {
    changes?: Map<number, Path>;
  };
}

export const SubscribersContext = React.createContext<SubContextObject>({
  subNode: null,
  subColumn: null,
});

export function useSubscribers(): SubContextObject {
  return React.useContext(SubscribersContext);
}

function PaginatorBase({ structure, pageWidth }: PaginatorProps) {
  const reset = React.useRef(false);
  const [loading, setLoading] = React.useState(true);
  const [lastChanges, setLastChanges] = React.useState(new Map());
  const columnsMap = useColumnsMap();
  const nodesMap = useNodesMap();

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
    const { changes } = payload;
    switch (type) {
      case 'resize':
        return calcPosition(prevSchema, changes);
      case 'reset':
        return init([]);
      default:
        throw new Error('Invalid case');
    }
  }

  const pushPage = React.useCallback((state: State, page: SchemaPage, column: SchemaColumn) => {
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
          const marginTop = getStyle(state.nextSibEl, 'marginTop');
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
          state.lowerBound = state.lowerBound + currentBox;
          break;
        }

        if (box === 'borderBox') {
          const pageHeight = getStyle(columnsMap.get(state.currPath[COLUMN])!, 'contentBox');
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

        if (state.upperBound !== state.lowerBound) {
          pushPage(state, page, column);
        }

        column.push([...page]);
        page.length = 0;
        state.addedHeight = 0;
        state.upperBound = state.lowerBound;
        state.freeHeight = getStyle(columnsMap.get(state.currPath[COLUMN])!, 'contentBox');
      }
    },
    [columnsMap, pushPage],
  );

  const findPrevVisibleSib = React.useCallback(
    (path: Path) => {
      const parentPath = path.slice(0, -1);

      for (let i = path.at(-1)! - 1; i >= 0; i--) {
        const sibling = nodesMap.get([...parentPath, i])!;
        const siblingDisplay = getStyle(sibling.element, 'display');
        if (siblingDisplay !== 'none') {
          return sibling.element;
        }
      }

      return undefined;
    },
    [nodesMap],
  );

  const findNextVisibleSib = React.useCallback(
    (path: Path) => {
      const parentPath = path.slice(0, -1);
      const siblingsCount = nodesMap.childCount(parentPath)!;

      for (let i = path.at(-1)! + 1; i < siblingsCount; i++) {
        const sibling = nodesMap.get([...parentPath, i])!;
        const siblingDisplay = getStyle(sibling.element, 'display');
        if (siblingDisplay !== 'none') {
          return sibling.element;
        }
      }

      return undefined;
    },
    [nodesMap],
  );

  const maxSizeParallelSibPath = React.useCallback(
    (path: Path): Path => {
      const parentField = nodesMap.get(path) as Node;
      let maxSize = 0;
      let maxIndex = 0;

      for (let i = 0; i < parentField.children; i++) {
        const currField = nodesMap.get([...path, i]) as Node;
        const currSize = getStyle(currField.element, 'marginBox');
        if (currSize > maxSize) {
          maxSize = currSize;
          maxIndex = i;
        }
      }

      return [...path, maxIndex];
    },
    [nodesMap],
  );

  const allocate = React.useCallback(
    (path: Path) => {
      const page: SchemaPage = [];
      const column: SchemaColumn = [];

      const freeHeight = getStyle(columnsMap.get(path[COLUMN])!, 'contentBox');
      const field = nodesMap.get(path) as Node;
      const columnStyle: State['parentStyle'] = {
        rowGap: getStyle(columnsMap.get(path[COLUMN])!, 'rowGap'),
        display: getStyle(columnsMap.get(path[COLUMN])!, 'display'),
      };

      const state: State = {
        field,
        freeHeight,
        prevPath: [],
        currPath: path,
        leadPage: 0,
        currSlice: 0,
        upperBound: 0,
        lowerBound: 0,
        addedHeight: 0,
        parentStyle: columnStyle,
        style: getStyle(field.element),
      };

      const pathStack: Path[] = [];
      for (let i = structure[path[COLUMN]].length - 1; i >= path[ROOT]; i--) {
        pathStack.push([path[COLUMN], i]);
      }

      while (pathStack.length > 0) {
        state.currPath = pathStack.pop()!;
        state.field = nodesMap.get(state.currPath) as Node;
        state.style = getStyle(state.field.element);

        const prevRoot = state.prevPath[ROOT];
        const currRoot = state.currPath[ROOT];
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

        if (state.style.display === 'none') {
          if (state.currPath.length === 2) {
            pushPage(state, page, column);
          }
          state.prevPath = [...state.currPath];
          continue;
        }

        const parentPath = state.currPath.slice(0, -1);
        // If currPath is a root node, then the parent is the column
        if (parentPath.length === 1) state.parentStyle = columnStyle;
        else state.parentStyle = getStyle((nodesMap.get(parentPath) as Node).element);
        state.prevSibEl = findPrevVisibleSib(state.currPath);
        state.nextSibEl = findNextVisibleSib(state.currPath);

        if (state.field.content === 'text' && state.prevPath.length <= state.currPath.length) {
          boxOverflow(state, page, column, 'marginTop');
          boxOverflow(state, page, column, 'borderTop');
          boxOverflow(state, page, column, 'paddingTop');

          if (state.field.children !== 0) {
            pathStack.push([...state.currPath]);
            const firstChildField = nodesMap.get([...state.currPath, 0]) as Node;

            if (firstChildField.content === 'parallel') {
              pathStack.push(maxSizeParallelSibPath(state.currPath));
            } else {
              for (let i = state.field.children - 1; i >= 0; i--) {
                pathStack.push([...state.currPath, i]);
              }
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

        if (state.field.content === 'block' || state.field.content === 'parallel') {
          boxOverflow(state, page, column, 'marginTop');
          boxOverflow(state, page, column, 'borderBox');
        }

        boxOverflow(state, page, column, 'marginBottom');

        if (state.parentStyle.display === 'flex' && state.nextSibEl != null) {
          boxOverflow(state, page, column, 'rowGap');
        }

        if (state.currPath.length === 2) {
          pushPage(state, page, column);
        }

        state.prevPath = [...state.currPath];
      }

      if (page.length > 0) {
        column.push([...page]);
      }

      return column;
    },
    [
      columnsMap,
      nodesMap,
      structure,
      findPrevVisibleSib,
      findNextVisibleSib,
      boxOverflow,
      pushPage,
      maxSizeParallelSibPath,
    ],
  );

  const calcPosition = React.useCallback(
    function (oldSchema: Schema, changes?: Map<number, Path>) {
      const schema = structuredClone(oldSchema);
      if (changes == null) {
        changes = new Map();
        structure.forEach((column, columnIndex) => {
          if (column.length > 0 && changes instanceof Map) {
            changes.set(columnIndex, [columnIndex, 0]);
          }
        });
      }

      for (const [column, path] of changes) {
        schema[column] = allocate(path);
      }

      return schema;
    },
    [structure, allocate],
  );

  const [schema, dispatch] = React.useReducer(reducer, [], init);

  const resizeHandler = React.useCallback(
    (entries: ResizeObserverEntry[]) => {
      console.log('resize');
      const changes = entries.reduce((acc, { target: el }) => {
        if (!nodesMap.sizeDiff(el)) return acc;
        if (!nodesMap.hasParents(el)) return acc;
        const path = (nodesMap.get(el) as Node).path;
        acc.set(path[COLUMN], [path[COLUMN], 0]);
        return acc;
      }, new Map<number, Path>());

      if (changes.size > 0) {
        reset.current = false;
        setLoading(true);
        setLastChanges(changes);
      }
    },
    [nodesMap],
  );

  const observer = React.useMemo(() => {
    const resize = new ResizeObserver(resizeHandler);
    return {
      observe(node: Node) {
        resize.observe(node.element, { box: 'border-box' });
      },
      disconnect() {
        resize.disconnect();
      },
    };
  }, [resizeHandler]);

  const subNode = React.useCallback(
    (node: Node) => {
      const prevNode = nodesMap.get(node.path);
      if (prevNode == null || !prevNode.element.isEqualNode(node.element)) {
        nodesMap.set(node);
        observer.observe(node);

        return function unsubscribe() {
          nodesMap.delete(node);
        };
      }
    },
    [nodesMap, observer],
  );

  const subColumn = React.useCallback(
    (ref: Element, columnIndex: number) => {
      columnsMap.set(columnIndex, ref);
    },
    [columnsMap],
  );

  React.useMemo(() => {
    console.log('memo');
    reset.current = true;
    setLastChanges(new Map<number, Path>());
    dispatch({ type: 'reset', payload: {} });
    observer.disconnect();
    // eslint-disable-next-line
  }, [observer, structure]);

  React.useEffect(() => {
    console.log('lastChange effect');
    if (lastChanges.size > 0 && !reset.current) {
      dispatch({ type: 'resize', payload: { changes: lastChanges } });
      setLastChanges(new Map());
      setLoading(false);
    }
  }, [lastChanges]);

  const zipped = React.useMemo(() => zip(schema), [schema]);

  return (
    <SubscribersContext.Provider value={{ subNode, subColumn }}>
      <DimensionProvider widthFrac={pageWidth} multiplier={3.78}>
        <div className="rp-container">
          {zipped.map((columns: Array<SchemaPage | null>, index) => {
            return (
              <Page
                columns={columns}
                structure={structure}
                pageIndex={index}
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

export const Paginator = React.memo(PaginatorBase, arePropsEqual);

function arePropsEqual(oldProps: PaginatorProps, newProps: PaginatorProps) {
  if (oldProps.pageWidth !== newProps.pageWidth) {
    return false;
  }

  if (oldProps.structure.length !== newProps.structure.length) {
    return false;
  }

  for (let i = 0; i < oldProps.structure.length; i++) {
    if (oldProps.structure[i].length !== newProps.structure[i].length) {
      return false;
    }

    for (let j = 0; j < oldProps.structure[i].length; j++) {
      if (oldProps.structure[i][j].rootKey !== newProps.structure[i][j].rootKey) {
        return false;
      }
    }
  }

  return true;
}
