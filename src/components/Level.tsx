import React from 'react';
import { assert } from '../utils';
import { Node } from './Node';
import { type Path } from '../types';
import { useSubscribers } from './Paginator';

interface Register {
  ref: React.MutableRefObject<null> | null;
  'data-rp-id': string;
  'data-rp-display': string;
}
interface LevelContextObject {
  register: (display?: boolean) => Register;
  path: Path;
  subscribe: boolean;
}

const LevelContext = React.createContext<LevelContextObject>({
  register: () => ({ ref: null, 'data-rp-id': '', 'data-rp-display': 'visible' }),
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
        prevSize: -1,
      });
    }
  }, [subNode, path, subscribe, content]);

  const register = React.useCallback(
    (display = true): Register => {
      return {
        ref,
        'data-rp-id': path.join('.'),
        'data-rp-display': display ? 'visible' : 'none',
      };
    },
    [path],
  );

  return (
    <LevelContext.Provider value={{ register, path, subscribe }}>{children}</LevelContext.Provider>
  );
});

interface LevelProps {
  children: React.ReactNode;
}

export function Level({ children }: LevelProps) {
  const { path: parentPath, subscribe } = useLevelContext();

  const nodesFromChildren = React.useCallback(
    (children: React.ReactNode, parentIndex: number = 0) => {
      const nodes: JSX.Element[] = [];

      React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) {
          return;
        }

        if (child.type === React.Fragment) {
          nodes.push(...nodesFromChildren(child.props.children, parentIndex + nodes.length));
          return;
        }

        assert(
          child.type === Node,
          `[${
            typeof child.type === 'string' ? child.type : child.type.name
          }] is not a <Node> component. All component children of <Level> must be a <Node>  or <React.Fragment>`,
        );

        assert(
          React.isValidElement(child.props.element),
          `The element prop of a <Node> must be a valid React Element`,
        );

        nodes.push(
          <LevelProvider
            path={[...parentPath, parentIndex + nodes.length]}
            content={child.props.content}
            subscribe={subscribe}
            key={parentIndex + nodes.length}
          >
            {child.props.element}
          </LevelProvider>,
        );
      });

      return nodes;
    },
    [parentPath, subscribe],
  );

  const nodes = React.useMemo(() => {
    return nodesFromChildren(children);
  }, [children, nodesFromChildren]);

  return <>{nodes}</>;
}
