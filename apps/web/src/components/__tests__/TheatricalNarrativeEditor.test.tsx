import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TheatricalNarrativeEditor from '../TheatricalNarrativeEditor';
import type { NarrativeBlock, Scaena } from '@in-midst-my-life/schema';

const mockScaenae: Scaena[] = [
  {
    id: 'scaena-1',
    nomen: 'Technica',
    emoji: '⚙️',
    description: 'Technical',
    immutable: true,
    canonical: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const mockNarrativeBlocks: NarrativeBlock[] = [
  {
    id: 'block-1',
    title: 'Technical Journey',
    content: 'Started coding at 14...',
    weight: 85,
    theatrical_metadata: {
      scaena: 'scaena-1',
      performance_note: 'Technical depth',
      authentic_caveat: 'Emphasizes technical skills',
    },
  },
];

describe('TheatricalNarrativeEditor', () => {
  const mockOnSave = vi.fn();
  const mockOnRegenerate = vi.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnRegenerate.mockClear();
  });

  it('displays theatrical preamble editor', () => {
    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={mockNarrativeBlocks}
        scaenae={mockScaenae}
        theatricalPreamble="The following presents me as..."
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
      />,
    );

    expect(screen.getByText(/preamble|introduction/i)).toBeInTheDocument();
    expect(screen.getByText(/following presents/i)).toBeInTheDocument();
  });

  it('allows editing theatrical preamble', async () => {
    const user = userEvent.setup();

    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={mockNarrativeBlocks}
        scaenae={mockScaenae}
        theatricalPreamble="Original preamble"
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
      />,
    );

    const preambleInput = screen.getByRole('textbox', {
      name: /preamble|introduction/i,
    });
    await user.clear(preambleInput);
    await user.type(preambleInput, 'New preamble');

    expect(preambleInput).toHaveValue('New preamble');
  });

  it('displays authentic disclaimer editor', () => {
    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={mockNarrativeBlocks}
        scaenae={mockScaenae}
        authenticDisclaimier="Emphasizes technical work"
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
      />,
    );

    expect(screen.getByText(/disclaimer|caveat|authentic/i)).toBeInTheDocument();
  });

  it('allows editing authentic disclaimer', async () => {
    const user = userEvent.setup();

    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={mockNarrativeBlocks}
        scaenae={mockScaenae}
        authenticDisclaimier="Original"
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
      />,
    );

    const disclaimerInput = screen.getByRole('textbox', {
      name: /disclaimer|caveat|authentic/i,
    });
    await user.clear(disclaimerInput);
    await user.type(disclaimerInput, 'Updated disclaimer');

    expect(disclaimerInput).toHaveValue('Updated disclaimer');
  });

  it('renders narrative blocks with edit capability', () => {
    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={mockNarrativeBlocks}
        scaenae={mockScaenae}
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
      />,
    );

    expect(screen.getByText('Technical Journey')).toBeInTheDocument();
    expect(screen.getByText(/started coding/i)).toBeInTheDocument();
  });

  it('allows editing narrative block title', async () => {
    const user = userEvent.setup();

    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={mockNarrativeBlocks}
        scaenae={mockScaenae}
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
      />,
    );

    // Click edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Edit title
    const titleInput = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');

    expect(titleInput).toHaveValue('Updated Title');
  });

  it('allows editing narrative block content', async () => {
    const user = userEvent.setup();

    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={mockNarrativeBlocks}
        scaenae={mockScaenae}
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
      />,
    );

    // Click edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Edit content
    const contentInput = screen.getByRole('textbox', { name: /content|body/i });
    await user.clear(contentInput);
    await user.type(contentInput, 'New narrative content');

    expect(contentInput).toHaveValue('New narrative content');
  });

  it('allows adjusting narrative block weight', async () => {
    const user = userEvent.setup();

    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={mockNarrativeBlocks}
        scaenae={mockScaenae}
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
      />,
    );

    // Click edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Find weight slider
    const weightSlider = screen.getByRole('slider', { name: /weight/i });
    expect(weightSlider).toBeInTheDocument();

    await user.clear(weightSlider);
    await user.type(weightSlider, '75');

    expect(weightSlider).toHaveValue('75');
  });

  it('displays scaena selector for theatrical metadata', async () => {
    const user = userEvent.setup();

    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={mockNarrativeBlocks}
        scaenae={mockScaenae}
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
      />,
    );

    // Click edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Should have scaena selector
    const scaenaSelector = screen.getByRole('combobox', { name: /scaena|stage/i });
    expect(scaenaSelector).toBeInTheDocument();
  });

  it('displays performance note editor', async () => {
    const user = userEvent.setup();

    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={mockNarrativeBlocks}
        scaenae={mockScaenae}
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
      />,
    );

    // Click edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Should have performance note field
    const performanceInput = screen.getByRole('textbox', {
      name: /performance|note/i,
    });
    expect(performanceInput).toBeInTheDocument();
  });

  it('displays authentic caveat editor', async () => {
    const user = userEvent.setup();

    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={mockNarrativeBlocks}
        scaenae={mockScaenae}
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
      />,
    );

    // Click edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Should have authentic caveat field
    const caveatInput = screen.getByRole('textbox', {
      name: /caveat|authentic|disclaimer/i,
    });
    expect(caveatInput).toBeInTheDocument();
  });

  it('allows saving changes', async () => {
    const user = userEvent.setup();

    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={mockNarrativeBlocks}
        scaenae={mockScaenae}
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
      />,
    );

    // Click edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Make a change
    const titleInput = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');

    // Save
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalled();
  });

  it('allows regenerating narrative', async () => {
    const user = userEvent.setup();

    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={mockNarrativeBlocks}
        scaenae={mockScaenae}
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
      />,
    );

    const regenerateButton = screen.getByRole('button', {
      name: /regenerate|refresh/i,
    });
    await user.click(regenerateButton);

    expect(mockOnRegenerate).toHaveBeenCalled();
  });

  it('allows deleting narrative blocks', async () => {
    const user = userEvent.setup();
    const mockOnDelete = vi.fn();

    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={mockNarrativeBlocks}
        scaenae={mockScaenae}
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
        onDeleteBlock={mockOnDelete}
      />,
    );

    // Click edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Find delete button
    const deleteButton = screen.getByRole('button', { name: /delete|remove/i });
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('block-1');
  });

  it('shows display vs. edit mode toggle', async () => {
    const user = userEvent.setup();

    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={mockNarrativeBlocks}
        scaenae={mockScaenae}
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
      />,
    );

    // Should start in display mode
    expect(screen.getByText('Technical Journey')).toBeInTheDocument();

    // Toggle to edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Should show edit controls
    expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();

    // Toggle back to display mode
    const viewButton = screen.getByRole('button', { name: /view|done/i });
    await user.click(viewButton);

    // Should return to display mode
    expect(screen.getByText('Technical Journey')).toBeInTheDocument();
  });

  it('handles empty narrative blocks', () => {
    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={[]}
        scaenae={mockScaenae}
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
      />,
    );

    expect(screen.getByText(/no narratives|create|empty/i)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(
      <TheatricalNarrativeEditor
        narrativeBlocks={mockNarrativeBlocks}
        scaenae={mockScaenae}
        loading={true}
        onSave={mockOnSave}
        onRegenerate={mockOnRegenerate}
      />,
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
