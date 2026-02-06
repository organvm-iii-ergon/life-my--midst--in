import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', background: '#f4efe6', maxWidth: 500 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const sampleTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'masks', label: 'Masks' },
  { id: 'export', label: 'Export' },
];

export const Default: Story = {
  args: {
    tabs: sampleTabs,
    activeTab: 'overview',
    onTabChange: () => {},
  },
};

export const SecondTabActive: Story = {
  args: {
    tabs: sampleTabs,
    activeTab: 'timeline',
    onTabChange: () => {},
  },
};

export const TwoTabs: Story = {
  args: {
    tabs: [
      { id: 'edit', label: 'Edit' },
      { id: 'preview', label: 'Preview' },
    ],
    activeTab: 'edit',
    onTabChange: () => {},
  },
};
