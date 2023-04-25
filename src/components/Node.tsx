import { assert } from '../utils';

interface NodeProps {
  element: JSX.Element;
  content?: 'block' | 'text';
}

export function Node(props: NodeProps): JSX.Element {
  assert(
    false,
    `A <Node> is only ever to be used as the child of <Level> component, ` +
      `never rendered directly. Please wrap your <Node> in a <Level>.`,
  );
}
