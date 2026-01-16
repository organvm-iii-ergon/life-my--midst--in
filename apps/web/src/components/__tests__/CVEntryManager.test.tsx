import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CVEntryManager from '../CVEntryManager';
import type { CVEntry, TabulaPersonarumEntry, Aetas, Scaena } from '@in-midst-my-life/schema';

const mockPersonas: TabulaPersonarumEntry[] = [
  {
    id: 'persona-1',
    nomen: 'Archimago',
    everyday_name: 'Engineer',
    role_vector: 'Builds systems',
    tone_register: 'Analytical',
    visibility_scope: ['Technica'],
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const mockAetas: Aetas[] = [
  {
    id: 'aetas-1',
    nomen: 'Initium',
    label: 'Initiation',
    age_range: '18-25',
    description: 'Beginning phase',
    capability_profile: { primary: ['learning', 'exploration'] },
    duration_years: 7,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const mockScaenae: Scaena[] = [
  {
    id: 'scaena-1',
    nomen: 'Technica',
    emoji: '⚙️',
    description: 'Technical stage',
    immutable: true,
    canonical: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const mockEntries: CVEntry[] = [
  {
    id: 'entry-1',
    type: 'experience',
    content: 'Senior Engineer at TechCorp',
    personae: ['persona-1'],
    aetas: ['aetas-1'],
    scaenae: ['scaena-1'],
    startDate: new Date('2023-01-01'),
    endDate: new Date('2024-01-01'),
    priority: 90,
    tags: ['leadership', 'systems'],
    metadata: { company: 'TechCorp' },
  },
];

describe('CVEntryManager', () => {
  const mockOnAddEntry = vi.fn();
  const mockOnUpdateEntry = vi.fn();
  const mockOnDeleteEntry = vi.fn();

  beforeEach(() => {
    mockOnAddEntry.mockClear();
    mockOnUpdateEntry.mockClear();
    mockOnDeleteEntry.mockClear();
  });

  it('renders existing CV entries', () => {
    render(
      <CVEntryManager
        entries={mockEntries}
        personas={mockPersonas}
        aetas={mockAetas}
        scaenae={mockScaenae}
        onAddEntry={mockOnAddEntry}
      />,
    );

    expect(screen.getByText('Senior Engineer at TechCorp')).toBeInTheDocument();
  });

  it('displays entry type with emoji', () => {
    render(
      <CVEntryManager
        entries={mockEntries}
        personas={mockPersonas}
        aetas={mockAetas}
        scaenae={mockScaenae}
      />,
    );

    // Entry type should be displayed with emoji
    expect(screen.getByText(/💼|experience/i)).toBeInTheDocument();
  });

  it('shows all 11 entry types in create form', async () => {
    const user = userEvent.setup();
    render(
      <CVEntryManager
        entries={[]}
        personas={mockPersonas}
        aetas={mockAetas}
        scaenae={mockScaenae}
      />,
    );

    // Open create form
    const createButton = screen.getByText(/add|create|new entry/i);
    await user.click(createButton);

    // Check for entry type selector
    const typeSelector = screen.getByRole('combobox', {
      name: /type|entry type/i,
    });
    expect(typeSelector).toBeInTheDocument();

    // Types: experience, achievement, skill, publication, project, education, certification, language, volunteer, award, custom
    const expectedTypes = [
      'experience',
      'achievement',
      'skill',
      'publication',
      'project',
      'education',
      'certification',
      'language',
      'volunteer',
      'award',
      'custom',
    ];

    // Verify type options exist
    await user.click(typeSelector);
    for (const type of expectedTypes) {
      const option = screen.queryByText(new RegExp(type, 'i'));
      expect(option).toBeTruthy();
    }
  });

  it('allows multi-dimensional tagging with personae, aetas, scaenae', async () => {
    const user = userEvent.setup();
    render(
      <CVEntryManager
        entries={[]}
        personas={mockPersonas}
        aetas={mockAetas}
        scaenae={mockScaenae}
        onAddEntry={mockOnAddEntry}
      />,
    );

    // Open form
    const createButton = screen.getByText(/add|create|new entry/i);
    await user.click(createButton);

    // Fill content
    const contentInput = screen.getByPlaceholderText(/description|content|details/i);
    await user.type(contentInput, 'New entry');

    // Add personae tag
    const personaeCheckbox = screen.getByRole('checkbox', {
      name: /archimago|engineer/i,
    });
    await user.click(personaeCheckbox);
    expect(personaeCheckbox).toBeChecked();

    // Add aetas tag
    const aetasCheckbox = screen.getByRole('checkbox', {
      name: /initium|initiation/i,
    });
    await user.click(aetasCheckbox);
    expect(aetasCheckbox).toBeChecked();

    // Add scaena tag
    const scaenaCheckbox = screen.getByRole('checkbox', {
      name: /technica/i,
    });
    await user.click(scaenaCheckbox);
    expect(scaenaCheckbox).toBeChecked();
  });

  it('displays personae tags in orange', () => {
    const { container } = render(
      <CVEntryManager
        entries={mockEntries}
        personas={mockPersonas}
        aetas={mockAetas}
        scaenae={mockScaenae}
      />,
    );

    // Check for orange-colored persona tags
    const orangeTags = container.querySelectorAll("[data-tag-type='persona']");
    expect(orangeTags.length).toBeGreaterThan(0);
  });

  it('displays aetas tags in blue', () => {
    const { container } = render(
      <CVEntryManager
        entries={mockEntries}
        personas={mockPersonas}
        aetas={mockAetas}
        scaenae={mockScaenae}
      />,
    );

    const blueTags = container.querySelectorAll("[data-tag-type='aetas']");
    expect(blueTags.length).toBeGreaterThan(0);
  });

  it('displays scaenae tags in green with emoji', () => {
    const { container } = render(
      <CVEntryManager
        entries={mockEntries}
        personas={mockPersonas}
        aetas={mockAetas}
        scaenae={mockScaenae}
      />,
    );

    const greenTags = container.querySelectorAll("[data-tag-type='scaena']");
    expect(greenTags.length).toBeGreaterThan(0);

    // Should contain emoji (⚙️)
    expect(screen.getByText(/⚙️|technica/i)).toBeInTheDocument();
  });

  it('displays custom tags in yellow', () => {
    const entriesWithCustomTags: CVEntry[] = [
      {
        id: 'entry-1',
        type: 'experience',
        content: 'Test entry',
        tags: ['custom-tag-1', 'custom-tag-2'],
      },
    ];

    const { container } = render(
      <CVEntryManager
        entries={entriesWithCustomTags}
        personas={mockPersonas}
        aetas={mockAetas}
        scaenae={mockScaenae}
      />,
    );

    const yellowTags = container.querySelectorAll("[data-tag-type='custom']");
    expect(yellowTags.length).toBeGreaterThan(0);
  });

  it('allows priority slider adjustment (0-100%)', async () => {
    const user = userEvent.setup();
    render(
      <CVEntryManager
        entries={[]}
        personas={mockPersonas}
        aetas={mockAetas}
        scaenae={mockScaenae}
        onAddEntry={mockOnAddEntry}
      />,
    );

    const createButton = screen.getByText(/add|create|new entry/i);
    await user.click(createButton);

    // Find priority slider
    const prioritySlider = screen.getByRole('slider', { name: /priority/i });
    expect(prioritySlider).toBeInTheDocument();

    // Adjust to 75%
    await user.clear(prioritySlider);
    await user.type(prioritySlider, '75');
    expect(prioritySlider).toHaveValue('75');
  });

  it('allows date range selection for entries', async () => {
    const user = userEvent.setup();
    render(
      <CVEntryManager
        entries={[]}
        personas={mockPersonas}
        aetas={mockAetas}
        scaenae={mockScaenae}
      />,
    );

    const createButton = screen.getByText(/add|create|new entry/i);
    await user.click(createButton);

    // Find date inputs
    const startDateInput = screen.getByRole('textbox', { name: /start date/i });
    const endDateInput = screen.getByRole('textbox', { name: /end date/i });

    expect(startDateInput).toBeInTheDocument();
    expect(endDateInput).toBeInTheDocument();
  });

  it('calls onAddEntry with complete entry data', async () => {
    const user = userEvent.setup();
    render(
      <CVEntryManager
        entries={[]}
        personas={mockPersonas}
        aetas={mockAetas}
        scaenae={mockScaenae}
        onAddEntry={mockOnAddEntry}
      />,
    );

    const createButton = screen.getByText(/add|create|new entry/i);
    await user.click(createButton);

    // Fill form
    const contentInput = screen.getByPlaceholderText(/description|content/i);
    await user.type(contentInput, 'New achievement');

    // Select type
    const typeSelector = screen.getByRole('combobox', { name: /type/i });
    await user.click(typeSelector);
    await user.click(screen.getByText(/achievement/i));

    // Set priority
    const prioritySlider = screen.getByRole('slider', { name: /priority/i });
    await user.clear(prioritySlider);
    await user.type(prioritySlider, '80');

    // Submit
    const submitButton = screen.getByRole('button', { name: /save|create/i });
    await user.click(submitButton);

    expect(mockOnAddEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'achievement',
        content: expect.stringContaining('achievement'),
        priority: 80,
      }),
    );
  });

  it('calls onDeleteEntry when delete button clicked', async () => {
    const user = userEvent.setup();
    render(
      <CVEntryManager
        entries={mockEntries}
        personas={mockPersonas}
        aetas={mockAetas}
        scaenae={mockScaenae}
        onDeleteEntry={mockOnDeleteEntry}
      />,
    );

    // Find and click delete button for entry
    const deleteButton = screen.getByRole('button', {
      name: /delete|remove/i,
    });
    await user.click(deleteButton);

    expect(mockOnDeleteEntry).toHaveBeenCalledWith('entry-1');
  });

  it('displays loading state', () => {
    render(
      <CVEntryManager
        entries={[]}
        personas={mockPersonas}
        aetas={mockAetas}
        scaenae={mockScaenae}
        loading={true}
      />,
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows date range in entry summary (e.g., Jan 2023 - Jan 2024)', () => {
    render(
      <CVEntryManager
        entries={mockEntries}
        personas={mockPersonas}
        aetas={mockAetas}
        scaenae={mockScaenae}
      />,
    );

    // Should display formatted date range
    const dateText = screen.queryByText(/2023.*2024|jan.*jan/i);
    expect(dateText).toBeTruthy();
  });

  it('supports advanced filtering by multiple dimensions', async () => {
    const user = userEvent.setup();
    render(
      <CVEntryManager
        entries={mockEntries}
        personas={mockPersonas}
        aetas={mockAetas}
        scaenae={mockScaenae}
      />,
    );

    // Open filter
    const filterButton = screen.getByRole('button', { name: /filter/i });
    await user.click(filterButton);

    // Select filter dimensions
    const personaeFilter = screen.getByRole('checkbox', {
      name: /filter.*archimago/i,
    });
    await user.click(personaeFilter);

    // Should show filtered results
    expect(screen.getByText('Senior Engineer at TechCorp')).toBeInTheDocument();
  });

  it('handles empty entries list', () => {
    render(
      <CVEntryManager
        entries={[]}
        personas={mockPersonas}
        aetas={mockAetas}
        scaenae={mockScaenae}
      />,
    );

    expect(screen.getByText(/no entries|create your first|empty/i)).toBeInTheDocument();
  });
});
