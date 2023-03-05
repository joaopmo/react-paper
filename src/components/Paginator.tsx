import React from 'react';
import { FieldObject, Path, Subscribe } from './Field';
import { renderWithOutlet } from './Outlet';
import { useDimension } from './Dimension';
import { Page } from './Page';
import { StructureObject } from '../utils/transforms';
import { getStyle } from '../styles/getter';
import debounce from '../utils/debounce';

interface FieldContextObject {
  subField: Subscribe | null;
}

interface Slice {
  path: Path;
  leadSlice: number;
  lastSlice: number;
  currSlice: number;
  leadPage: number; // starting page
  lastPage: number; // ending page
  upperBound: number; // starting lenght
  lowerBound: number; // ending length head tail
  addedHeight: number;
}

type PageDescriptor = Slice[];

type ColumnDescriptor = PageDescriptor[];

interface Schema {
  fieldToLeadPage: Map<string, number>;
  columns: ColumnDescriptor[];
}

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

export function Paginator({ structure }: PaginatorProps) {
  const elementToPath = React.useRef<Map<Element, Path>>(new Map());
  const pathToElement = React.useRef<Map<string, Element>>(new Map());
  const { height: pageHeight } = useDimension();
  const [schema, dispatch] = React.useReducer(
    reducer,
    { fieldToLeadPage: new Map(), columns: [] },
    init,
  );

  function init(schema: Schema): Schema {
    const columns = structure.map((column, columnIndex) => {
      const page = column.map((_, fieldIndex) => {
        schema.fieldToLeadPage.set(`${columnIndex}.${fieldIndex}`, 0);
        return {
          path: [columnIndex, fieldIndex],
          leadSlice: 0,
          lastSlice: 0,
          currSlice: 0,
          leadPage: 0,
          lastPage: 0,
          upperBound: 0,
          lowerBound: 0,
          addedHeight: 0,
        };
      });
      return [page];
    });

    schema.columns = columns;

    return schema;
  }

  function calcPosition(state: Schema, leadChanges: Map<number, Path>) {
    // function allocateFromStructure(addedHeight: number, path: Path) {
    //   const column = path[0];
    //   const field = path[1];
    //   while (true) {
    //     const element = map.get(path) as Element;
    //     const style = getStyle(element);
    //   }

    //   if (style.marginBox <= addedHeight) {
    //   }
    // }

    for (const [column, path] of leadChanges) {
      const leadPage = state.fieldToLeadPage.get(path.join('.'));
      const newColumn = state.columns[column].slice(0, leadPage);
      const addedHeight = pageHeight;

      while (true) {
        const element = map.get(path) as Element;
        const style = getStyle(element);
        if (style.marginBox <= addedHeight) {
        }
      }
    }
  }

  function reducer(
    state: Schema,
    { type, payload }: { type: string; payload: { leadChanges: Map<number, Path> } },
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

  const map = React.useMemo(() => {
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

  const resizeHandler = React.useCallback(
    (entries: ResizeObserverEntry[]) => {
      const COLUMN_IDX = 0;
      const ROOT_FIELD_IDX = 1;

      // Column to the path of its first resized field
      const leadChanges = entries.reduce((acc, { target: el }) => {
        const potentialPath = map.get(el) as Path;
        const availablePath = acc.get(potentialPath[COLUMN_IDX]);

        if (availablePath !== undefined) {
          if (potentialPath[ROOT_FIELD_IDX] < availablePath[ROOT_FIELD_IDX]) {
            acc.set(potentialPath[COLUMN_IDX], potentialPath);
          }
          return acc;
        }

        acc.set(potentialPath[COLUMN_IDX], potentialPath);

        return acc;
      }, new Map<number, Path>());

      dispatch({ type: 'resize', payload: { leadChanges } });
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
        if (path.length === 2) resize.observe(el, { box: 'border-box' });
      },
      unobserve(el: Element, path: Path) {
        map.delete(el, path);
        if (path.length === 2) resize.unobserve(el);
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

  return (
    <FieldContext.Provider value={{ subField }}>
      {structure.flatMap((column, columnIndex) => {
        return column.map((field, fieldIndex) => {
          return (
            <Page key={'' + columnIndex + fieldIndex}>
              {renderWithOutlet(field, [columnIndex, fieldIndex])}
            </Page>
          );
        });
      })}
    </FieldContext.Provider>
  );
}
