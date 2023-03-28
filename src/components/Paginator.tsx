import React from 'react';
import { FieldObject, Path, Subscribe } from './Field';
import { useDimension } from './Dimension';
import { Page } from './Page';
import { StructureObject } from '../utils/transforms';
import { ElStyle, getStyle } from '../styles/getter';
import debounce from '../utils/debounce';
import { get, zip } from '../utils/accessors';

interface FieldContextObject {
  subField: Subscribe | null;
}

interface Slice {
  path: Path;
  current: number; // index of the slice taking into account all slices with same path
  leadPage: number; // starting page
  upperBound: number; // starting lenght
  lowerBound: number; // ending length head tail
  addedHeight: number; // Cumulative height of slices in the page
}

export type PageDescriptor = Slice[];

type ColumnDescriptor = PageDescriptor[];

type Schema = ColumnDescriptor[];

const FieldContext = React.createContext<FieldContextObject>({
  subField: null,
});

export function useField(): FieldContextObject {
  return React.useContext(FieldContext);
}

interface PaginatorProps {
  children?: React.ReactNode | null;
  structure: StructureObject;
}

type State = {
  currPath: Path;
  prevPath: Path;
  leadPage: number;
  currSlice: number;
  upperBound: number;
  lowerBound: number;
  addedHeight: number;
  freeHeight: number;
  field: FieldObject;
  style: ElStyle<number>;
  prevSibEl?: Element;
  nextSibEl?: Element;
};

function useElementPathMap() {
  const elementToPath = React.useRef<Map<Element, Path>>(new Map());
  const pathToElement = React.useRef<Map<string, Element>>(new Map());

  return React.useMemo(() => {
    return {
      set(keyOne: Element, keyTwo: Path) {
        if (keyOne instanceof Element && Array.isArray(keyTwo)) {
          pathToElement.current.set(keyTwo.join('.'), keyOne);
          elementToPath.current.set(keyOne, keyTwo);
        }
      },
      get(key: Element | Path) {
        if (Array.isArray(key)) return pathToElement.current.get(key.join('.'));
        if (key instanceof Element) return elementToPath.current.get(key);
      },
      delete(keyOne: Element, keyTwo: Path) {
        if (keyOne instanceof Element && Array.isArray(keyTwo)) {
          pathToElement.current.delete(keyTwo.join('.'));
          elementToPath.current.delete(keyOne);
        }
      },
    };
  }, []);
}

