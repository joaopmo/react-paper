import React from 'react';
import { Paper, Column, Root } from '@joaopmo/react-paper';
import { TextComponent, ImageComponent } from '../components';

interface DoubleColumnProps {
  pageWidth: number;
}
export function DoubleColumn({ pageWidth }: DoubleColumnProps) {
  return (
    <Paper pageWidth={pageWidth}>
      <Column>
        <Root element={<TextComponent />} />
        <Root element={<ImageComponent />} content="block" />
      </Column>
      <Column>
        <Root element={<ImageComponent />} content="block" />
        <Root element={<TextComponent />} />
      </Column>
    </Paper>
  );
}
