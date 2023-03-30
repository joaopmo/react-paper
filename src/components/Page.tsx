import React from 'react';
import { useDimension } from './Dimension';
import { PageDescriptor, useSubscribers } from './Paginator';
import { renderWithOutlet } from './Outlet';
import { StructureObject } from '../utils/transforms';
import { get } from '../utils/accessors';
import { FieldObject, Subscribe } from './Field';
import { Backdrop } from './Backdrop';
import { Spinner } from './Spinner';

interface PageProps {
  structure: StructureObject;
  columns: Array<PageDescriptor | null>;
  index: number;
  loading: boolean;
}

interface ColumnProps {
  column: PageDescriptor | null;
  structure: StructureObject;
  pageIndex: number;
  columnIndex: number;
}

function Column({ column, structure, pageIndex, columnIndex }: ColumnProps): JSX.Element {
  const [ref, setRef] = React.useState<Element | null>(null);
  const { subColumn } = useSubscribers();

  React.useLayoutEffect(() => {
    if (ref && subColumn) return subColumn(ref, [pageIndex, columnIndex]);
  }, [columnIndex, pageIndex, ref, subColumn]);

  const reference = React.useCallback(
    (el: Element | null) => {
      if (el && el !== ref && pageIndex === 0) {
        setRef(el);
      }
    },
    [pageIndex, ref],
  );

  return (
    <div className={`pb-column pb-column-${columnIndex}`} ref={reference}>
      {column?.map((slice) => {
        const maxHeight = slice.lowerBound - slice.upperBound || 'none';
        const top = -slice.upperBound;

        return (
          <div
            key={`${slice.current}.${slice.path.join('.')}`}
            style={{ overflow: 'hidden', maxHeight }}
          >
            <div style={{ position: 'relative', top }} data-top={-slice.upperBound}>
              {renderWithOutlet(
                get(structure, slice.path) as FieldObject,
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
      className="pb-page"
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
