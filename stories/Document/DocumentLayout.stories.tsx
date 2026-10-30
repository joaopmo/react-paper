import type { Meta, StoryObj } from '@storybook/react';
import { DocumentLayout } from './DocumentLayout';

import '@joaopmo/react-paper/css/base';
import '@joaopmo/react-paper/css/print';

const meta = {
  title: 'Examples/DocumentLayout (v4)',
  component: DocumentLayout,
  argTypes: {
    pageWidth: {
      control: { type: 'range', min: 0.2, max: 1, step: 0.05 },
    },
    entryCount: {
      control: { type: 'range', min: 2, max: 30, step: 1 },
    },
  },
} satisfies Meta<typeof DocumentLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultiPageTimeline: Story = {
  args: {
    pageWidth: 0.7,
    entryCount: 12,
  },
};
