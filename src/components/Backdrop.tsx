import React from 'react';

interface BackdropProps {
  children: React.ReactNode;
  open: boolean;
}

export function Backdrop({ children, open }: BackdropProps): React.ReactNode {
  return (
    <div className="rp-backdrop" style={{ display: open ? 'flex' : 'none' }}>
      {children}
    </div>
  );
}
