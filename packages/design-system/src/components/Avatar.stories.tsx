import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
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
type Story = StoryObj<typeof Avatar>;

export const WithInitials: Story = {
  args: { initials: 'JD', size: 'md' },
};

export const Small: Story = {
  args: { initials: 'A', size: 'sm' },
};

export const Large: Story = {
  args: { initials: 'ZK', size: 'lg' },
};

export const Online: Story = {
  args: { initials: 'JD', size: 'md', status: 'online' },
};

export const Away: Story = {
  args: { initials: 'JD', size: 'md', status: 'away' },
};

export const Offline: Story = {
  args: { initials: 'JD', size: 'md', status: 'offline' },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Avatar initials="S" size="sm" status="online" />
      <Avatar initials="MD" size="md" status="away" />
      <Avatar initials="LG" size="lg" status="offline" />
    </div>
  ),
};
