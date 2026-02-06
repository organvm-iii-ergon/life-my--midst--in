import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
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
type Story = StoryObj<typeof Select>;

const maskOptions = [
  { value: 'analyst', label: 'Analyst' },
  { value: 'synthesist', label: 'Synthesist' },
  { value: 'artisan', label: 'Artisan' },
  { value: 'architect', label: 'Architect' },
];

export const Default: Story = {
  args: { options: maskOptions, placeholder: 'Choose a mask...' },
};

export const WithLabel: Story = {
  args: { options: maskOptions, label: 'Identity Mask', placeholder: 'Select...' },
};

export const Disabled: Story = {
  args: { options: maskOptions, label: 'Mask', value: 'analyst', disabled: true },
};

export const WithValue: Story = {
  args: { options: maskOptions, label: 'Active Mask', value: 'architect' },
};
