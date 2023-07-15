import React from 'react';
import { Paper, Column, Root } from '@joaopmo/react-paper';
import { TextComponent, CounterComponent } from '../components';

interface MemoizedProps {
  pageWidth: number;
  memoize: boolean;
}

export function Memoized({ pageWidth, memoize }: MemoizedProps) {
  const Component = CounterComponent;
  console.log(1);
  return (
    <Paper pageWidth={pageWidth} memoize={memoize}>
      <Column>
        <Root element={<Component />} rootKey="id-1" />
        <Root element={<TextComponent />} rootKey="id-2" />
        <Root element={<TextComponent />} rootKey="id-3" />
        <Root element={<TextComponent />} rootKey="id-4" />
      </Column>
    </Paper>
  );
}
