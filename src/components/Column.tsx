import React from 'react'; // eslint-disable-line
import { assert } from '../utils';

interface ColumnProps {
  children: React.ReactNode;
}
export function Column(props: ColumnProps): JSX.Element {
  assert(
    false,
    `A <Column> is only ever to be used as the child of <Paper> component, ` +
      `never rendered directly. Please wrap your <Column> in a <Paper>.`,
  );
}
