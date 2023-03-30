import React from 'react';
import { Path, FieldObject } from './Field';
import { useSubscribers } from './Paginator';

interface OutletContextObject {
  outlet: JSX.Element | null;
  path: Path | null;
  reference: ((arg: Element | null) => void) | null;
}

const OutletContext = React.createContext<OutletContextObject>({
  outlet: null,
  path: null,
  reference: null,
});

export function useOutlet(): OutletContextObject {
  return React.useContext(OutletContext);
}

export function Outlet(): OutletContextObject['outlet'] {
  return useOutlet().outlet;
}

interface OutletProviderProps {
  path: Path;
  outlet: JSX.Element | null;
  children: React.ReactNode | null;
  subscribe: boolean;
}

export function OutletProvider({
  path,
  outlet,
  children,
  subscribe,
}: OutletProviderProps): JSX.Element {
  const [ref, setRef] = React.useState<Element | null>(null);

  const { subField } = useSubscribers();

  React.useLayoutEffect(() => {
    if (ref && subField) return subField(ref, path);
  }, [path, ref, subField]);

  const reference = React.useCallback(
    (el: Element | null) => {
      if (el && el !== ref && subscribe) {
        setRef(el);
      }
    },
    [ref, subscribe],
  );

  return (
    <OutletContext.Provider value={{ outlet, reference, path }}>{children}</OutletContext.Provider>
  );
}

export function renderWithOutlet(structure: FieldObject, path: Path = [], sub = true): JSX.Element {
  const { element, children } = structure;
  const outlets: React.ReactNode[] = [];
  if (children) {
    children.forEach((child, index) => {
      outlets.push(renderWithOutlet(child, [...path, index], sub));
    });
  }

  const outlet = <>{outlets}</>;

  return (
    <OutletProvider path={path} outlet={outlet} subscribe={sub} key={path.join('.')}>
      {element}
    </OutletProvider>
  );
}
