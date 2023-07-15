import type { Preview } from '@storybook/react';
import '@joaopmo/react-paper/css/base';
import '@joaopmo/react-paper/css/print';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
