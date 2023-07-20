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
      if (el != null && subColumn != null && pageIndex === 0) {
        subColumn(el, columnIndex);
      }
    },
    [columnIndex, pageIndex, subColumn],
  );

  const structureHasHeader = structure[0][0].content === 'header';
  const currentColumnIsHeader = structureHasHeader && columnIndex === 0;

  if (currentColumnIsHeader && pageIndex > 0) {
    return null;
  }

  const columnCount = structureHasHeader ? structure.length - 1 : structure.length;
  const columnStyle: React.CSSProperties = { flexBasis: 100 / columnCount };

  return (
    <div
      className={currentColumnIsHeader ? `rp-header` : `rp-column rp-column-${columnIndex}`}
      style={currentColumnIsHeader ? undefined : columnStyle}
      ref={reference}
    >
      {column?.map((slice) => {
        const { path, current, upperBound, lowerBound } = slice;
        const { content, element, rootKey } = structure[path[0]][path[1]];

        const key = rootKey !== '' && rootKey != null ? rootKey : path.join('.');
        const innerStyle: React.CSSProperties = { position: 'relative', top: -upperBound };
        const outerStyle: React.CSSProperties = {
          overflow: 'hidden',
          marginBottom: lowerBound <= 0 ? lowerBound : 0,
          maxHeight: lowerBound <= 0 && upperBound <= 0 ? 'none' : lowerBound - upperBound,
        };

        return (
          <div
            aria-hidden={current === 0 ? undefined : true}
            style={currentColumnIsHeader ? undefined : outerStyle}
            key={key}
          >
            <div style={currentColumnIsHeader ? undefined : innerStyle}>
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
  const { subPage } = useSubscribers();
  const { scale, ...dimension } = useDimension();

  const reference = React.useCallback(
    (el: Element | null) => {
      if (el != null && subPage != null && pageIndex === 0) {
        subPage(el);
      }
    },
    [pageIndex, subPage],
  );

  return (
    <div
      className={`rp-page rp-page-${pageIndex}`}
      style={{
        transform: `scale(${scale})`,
        ...dimension,
      }}
      ref={reference}
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
