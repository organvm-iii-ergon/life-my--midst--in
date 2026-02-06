import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Success: Story = {
  args: { type: 'success', message: 'Profile saved successfully.', visible: true, duration: 0 },
};

export const Error: Story = {
  args: { type: 'error', message: 'Failed to generate narrative.', visible: true, duration: 0 },
};

export const Info: Story = {
  args: { type: 'info', message: 'New mask available.', visible: true, duration: 0 },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    message: 'Credential expires in 7 days.',
    visible: true,
    duration: 0,
  },
};

export const Hidden: Story = {
  args: { type: 'info', message: 'You should not see this.', visible: false },
};
