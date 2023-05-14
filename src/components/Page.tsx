import React from 'react';
import { useDimension } from './Dimension';
import { LevelProvider } from './Level';
import { Backdrop } from './Backdrop';
import { Spinner } from './Spinner';
import { type SchemaPage, type Structure } from '../types';
import { useSubscribers } from './Paginator';

interface ColumnProps {
  column: SchemaPage | null;
  structure: Structure;
  pageIndex: number;
  columnIndex: number;
}

function Column({ column, structure, pageIndex, columnIndex }: ColumnProps): JSX.Element {
  const { subColumn } = useSubscribers();

  const reference = React.useCallback(
    (el: Element | null) => {
      if (el != null && pageIndex === 0 && subColumn != null) {
        subColumn(el, columnIndex);
      }
    },
    [columnIndex, pageIndex, subColumn],
  );

  return (
    <div className={`rp-column rp-column-${columnIndex}`} ref={reference}>
      {column?.map((slice) => {
        const height = slice.lowerBound - slice.upperBound;
        const maxHeight = slice.lowerBound === 0 && slice.upperBound === 0 ? 'none' : height;
        const top = -slice.upperBound;

        return (
          <div
            style={{ overflow: 'hidden', maxHeight }}
            key={structure[slice.path[0]][slice.path[1]].rootKey}
          >
            <div style={{ position: 'relative', top }}>
              <LevelProvider
                path={slice.path}
                content={structure[slice.path[0]][slice.path[1]].content}
                subscribe={slice.current === 0}
              >
                {structure[slice.path[0]][slice.path[1]].element}
              </LevelProvider>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface PageProps {
  structure: Structure;
  columns: Array<SchemaPage | null>;
  pageIndex: number;
  loading: boolean;
}

export const Page = React.memo(function Page({
  columns,
  structure,
  pageIndex,
  loading,
}: PageProps): JSX.Element {
  const { scale, ...dimension } = useDimension();

  return (
    <div
      className={`rp-page rp-page-${pageIndex}`}
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
            pageIndex={pageIndex}
            columnIndex={columnIndex}
            key={columnIndex}
          />
        );
      })}
    </div>
  );
});
