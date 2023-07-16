import React from 'react';
import { Paper, Column, Root } from '@joaopmo/react-paper';
import { TextComponent, CounterComponent } from '../components';

interface MemoizedProps {
  pageWidth: number;
  memoize: boolean;
}

export function Memoized({ pageWidth, memoize }: MemoizedProps) {
  const [counter, setCounter] = React.useState(0);

  function increase() {
    setCounter((counter) => {
      return counter + 1;
    });
  }
  const Component = CounterComponent;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', rowGap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <button onClick={increase} style={{ textTransform: 'uppercase' }}>
          increase
        </button>
        <span style={{ fontSize: '30px' }}>{`Click Count: ${counter}`}</span>
      </div>
      <Paper pageWidth={pageWidth} memoize={memoize}>
        <Column>
          <Root element={<Component />} rootKey="id-1" />
          <Root element={<TextComponent />} rootKey="id-2" />
        </Column>
      </Paper>
    </div>
  );
}
