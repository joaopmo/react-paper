import React from 'react';
import { Column, Paper, Root } from '../index';
import { ImageComponent } from './components/ImageComponent';
import { TextComponent } from './components/TextComponent';

export interface SingleColumnLegacyProps {
  pageWidth?: number;
}

export function SingleColumnLegacy({ pageWidth = 0.5 }: SingleColumnLegacyProps) {
  return (
    <Paper pageWidth={pageWidth}>
      <Column>
        <Root element={<TextComponent />} />
        <Root element={<ImageComponent />} content="block" />
      </Column>
    </Paper>
  );
}
