import React from 'react';
import type { StoryObj } from '@storybook/react';
import { Paper } from '@joaopmo/react-paper';
import { SingleColumn as SingleColumnComponent } from './SingleColumn';
import { DoubleColumn as DoubleColumnComponent } from './DoubleColumn';

const meta = {
  component: SingleColumnComponent,
  argTypes: {
    pageWidth: {
      control: { type: 'number', min: 0.1, max: 1, step: 0.1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SingleColumnComponent>;

export const Empty: Story = {
  render: (args) => {
    return <Paper {...args} />;
  },
  args: {
    pageWidth: 0.5,
  },
};

export const SingleColumn: Story = {
  render: (args) => {
    return <SingleColumnComponent {...args} />;
  },
  args: {
    pageWidth: 0.5,
  },
};

export const DoubleColumn: Story = {
  render: (args) => {
    return <DoubleColumnComponent {...args} />;
  },
  args: {
    pageWidth: 0.5,
  },
};
