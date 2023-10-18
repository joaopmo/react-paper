import type { StoryObj } from '@storybook/react';
import { WithHeader } from './WithHeader';

const meta = {
  component: WithHeader,
  argTypes: {
    pageWidth: {
      control: { type: 'number', min: 0.1, max: 1, step: 0.1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WithHeader>;

export const SingleColumn: Story = {
  args: {
    pageWidth: 0.5,
  },
};
