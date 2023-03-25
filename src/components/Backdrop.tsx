import React from 'react';

export function Backdrop({ children, open }: { children: React.ReactNode; open: boolean }) {
  return (
    <div className="backdrop" style={{ display: open ? 'flex' : 'none' }}>
      {children}
    </div>
  );
}
