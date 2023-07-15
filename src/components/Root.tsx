import type React from 'react';
import { assert } from '../utils';

interface RootProps {
  element: React.ReactNode;
  rootKey?: string;
  content?: 'block' | 'text';
}

export function Root(props: RootProps): React.ReactNode {
  assert(
    false,
    `A <Root> is only ever to be used as the child of <Column> component, ` +
      `never rendered directly. Please wrap your <Root> in a <Column>.`,
  );
}
