import type { Meta, StoryObj } from '@storybook/react';
import OtelConfigCanvas from './OtelConfigCanvas';

const meta: Meta<typeof OtelConfigCanvas> = {
  title: 'Canvas/OtelConfigCanvas',
  component: OtelConfigCanvas,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OtelConfigCanvas>;

export const Default: Story = {
  args: {
    // Add any default props here
  },
};

export const WithInitialConfig: Story = {
  args: {
    // Add props for a canvas with initial configuration
  },
}; 