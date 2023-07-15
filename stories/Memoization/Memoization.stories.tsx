import React from 'react';
import type { StoryObj } from '@storybook/react';
import { CounterLayout } from '../components';
import { Memoized as MemoizedComponent } from './Memoized';
import { Base as BaseComponent } from './Base';

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
  decorators: [
    (Story) => (
      <CounterLayout>
        <Story />
      </CounterLayout>
    ),
  ],
  args: {
    pageWidth: 0.5,
    memoize: true,
  },
};
