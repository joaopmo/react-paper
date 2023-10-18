import React from 'react';
import { Paper, Header, Column, Root } from '@joaopmo/react-paper';
import { HeaderComponent, ImageComponent, TextComponent } from '../components';

interface WithHeaderProps {
  pageWidth: number;
}

export function WithHeader({ pageWidth }: WithHeaderProps) {
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
