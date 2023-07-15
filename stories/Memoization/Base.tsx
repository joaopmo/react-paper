import React from 'react';
import { Paper, Column, Root } from '@joaopmo/react-paper';
import { TextComponent, CounterComponent } from '../components';

interface BaseProps {
  pageWidth: number;
}

export function Base({ pageWidth }: BaseProps) {
  return (
    <Paper pageWidth={pageWidth}>
      <Column>
        <Root element={<CounterComponent />} />
        <Root element={<TextComponent />} />
        <Root element={<TextComponent />} />
        <Root element={<TextComponent />} />
      </Column>
    </Paper>
  );
}
