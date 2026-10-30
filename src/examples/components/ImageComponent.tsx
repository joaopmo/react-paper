import React from 'react';
import { useRegister } from '../../index';

export function ImageComponent() {
  const { register } = useRegister();

  return (
    <div {...register()} style={{ display: 'inline-block', width: '200px', height: '300px' }}>
      <svg
        width="200"
        height="300"
        viewBox="0 0 200 300"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', borderRadius: '4px', background: '#e2e8f0' }}
      >
        <rect width="200" height="300" fill="#cbd5e1" />
        <rect x="20" y="80" width="40" height="220" fill="#64748b" />
        <rect x="70" y="40" width="50" height="260" fill="#475569" />
        <rect x="130" y="110" width="45" height="190" fill="#94a3b8" />
        <circle cx="150" cy="45" r="16" fill="#f59e0b" />
        <text
          x="100"
          y="290"
          textAnchor="middle"
          fontSize="11"
          fill="#334155"
          fontFamily="system-ui, sans-serif"
        >
          200 × 300
        </text>
      </svg>
    </div>
  );
}
