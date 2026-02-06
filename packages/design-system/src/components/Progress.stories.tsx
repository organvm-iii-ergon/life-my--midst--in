import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', background: '#f4efe6', maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: { value: 60 },
};

export const WithLabel: Story = {
  args: { value: 75, showLabel: true },
};

export const SuccessVariant: Story = {
  args: { value: 100, variant: 'success', showLabel: true },
};

export const WarningVariant: Story = {
  args: { value: 45, variant: 'warning', showLabel: true },
};

export const ErrorVariant: Story = {
  args: { value: 15, variant: 'error', showLabel: true },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Progress value={80} showLabel />
      <Progress value={100} variant="success" showLabel />
      <Progress value={45} variant="warning" showLabel />
      <Progress value={15} variant="error" showLabel />
    </div>
  ),
};
