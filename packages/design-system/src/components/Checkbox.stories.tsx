import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
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
type Story = StoryObj<typeof Checkbox>;

export const Unchecked: Story = {
  args: { label: 'Include work history', checked: false },
};

export const Checked: Story = {
  args: { label: 'Include work history', checked: true },
};

export const Indeterminate: Story = {
  args: { label: 'Select all skills', indeterminate: true },
};

export const Disabled: Story = {
  args: { label: 'Locked option', checked: true, disabled: true },
};

export const NoLabel: Story = {
  args: { checked: false },
};

export const CheckboxGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Checkbox label="Analyst mask" checked />
      <Checkbox label="Synthesist mask" />
      <Checkbox label="Artisan mask" checked />
      <Checkbox label="Architect mask" disabled />
    </div>
  ),
};
