import React from 'react';
import { Column, Paper, Root } from '../index';
import { CounterComponent } from './components/CounterComponent';
import { TextComponent } from './components/TextComponent';

export interface MemoizationLegacyProps {
  pageWidth?: number;
  memoize?: boolean;
}

export function MemoizationLegacy({ pageWidth = 0.5, memoize = true }: MemoizationLegacyProps) {
  const [counter, setCounter] = React.useState(0);

  function increase() {
    setCounter((prev) => prev + 1);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', rowGap: '1.5rem', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <button
          onClick={increase}
          style={{
            padding: '8px 16px',
            textTransform: 'uppercase',
            fontWeight: 600,
            cursor: 'pointer',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            background: '#ffffff',
          }}
        >
          Increase
        </button>
        <span style={{ fontSize: '24px', fontWeight: 600 }}>{`Click Count: ${counter}`}</span>
      </div>
      <Paper pageWidth={pageWidth} memoize={memoize}>
        <Column>
          <Root element={<CounterComponent />} rootKey="id-1" />
          <Root element={<TextComponent />} rootKey="id-2" />
        </Column>
      </Paper>
    </div>
  );
}
