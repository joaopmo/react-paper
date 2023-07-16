import type { StoryObj } from '@storybook/react';
import { Memoized as MemoizedComponent } from './Memoized';

const meta = {
  component: MemoizedComponent,
  argTypes: {
    pageWidth: {
      control: { type: 'number', min: 0.1, max: 1, step: 0.1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MemoizedComponent>;

export const Memoized: Story = {
  args: {
    pageWidth: 0.5,
    memoize: false,
  },
};
