import React from 'react';
import { useDimension } from './Dimension';
import { useSubscribers } from './Paginator';
import { renderWithOutlet } from './Outlet';
import { get } from '../utils';
import { Backdrop } from './Backdrop';
import { Spinner } from './Spinner';
import { type SchemaPage, type Structure, type StructureField } from '../types';

interface PageProps {
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
        const height = calcHeight !== 0 ? calcHeight : 'none';
        const minHeight = height;
        const maxHeight = height;
        const top = -slice.upperBound;

        return (
          <div
            key={`${slice.current}.${slice.path.join('.')}`}
            style={{ overflow: 'hidden', maxHeight, minHeight }}
          >
            <div style={{ position: 'relative', top }}>
              {renderWithOutlet(
                get(structure, slice.path) as StructureField,
                slice.path,
                slice.current === 0,
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Page({ columns, structure, index, loading }: PageProps): JSX.Element {
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
}
