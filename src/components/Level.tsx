import React from 'react';
import { assert, getStyle } from '../utils';
import { Node } from './Node';
import { type Path } from '../types';
import { useSubscribers } from './Paginator';

interface Register {
  ref: React.MutableRefObject<null> | null;
  'data-rp': string;
}
interface LevelContextObject {
  register: () => Register;
  path: Path;
  subscribe: boolean;
}

const LevelContext = React.createContext<LevelContextObject>({
  register: () => ({ ref: null, 'data-rp': '' }),
  path: [],
  subscribe: false,
});

function useLevelContext() {
  return React.useContext(LevelContext);
}

export function useRegister() {
  const { register } = React.useContext(LevelContext);
  return { register };
}

interface LevelProviderProps {
  path: Path;
  children: React.ReactNode;
  content: 'block' | 'text' | null;
  subscribe: boolean;
}

export const LevelProvider = React.memo(function LevelProvider({
  path,
  children,
  content,
  subscribe,
}: LevelProviderProps) {
  const { subNode } = useSubscribers();
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current != null && subNode != null && subscribe) {
      return subNode({
        path,
        children: 0,
        content: content ?? 'text',
        element: ref.current,
        prevSize: getStyle(ref.current, 'borderBox'),
      });
    }
  }, [subNode, path, subscribe]);

  const register = React.useCallback((): Register => {
    return { ref, 'data-rp': path.join('.') };
  }, [path]);

  return (
    <LevelContext.Provider value={{ register, path, subscribe }}>{children}</LevelContext.Provider>
  );
});

interface LevelProps {
  children: React.ReactNode;
}

interface ReduceJSX {
  nodes: JSX.Element[];
  index: number;
}

export function Level({ children }: LevelProps) {
  const { path: parentPath, subscribe } = useLevelContext();

  const { nodes } = React.Children.toArray(children).reduce<ReduceJSX>(
    (acc, child) => {
      if (!React.isValidElement(child)) return acc;

      assert(
        child.type === Node,
        `[${
          typeof child.type === 'string' ? child.type : child.type.name
        }] is not a <Node> component. All component children of <Level> must be a <Node>`,
      );

      assert(
        child.props.element != null,
        `A <Node> component is lacking the required element prop`,
      );

      acc.nodes.push(
        <LevelProvider
          path={[...parentPath, acc.index]}
          content={child.props.content}
          subscribe={subscribe}
          key={acc.index}
        >
          {child.props.element}
        </LevelProvider>,
      );

      acc.index++;
      return acc;
    },
    { nodes: [], index: 0 },
  );

  return <>{nodes}</>;
}
