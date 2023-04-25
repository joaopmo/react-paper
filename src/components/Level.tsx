import React from 'react';
import { assert } from '../utils';
import { Node } from './Node';
import { useSubscribers } from './Paginator';
import { type Path } from '../types';
interface LevelContextObject {
  reference: ((arg: Element | null) => void) | null;
  path: Path;
}

export const LevelContext = React.createContext<LevelContextObject>({
  reference: null,
  path: [],
});

export function usePath() {
  return React.useContext(LevelContext).path;
}

interface PathProviderProps {
  path: Path;
  children: JSX.Element;
  subscribe: boolean;
  content: 'block' | 'text' | null;
}

export function LevelProvider({ path, children, content, subscribe }: PathProviderProps) {
  const [ref, setRef] = React.useState<Element | null>(null);

  const { subNode } = useSubscribers();

  React.useLayoutEffect(() => {
    if (ref != null && subNode != null)
      return subNode({ path, children: 0, content: content ?? 'text', element: ref });
  }, [path, ref, subNode]);

  const reference = React.useCallback(
    (el: Element | null) => {
      if (el != null && el !== ref && subscribe) {
        setRef(el);
      }
    },
    [ref, subscribe],
  );

  return <LevelContext.Provider value={{ reference, path }}>{children}</LevelContext.Provider>;
}

interface LevelProps {
  children: React.ReactNode;
}

export function Level({ children }: LevelProps) {
  const parentPath = usePath();

  return React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) {
      return;
    }

    assert(
      child.type === Node,
      `[${
        typeof child.type === 'string' ? child.type : child.type.name
      }] is not a <Node> component. All component children of <Level> must be a <Node>`,
    );

    return (
      <LevelProvider
        path={[...parentPath, index]}
        content={child.props.content}
        subscribe={parentPath.length === 1}
      >
        {child.props.element}
      </LevelProvider>
    );
  });
}
