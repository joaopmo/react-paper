import React from 'react';
import { useDimension } from './Dimension';
import { useSubscribers } from './Paginator';
import { LevelProvider } from './Level';
import { get } from '../utils';
import { Backdrop } from './Backdrop';
import { Spinner } from './Spinner';
import { type SchemaPage, type Structure, type StructureField } from '../types';

interface PageNestedProps {
  structure: Structure;
  columns: Array<SchemaPage | null>;
  index: number;
  loading: boolean;
}

interface ColumnProps {
  column: SchemaPage | null;
  structure: Structure;
  pageIndex: number;
  columnIndex: number;
}

function Column({ column, structure, pageIndex, columnIndex }: ColumnProps): JSX.Element {
  const [ref, setRef] = React.useState<Element | null>(null);
  const { subColumn } = useSubscribers();

  React.useLayoutEffect(() => {
    if (ref != null && subColumn != null) return subColumn(ref, [pageIndex, columnIndex]);
  }, [columnIndex, pageIndex, ref, subColumn]);

  const reference = React.useCallback(
    (el: Element | null) => {
      if (el != null && el !== ref && pageIndex === 0) {
        setRef(el);
      }
    },
    [pageIndex, ref],
  );

  return (
    <div className={`rp-column rp-column-${columnIndex}`} ref={reference}>
      {column?.map((slice) => {
        const calcHeight = slice.lowerBound - slice.upperBound;
        const maxHeight = calcHeight !== 0 ? calcHeight : 'none';
        const top = -slice.upperBound;
        return (
          <div
            style={{ overflow: 'hidden', maxHeight }}
            key={`${slice.current}.${slice.path.join('.')}`}
          >
            <div style={{ position: 'relative', top }}>
              <LevelProvider
                path={slice.path}
                content={(get(structure, slice.path) as StructureField).content ?? 'text'}
                subscribe={slice.current === 0}
              >
                {(get(structure, slice.path) as StructureField).element}
              </LevelProvider>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const PageNested = React.memo(function PageNested({
  columns,
  structure,
  index,
  loading,
}: PageNestedProps): JSX.Element {
  const { scale, ...dimension } = useDimension();

  return (
    <div
      className="rp-page"
      style={{
        transform: `scale(${scale})`,
        ...dimension,
      }}
    >
      <Backdrop open={loading}>
        <Spinner />
      </Backdrop>
      {columns.map((column, columnIndex) => {
        return (
          <Column
            column={column}
            structure={structure}
            pageIndex={index}
            columnIndex={columnIndex}
            key={columnIndex}
          />
        );
      })}
    </div>
  );
});
