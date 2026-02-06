import type { Meta, StoryObj } from '@storybook/react';
import { Dropdown } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', background: '#f4efe6', minHeight: 250 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

const sampleItems = [
  { id: 'edit', label: 'Edit Profile' },
  { id: 'export', label: 'Export as PDF' },
  { id: 'share', label: 'Share Link' },
  { id: 'delete', label: 'Delete', disabled: true },
];

export const Default: Story = {
  args: {
    trigger: (
      <button
        style={{
          padding: '0.5rem 1rem',
          background: 'var(--ds-ink, #1d1a16)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        Actions
      </button>
    ),
    items: sampleItems,
    onSelect: () => {},
  },
};

export const TextTrigger: Story = {
  args: {
    trigger: <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>More options</span>,
    items: [
      { id: 'duplicate', label: 'Duplicate' },
      { id: 'archive', label: 'Archive' },
    ],
    onSelect: () => {},
  },
};
