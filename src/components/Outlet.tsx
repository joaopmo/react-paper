import React from 'react';
import { useSubscribers } from './Paginator';
import { type StructureField, type Path } from '../types';

interface OutletContextObject {
  outlet: JSX.Element | null;
  reference: ((arg: Element | null) => void) | null;
}

const OutletContext = React.createContext<OutletContextObject>({
  outlet: null,
  reference: null,
});

export function useReference(): OutletContextObject['reference'] {
  return React.useContext(OutletContext).reference;
}

export function Outlet(): OutletContextObject['outlet'] {
  return React.useContext(OutletContext).outlet;
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
    if (ref != null && subField != null) return subField(ref, path);
  }, [path, ref, subField]);

  const reference = React.useCallback(
    (el: Element | null) => {
      if (el != null && el !== ref && subscribe) {
        setRef(el);
      }
    },
    [ref, subscribe],
  );

  return <OutletContext.Provider value={{ outlet, reference }}>{children}</OutletContext.Provider>;
}

export function renderWithOutlet(
  structure: StructureField,
  path: Path = [],
  sub = true,
): JSX.Element {
  const { element, children } = structure;
  const outlets: React.ReactNode[] = [];
  if (children !== null) {
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
