/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import React from 'react';
import { DimensionProvider } from './Dimension';
import { Page } from './Page';
import { getStyle, get, zip, debounce, assert } from '../utils';
import {
  type Style,
  type Subscribe,
  type SchemaColumn,
  type SchemaPage,
  type Schema,
  type Structure,
  type StructureField,
  type Path,
} from '../types';
import { type Node } from './PaginatorNested';
export interface SubContextObject {
  subNode: Subscribe | null;
  subField: Subscribe | null;
  subColumn: Subscribe | null;
}

export const SubscribersContext = React.createContext<SubContextObject>({
  subNode: null,
  subField: null,
  subColumn: null,
});

export function useSubscribers(): SubContextObject {
  return React.useContext(SubscribersContext);
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
  field: StructureField | Node;
  style: Style<number>;
  prevSibEl?: Element;
  nextSibEl?: Element;
}

function useElementPathMap() {
  const elementToPath = React.useRef<Map<Element, Path>>(new Map());
  const pathToElement = React.useRef<Map<string, Element>>(new Map());

  return React.useMemo(() => {
    return {
      set(keyOne: Element, keyTwo: Path) {
        pathToElement.current.set(keyTwo.join('.'), keyOne);
        elementToPath.current.set(keyOne, keyTwo);
      },
      get(key: Element | Path) {
        if (Array.isArray(key)) return pathToElement.current.get(key.join('.'));
        if (key instanceof Element) return elementToPath.current.get(key);
      },
      delete(keyOne: Element, keyTwo: Path) {
        pathToElement.current.delete(keyTwo.join('.'));
        elementToPath.current.delete(keyOne);
      },
    };
  }, []);
}

export function useColumnsMap() {
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

export function Paginator({ structure, pageWidth }: PaginatorProps): JSX.Element {
  const COLUMN = 0;
  const ROOT_FIELD = 1;
  const [loading, setLoading] = React.useState(true);
  const fieldsMap = useElementPathMap();
  const columnsMap = useColumnsMap();

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
      if (column[pageIt][sliceIt].path[ROOT_FIELD] === fieldIndex) {
        page = column[pageIt][sliceIt].leadPage;
        slice = column[page].findIndex((value) => {
          return value.path[ROOT_FIELD] === fieldIndex;
        });
        return [page, slice];
      }

      if (column[pageIt][sliceIt].path[1] < fieldIndex) {
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
        if (state.freeHeight >= currentBox) {
          state.lowerBound = state.lowerBound + currentBox;
          state.addedHeight = state.addedHeight + currentBox;
          state.freeHeight = state.freeHeight - currentBox;
          break;
        }

        if (box === 'borderBox') {
          const pageHeight = getStyle(columnsMap.get(state.currPath[COLUMN])!).contentBox;
          assert(
            currentBox <= pageHeight,
            'A <Field> of with content prop = block received a element with height greater than the page',
          );
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
        style: getStyle(fieldsMap.get(path) as Element),
        field: get(structure, path) as StructureField,
      };

      const pathStack: Path[] = [];
      for (let i = structure[path[COLUMN]].length - 1; i >= path[ROOT_FIELD]; i--) {
        pathStack.push([path[COLUMN], i]);
      }

      while (pathStack.length > 0) {
        state.currPath = pathStack.pop()!;
        const parent = state.currPath.slice(0, -1);
        state.style = getStyle(fieldsMap.get(state.currPath) as Element);

        state.field = get(structure, state.currPath) as StructureField;
        state.prevSibEl = fieldsMap.get([...parent, state.currPath.at(-1)! - 1]) as Element;
        state.nextSibEl = fieldsMap.get([...parent, state.currPath.at(-1)! + 1]) as Element;

        if (
          state.prevPath.length > 0 &&
          state.prevPath[ROOT_FIELD] !== state.currPath[ROOT_FIELD]
        ) {
          state.currSlice = 0;
          state.upperBound = state.style.marginTop;
          state.lowerBound = state.style.marginTop;
        }

        if (state.prevPath.length <= state.currPath.length) {
          boxOverflow(state, page, column, 'marginTop');

          if (state.field.content !== 'block') {
            boxOverflow(state, page, column, 'borderTop');
            boxOverflow(state, page, column, 'paddingTop');

            if (state.field.children != null) {
              pathStack.push([...state.currPath]);
              for (let i = state.field.children.length - 1; i >= 0; i--) {
                pathStack.push([...state.currPath, i]);
              }
              state.prevPath = [...state.currPath];
              continue;
            }

            boxOverflow(state, page, column, 'contentBox');
          } else {
            boxOverflow(state, page, column, 'borderBox');
          }
        }

        if (state.field.content !== 'block') {
          boxOverflow(state, page, column, 'paddingBottom');
          boxOverflow(state, page, column, 'borderBottom');
        }
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
    [findSlice, columnsMap, fieldsMap, structure, boxOverflow],
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

  const resizeHandler = React.useCallback(
    (entries: ResizeObserverEntry[]) => {
      // Column to the path of its first resized field
      const leadChanges = entries.reduce((acc, { target: el }) => {
        const potentialPath = fieldsMap.get(el) as Path;
        const availablePath = acc.get(potentialPath[COLUMN]);

        if (availablePath !== undefined) {
          if (potentialPath[ROOT_FIELD] < availablePath[ROOT_FIELD]) {
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
    },
    [fieldsMap],
  );

  const debouncedResizeHandler = React.useMemo(() => {
    return debounce(resizeHandler, 50, true);
  }, [resizeHandler]);

  const observer = React.useMemo(() => {
    const resize = new ResizeObserver(debouncedResizeHandler);

    return {
      observe(el: Element, path: Path) {
        fieldsMap.set(el, path);
        if (path.length === 2) {
          resize.observe(el, { box: 'border-box' });
        }
      },
      unobserve(el: Element, path: Path) {
        fieldsMap.delete(el, path);
        if (path.length === 2) {
          resize.unobserve(el);
        }
      },
    };
  }, [debouncedResizeHandler, fieldsMap]);

  const subField = React.useCallback(
    (ref: Element, path: Path) => {
      observer.observe(ref, path);
      return function unsubscribe() {
        observer.unobserve(ref, path);
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
    dispatch({ type: 'resize', payload: {} });
  }, [dispatch]);

  return (
    <SubscribersContext.Provider value={{ subField, subColumn, subNode: null }}>
      <DimensionProvider widthFrac={pageWidth} multiplier={3.78}>
        <div className="rp-container">
          {zip(schema).map((columns: Array<SchemaPage | null>, index) => {
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
