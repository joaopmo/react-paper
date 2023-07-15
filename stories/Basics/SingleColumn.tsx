import React from 'react';
import { Paper, Column, Root } from '@joaopmo/react-paper';
import { TextComponent, ImageComponent } from '../components';

interface SingleColumnProps {
  pageWidth: number;
}
export function SingleColumn({ pageWidth }: SingleColumnProps) {
  return (
    <Paper pageWidth={pageWidth}>
      <Column>
        <Root element={<TextComponent />} />
        <Root element={<ImageComponent />} content="block" />
      </Column>
    </Paper>
  );
}
