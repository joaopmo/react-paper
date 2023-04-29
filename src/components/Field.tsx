import { assert } from '../utils';

interface FieldProps {
  element: JSX.Element;
  content?: 'block' | 'text';
  children?: React.ReactNode;
}

export function Field(props: FieldProps): JSX.Element {
  assert(
    false,
    `A <Field> is only ever to be used as the child of <Column> component, ` +
      `never rendered directly. Please wrap your <Field> in a <Column>.`,
  );
}
