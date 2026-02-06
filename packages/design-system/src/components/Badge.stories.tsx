import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', background: '#f4efe6' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Success: Story = {
  args: { variant: 'success', children: 'Verified' },
};

export const Warning: Story = {
  args: { variant: 'warning', children: 'Pending' },
};

export const Error: Story = {
  args: { variant: 'error', children: 'Expired' },
};

export const Info: Story = {
  args: { variant: 'info', children: 'Active' },
};

export const Neutral: Story = {
  args: { variant: 'neutral', children: 'Draft' },
};

export const Small: Story = {
  args: { variant: 'info', size: 'sm', children: 'v2.1' },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="success">Verified</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="error">Expired</Badge>
      <Badge variant="info">Active</Badge>
      <Badge variant="neutral">Draft</Badge>
      <Badge variant="info" size="sm">
        sm
      </Badge>
    </div>
  ),
};
