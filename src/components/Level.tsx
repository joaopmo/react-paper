import React from 'react';
import { assert, getStyle } from '../utils';
import { Node } from './Node';
import { useSubscribers } from './Paginator';
import { type Path } from '../types';

export interface Register {
  ref: ((arg: Element | null) => void) | null | React.MutableRefObject<null>;
  'data-id': string;
}
interface LevelContextObject {
  register: () => Register;
  path: Path;
  subscribe: boolean;
}

const LevelContext = React.createContext<LevelContextObject>({
  register: () => ({ ref: null, 'data-id': '' }),
  path: [],
  subscribe: false,
});

function useLevelContext() {
  return React.useContext(LevelContext);
}

export function useRegister() {
  return React.useContext(LevelContext).register;
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
  // const [ref, setRef] = React.useState<Element | null>(null);

  // console.log('LevelProvider', path);

  const { subNode, unsubNode } = useSubscribers();

  // React.useLayoutEffect(() => {
  //   if (ref != null && subNode != null) {
  //     return subNode({
  //       path,
  //       children: 0,
  //       content: content ?? 'text',
  //       element: ref,
  //       prevSize: 0,
  //     });
  //   }
  // }, [path, ref, subNode]);

  // const reference = React.useCallback(
  //   (el: Element | null) => {
  //     // if (el != null && !el.isEqualNode(ref) && subscribe) {
  //     //   setRef(el);
  //     // }

  //     // console.log(path, el);

  //     if (el != null && subNode != null && subscribe) {
  //       subNode({
  //         path,
  //         children: 0,
  //         content: content ?? 'text',
  //         element: el,
  //         prevSize: 0,
  //       });
  //     }

  //     if (el == null && unsubNode != null && subscribe) {
  //       unsubNode({
  //         path,
  //         children: 0,
  //         content: content ?? 'text',
  //         element: el,
  //         prevSize: 0,
  //       });
  //     }
  //   },
  //   [subNode, unsubNode],
  // );

  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current != null && subNode != null && subscribe) {
      subNode({
        path,
        children: 0,
        content: content ?? 'text',
        element: ref.current,
        prevSize: getStyle(ref.current).borderBox, // TODO: check
      });
    }

    if (unsubNode != null && subscribe) {
      return () => {
        unsubNode({
          path,
          children: 0,
          content: content ?? 'text',
          element: null,
          prevSize: 0,
        });
      };
    }
  }, [subNode, unsubNode, path, subscribe]);

  const register = React.useCallback((): Register => {
    return {
      ref,
      'data-id': path.join('.'),
    };
  }, []);

  return (
    <LevelContext.Provider value={{ register, path, subscribe }}>{children}</LevelContext.Provider>
  );
});

interface LevelProps {
  children: React.ReactNode;
}

export function Level({ children }: LevelProps) {
  // const parentPath = usePath();
  const { path: parentPath, subscribe } = useLevelContext();

  let index = 0;
  const nodes = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return null;
    }

    assert(
      child.type === Node,
      `[${
        typeof child.type === 'string' ? child.type : child.type.name
      }] is not a <Node> component. All component children of <Level> must be a <Node>`,
    );

    return (
      <LevelProvider
        path={[...parentPath, index++]}
        content={child.props.content}
        subscribe={subscribe}
      >
        {child.props.element}
      </LevelProvider>
    );
  });

  return <>{nodes ?? null}</>;
}
