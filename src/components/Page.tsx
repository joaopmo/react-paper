import React from 'react';
import { useDimension } from './Dimension';

export function Page({ children }: { children: React.ReactNode }): JSX.Element {
  const { scale, ...dimension } = useDimension();

  return (
    <div
      className="pb-page"
      style={{
        transform: `scale(${scale})`,
        ...dimension,
      }}
    >
      {children}
    </div>
  );
}
