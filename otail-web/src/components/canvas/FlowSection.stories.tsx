import type { Meta, StoryObj } from '@storybook/react';
import FlowSection from './FlowSection';

const meta: Meta<typeof FlowSection> = {
  title: 'Canvas/FlowSection',
  component: FlowSection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FlowSection>;

export const Default: Story = {
  args: {
    // Add any default props here
  },
};

export const WithNodes: Story = {
  args: {
    // Add props for a flow section with initial nodes
  },
}; 