import React from 'react';
import { useDimension } from './Dimension';
import { PageDescriptor } from './Paginator';
import { renderWithOutlet } from './Outlet';
import { StructureObject } from '../utils/transforms';
import { get } from '../utils/accessors';
import { FieldObject } from './Field';
import { Backdrop } from './Backdrop';
import { Spinner } from './Spinner';

interface PageProps {
  structure: StructureObject;
  columns: Array<PageDescriptor | null>;
  index: number;
  loading: boolean;
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
          <div className={`pb-column pb-column-${columnIndex}`} key={columnIndex}>
            {column?.map((slice) => {
              const maxHeight = slice.lowerBound.minus(slice.upperBound).toNumber() || 'none';
              // const maxHeight = slice.lowerBound - slice.upperBound || 'none';
              const top = slice.upperBound.neg().toNumber();

              return (
                <div
                  key={`${slice.current}.${slice.path.join('.')}`}
                  style={{ overflow: 'hidden', maxHeight }}
                  // data-max-height={slice.lowerBound - slice.upperBound || 'none'}
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
      })}
    </div>
  );
}
