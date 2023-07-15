import type React from 'react';
import { assert } from '../utils';

interface NodeProps {
  element: React.ReactNode;
  content?: 'block' | 'text';
}

export function Node(props: NodeProps): React.ReactNode {
  assert(
    false,
    `A <Node> is only ever to be used as the child of <Level> component, ` +
      `never rendered directly. Please wrap your <Node> in a <Level>.`,
  );
}
