import type { Meta, StoryObj } from '@storybook/react';
import { NeoCard } from './NeoCard';

const meta: Meta<typeof NeoCard> = {
  title: 'Components/NeoCard',
  component: NeoCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['cyber', 'obsidian', 'hologram'],
      description: 'Visual style variant',
    },
    children: {
      control: 'text',
      description: 'Card content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof NeoCard>;

export const Obsidian: Story = {
  args: {
    variant: 'obsidian',
    children: 'A minimal dark card with subtle hover effects.',
  },
};

export const Cyber: Story = {
  args: {
    variant: 'cyber',
    children: 'Neon-glowing card with cyan accents.',
  },
};

export const Hologram: Story = {
  args: {
    variant: 'hologram',
    children: 'Translucent card with backdrop blur.',
  },
};

export const WithRichContent: Story = {
  args: {
    variant: 'obsidian',
  },
  render: (args) => (
    <NeoCard {...args}>
      <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600 }}>Profile Card</h3>
      <p style={{ margin: '0 0 12px', opacity: 0.7, fontSize: '14px' }}>
        A card showing how NeoCard handles structured content with headings, text, and actions.
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            background: 'rgba(255,255,255,0.1)',
          }}
        >
          TypeScript
        </span>
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            background: 'rgba(255,255,255,0.1)',
          }}
        >
          React
        </span>
      </div>
    </NeoCard>
  ),
};
