import type { Meta, StoryObj } from '@storybook/react';
import { StructPaper } from './StructPaper';

const meta = {
  title: 'Example/Structural Paper',
  component: StructPaper,
} satisfies Meta<typeof StructPaper>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
  args: {},
};
