/* eslint-disable  @typescript-eslint/no-non-null-assertion */
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

function Column({ column, structure, pageIndex, columnIndex }: ColumnProps): React.ReactNode {
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
      {column?.map((slice, sliceIndex) => {
        const { path, current, upperBound, lowerBound } = slice;
        const { content, element, rootKey } = structure[path[0]][path[1]];

        const top = -upperBound;
        const key = rootKey !== '' ? rootKey! : `${sliceIndex}.${path.join('.')}`;
        const marginBottom = lowerBound <= 0 ? lowerBound : 0;
        const maxHeight = lowerBound <= 0 && upperBound <= 0 ? 'none' : lowerBound - upperBound;

        return (
          <div style={{ overflow: 'hidden', maxHeight, marginBottom }} key={key}>
            <div style={{ position: 'relative', top }}>
              <LevelProvider path={path} content={content} subscribe={current === 0}>
                {element}
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
}: PageProps): React.ReactNode | null {
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
