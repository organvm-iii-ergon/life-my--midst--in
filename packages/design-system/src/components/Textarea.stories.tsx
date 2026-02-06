import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
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
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: { placeholder: 'Write your narrative...' },
};

export const WithLabel: Story = {
  args: { label: 'Personal Thesis', placeholder: 'Describe your professional identity...' },
};

export const WithMaxLength: Story = {
  args: {
    label: 'Bio',
    maxLength: 200,
    value: 'A brief professional biography.',
    placeholder: 'Keep it concise...',
  },
};

export const CustomRows: Story = {
  args: { label: 'Extended Description', rows: 8, placeholder: 'Longer form text...' },
};
