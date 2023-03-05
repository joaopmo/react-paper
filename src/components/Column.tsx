import { invariant } from '../invariant';
import { FieldObject, FieldObjectPartial } from './Field';

export type ColumnObject = FieldObject[];
export type ColumnObjectPartial = FieldObjectPartial[];

export function Column(): JSX.Element {
  invariant(
    false,
    `A <Column> is only ever to be used as the child of <PageBreaker> element, ` +
      `never rendered directly. Please wrap your <Column> in a <PageBreaker>.`,
  );
}
