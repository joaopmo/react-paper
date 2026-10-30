import React from 'react';
import { Column, Header, Paper, Root } from '../index';
import { HeaderComponent } from './components/HeaderComponent';
import { ImageComponent } from './components/ImageComponent';
import { TextComponent } from './components/TextComponent';

export interface HeaderLegacyProps {
  pageWidth?: number;
}

export function HeaderLegacy({ pageWidth = 0.5 }: HeaderLegacyProps) {
  return (
    <Paper pageWidth={pageWidth}>
      <Header element={<HeaderComponent />} />
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
