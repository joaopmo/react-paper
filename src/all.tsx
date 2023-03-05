import React from 'react';
import { invariant } from './invariant';

type Path = (string | number)[];
type Columns = (string | number)[][];

type Subscribe = (ref: Element, path: Path) => () => void;

interface FieldObject {
  element?: React.ReactNode | null;
  render?: ((arg: Subscribe) => React.ReactNode | null) | null;
  children?: FieldObject[] | null;
  display?: boolean | null;
  sizing?: 'cbox' | 'pbox' | 'bbox' | 'mbox' | null;
  content?: 'block' | 'text' | null;
}

export interface FieldProps {
  element: React.ReactNode | null;
  render: ((arg: Subscribe) => React.ReactNode | null) | null;
  children: React.ReactNode | null;
  display: boolean;
  sizing: 'cbox' | 'pbox' | 'bbox' | 'mbox';
  content: 'block' | 'text';
}

export function Field({
  element = null,
  render = null,
  children = null,
  display = true,
  sizing = 'mbox',
  content = 'text',
}: FieldProps): React.ReactElement | null {
  invariant(
    false,
    `A <Field> is only ever to be used as the child of <Fields> element, ` +
      `never rendered directly. Please wrap your <Field> in a <Fields>.`,
  );
}

function createFieldStructure(children: React.ReactNode): FieldObject[] {
  const structure: FieldObject[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      return;
    }

    if (child.type === React.Fragment) {
      structure.concat(createFieldStructure(child.props.children));
      return;
    }

    invariant(
      child.type === Field,
      `[${
        typeof child.type === 'string' ? child.type : child.type.name
      }] is not a <Field> component. All component children of <Fields> must be a <Field> or <React.Fragment>`,
    );

    invariant(
      xor(!!child.props.element, !!child.props.render),
      `<Field> should have either element or render props`,
    );

    const field: FieldObject = {
      element: child.props.element,
      render: child.props.render,
      display: child.props.display,
      sizing: child.props.sizing,
      content: child.props.content,
    };

    if (child.props.children) {
      field.children = createFieldStructure(child.props.children);
    }

    structure.push(field);
  });

  return structure;
}

// =========================================================================

interface ContainerContextObject {
  subContainer: ((arg: Element | null) => void) | null;
}

export const ContainerContext = React.createContext<ContainerContextObject>({
  subContainer: null,
});

interface FieldContextObject {
  subField: Subscribe | null;
}

export const FieldContext = React.createContext<FieldContextObject>({
  subField: null,
});

interface PagerProps {
  children?: React.ReactNode | null;
  fieldsMap: Map<string | number, FieldObject[]>;
  columns: Columns;
}

interface IElMeta<T> {
  marginBox: T;
  contentBox: T;
  fontSize: T;
  lineHeight: T;
  marginTop: T;
  marginBottom: T;
  paddingTop: T;
  paddingBottom: T;
  borderTop: T;
  borderBottom: T;
  path: Path;
}

