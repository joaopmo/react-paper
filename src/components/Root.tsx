import { assert } from '../utils';

interface RootProps {
  element: JSX.Element;
  rootKey?: string;
  content?: 'block' | 'text';
}

export function Root(props: RootProps): JSX.Element {
  assert(
    false,
    `A <Root> is only ever to be used as the child of <Column> component, ` +
      `never rendered directly. Please wrap your <Root> in a <Column>.`,
  );
}