export function Paginator({ structure }: PaginatorProps): JSX.Element {
  const COLUMN = 0;
  const ROOT_FIELD = 1;
  const { height: pageHeight, scale } = useDimension();
  const [loading, setLoading] = React.useState(true);
  const map = useElementPathMap();

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
      if (column[pageIt][sliceIt]['path'][ROOT_FIELD] === fieldIndex) {
        page = column[pageIt][sliceIt].leadPage;
        slice = column[page].findIndex((value) => {
          return value['path'][ROOT_FIELD] === fieldIndex;
        });
        return [page, slice];
      }

      if (column[pageIt][sliceIt]['path'][1] < fieldIndex) {
        pageIt++;
      } else {
        sliceIt--;
      }
    }

    return [page, slice];
  }, []);

  const boxOverflow = React.useCallback(
    (state: State, page: PageDescriptor, column: ColumnDescriptor, box: keyof ElStyle<number>) => {
      let currentBox = state.style[box];

      // Logic to handle margin collapse between adjacent siblings.
      // Margin collapse between parent and descendants is handled
      // by .pb-page * { overflow: hidden; } css rule.
      // =================================================================
      if (box === 'marginTop' && state.prevSibEl) {
        currentBox = 0;
      }

      if (box === 'marginBottom' && state.nextSibEl) {
        const { marginTop } = getStyle(state.nextSibEl, scale);
        currentBox = marginTop > currentBox ? marginTop : currentBox;
      }
      // =================================================================

      while (true) {
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
        state.freeHeight = pageHeight;
        state.upperBound = state.lowerBound;
      }
    },
    [pageHeight, scale],
  );

  const calcPosition = React.useCallback(
    function (schema: Schema, leadChanges?: Map<number, Path>) {
      function allocateFromStructure(path: Path, schema: Schema) {
        const [leadPage, sliceIdx] = findSlice(path, schema);
        const page: Slice[] = schema[path[COLUMN]][leadPage].slice(0, sliceIdx);
        const column: PageDescriptor[] = schema[path[COLUMN]].slice(0, leadPage);
        const addedHeight = page.at(-1)?.addedHeight ?? 0;
        const freeHeight = pageHeight - addedHeight;

        const state: State = {
          prevPath: [],
          currPath: path,
          leadPage,
          currSlice: 0,
          upperBound: 0,
          lowerBound: 0,
          addedHeight,
          freeHeight,
          style: getStyle(map.get(path) as Element, scale),
          field: get(structure, path) as FieldObject,
        };

        const pathStack: Path[] = [];
        for (let i = structure[path[COLUMN]].length - 1; i >= path[ROOT_FIELD]; i--) {
          pathStack.push([path[COLUMN], i]);
        }

        while (pathStack.length > 0) {
          state.currPath = pathStack.pop()!;
          const parent = state.currPath.slice(0, -1);
          state.style = getStyle(map.get(state.currPath) as Element, scale);

          state.field = get(structure, state.currPath) as FieldObject;
          state.prevSibEl = map.get([...parent, state.currPath.at(-1)! - 1]) as Element;
          state.nextSibEl = map.get([...parent, state.currPath.at(-1)! + 1]) as Element;

          if (state.prevPath.length && state.prevPath[ROOT_FIELD] !== state.currPath[ROOT_FIELD]) {
            state.currSlice = 0;
            state.upperBound = state.style.marginTop;
            state.lowerBound = state.style.marginTop;
          }

          if (state.prevPath.length <= state.currPath.length) {
            boxOverflow(state, page, column, 'marginTop');
            boxOverflow(state, page, column, 'borderTop');
            boxOverflow(state, page, column, 'paddingTop');

            if (state.field.children) {
              pathStack.push([...state.currPath]);
              for (let i = state.field.children.length - 1; i >= 0; i--) {
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
      }

      // For the useEffect
      if (!leadChanges) {
        leadChanges = new Map();
        structure.forEach((_, columnIndex) => {
          leadChanges?.set(columnIndex, [columnIndex, 0]);
        });
      }

      for (const [column, path] of leadChanges) {
        schema[column] = allocateFromStructure(path, schema);
      }
    },
    [findSlice, pageHeight, map, scale, structure, boxOverflow],
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
        const potentialPath = map.get(el) as Path;
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
    [map],
  );

  const debouncedResizeHandler = React.useMemo(() => {
    return debounce(resizeHandler, 50, true);
  }, [resizeHandler]);

  const observer = React.useMemo(() => {
    const resize = new ResizeObserver(debouncedResizeHandler);

    return {
      observe(el: Element, path: Path) {
        map.set(el, path);
        if (path.length === 2) {
          resize.observe(el, { box: 'border-box' });
          // dispatch({ type: 'resize', payload: {} });
        }
      },
      unobserve(el: Element, path: Path) {
        map.delete(el, path);
        if (path.length === 2) {
          resize.unobserve(el);
          // dispatch({ type: 'resize', payload: {} });
        }
      },
    };
  }, [debouncedResizeHandler, map]);

  const subField = React.useCallback(
    (ref: Element, path: Path) => {
      observer.observe(ref, path);
      return function unsubscribe() {
        observer.unobserve(ref, path);
      };
    },
    [observer],
  );

  React.useEffect(() => {
    dispatch({ type: 'resize', payload: {} });
  }, [dispatch]);

  return (
    <FieldContext.Provider value={{ subField }}>
      <div className="pb-container">
        {zip(schema).map((columns: Array<PageDescriptor | null>, index) => {
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
    </FieldContext.Provider>
  );
}