function Page({ children, fieldsMap, columns }: PagerProps) {
  const containerRef = React.useRef<Element | null>(null);
  const elementToPath = React.useRef<Map<Element, Path>>(new Map());
  const pathToElement = React.useRef<Map<string, Element>>(new Map());
  const [render, setRender] = React.useReducer(reducer, {});

  function reducer(state, action) {
    return {};
  }

  const map = React.useMemo(() => {
    return {
      set<T extends Element | Path>(keyOne: T, keyTwo: T) {
        invariant(
          typeof keyOne !== typeof keyTwo,
          'Parameters keyOne and keyTwo should have different types',
        );

        if (Array.isArray(keyOne) && keyTwo instanceof Element)
          pathToElement.current.set(keyOne.join('.'), keyTwo);

        if (keyOne instanceof Element && Array.isArray(keyTwo))
          elementToPath.current.set(keyOne, keyTwo);
      },
      get(key: Element | Path) {
        if (Array.isArray(key)) return pathToElement.current.get(key.join('.'));
        if (key instanceof Element) return elementToPath.current.get(key);
      },
      delete(key: Element | Path) {
        if (Array.isArray(key)) return pathToElement.current.delete(key.join('.'));
        if (key instanceof Element) return elementToPath.current.delete(key);
      },
    };
  }, []);

  const getStyle = React.useCallback((el: Element): IElMeta<number> => {
    const style = window.getComputedStyle(el);

    const properties: IElMeta<string> = {
      marginBox: 'height',
      contentBox: 'height',
      fontSize: 'font-size',
      lineHeight: 'line-height',
      marginTop: 'margin-top',
      marginBottom: 'margin-bottom',
      paddingTop: 'padding-top',
      paddingBottom: 'padding-bottom',
      borderTop: 'border-top',
      borderBottom: 'border-bottom',
      path: [],
    };

    const sizes = Object.entries(properties).reduce<IElMeta<number>>((acc, [key, val]) => {
      if (key !== 'path') {
        acc[key as keyof Omit<IElMeta<string>, 'path'>] =
          parseFloat(style.getPropertyValue(val)) || 0;
      }
      return acc;
    }, {} as IElMeta<number>);

    if (style.getPropertyValue('box-sizing') === 'border-box') {
      sizes.marginBox += sizes.marginTop + sizes.marginBottom;
      sizes.contentBox -= sizes.paddingTop + sizes.paddingBottom;
      sizes.contentBox -= sizes.borderTop + sizes.borderBottom;
    } else {
      sizes.marginBox += sizes.paddingTop + sizes.paddingBottom;
      sizes.marginBox += sizes.borderTop + sizes.borderBottom;
      sizes.marginBox += sizes.marginTop + sizes.marginBottom;
    }

    return sizes;
  }, []);

  const overlappingPaths = React.useCallback((a: Path, b: Path): boolean => {
    const [min, max] = a.length <= b.length ? [a, b] : [b, a];
    return min.every((val, idx) => val === max[idx]);
  }, []);

  const resizeHandler = React.useCallback(
    (entries: ResizeObserverEntry[]) => {
      let diff: Element[] = [];

      entries.forEach(({ target: obsEl }) => {
        const prevObsElMeta = map.get(obsEl) as Path;
        const currObsElMeta = getStyle(obsEl);

        if (
          prevObsElMeta.marginBox === currObsElMeta.marginBox &&
          prevObsElMeta.contentBox === currObsElMeta.contentBox
        )
          return;

        const obsElPath = prevObsElMeta.path;
        elementToPath.current.set(obsEl, {
          ...currObsElMeta,
          path: obsElPath,
        });

        diff =
          diff.length === 0
            ? [obsEl]
            : diff.map((diffEl) => {
                const { path: diffElPath } = elementToPath.current.get(diffEl) as IElMeta<number>;
                return overlappingPaths(diffElPath, obsElPath) &&
                  diffElPath.length <= obsElPath.length
                  ? diffEl
                  : obsEl;
              });
      });

      setRender({ type: 'calc_pages', payload: diff });
    },
    [getStyle, overlappingPaths],
  );

  const observer = React.useMemo(() => {
    const resize = new ResizeObserver(resizeHandler);

    return {
      observe(el: Element, path: Path) {
        elementToPath.current.set(el, { ...getStyle(el), path });
        pathToElement.current.set(path.join('.'), el);
        resize.observe(el, { box: 'border-box' });
      },
      unobserve(el: Element, path: Path) {
        elementToPath.current.delete(el);
        pathToElement.current.delete(path.join('.'));
        resize.unobserve(el);
      },
    };
  }, [getStyle, resizeHandler]);

  const subField = React.useCallback(
    (ref: Element, path: Path) => {
      observer.observe(ref, path);
      return function unsubscribe() {
        observer.unobserve(ref, path);
      };
    },
    [observer],
  );

  const subContainer = React.useCallback((ref: Element | null) => {
    if (ref) containerRef.current = ref;
  }, []);

  return (
    <ContainerContext.Provider value={{ subContainer }}>
      <FieldContext.Provider value={{ subField }}>
        <div>Test</div>
      </FieldContext.Provider>
    </ContainerContext.Provider>
  );
}
