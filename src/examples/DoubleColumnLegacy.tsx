import React from 'react';
import { Column, Paper, Root } from '../index';
import { ImageComponent } from './components/ImageComponent';
import { TextComponent } from './components/TextComponent';

export interface DoubleColumnLegacyProps {
  pageWidth?: number;
}

export function DoubleColumnLegacy({ pageWidth = 0.5 }: DoubleColumnLegacyProps) {
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
