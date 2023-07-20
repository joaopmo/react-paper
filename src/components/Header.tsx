import type React from 'react';
import { assert } from '../utils';

interface HeaderProps {
  element: React.ReactNode;
  rootKey?: string;
}

export function Header(props: HeaderProps): React.ReactNode {
  assert(
    false,
    `A <Header> is only ever to be used as the child of <Paper> component, ` +
      `never rendered directly. Please wrap your <Header> in a <Paper>.`,
  );
}
