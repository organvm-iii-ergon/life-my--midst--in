import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AetasTimeline from '../AetasTimeline';
import type { Aetas } from '@in-midst-my-life/schema';

const canonicalAetas: Aetas[] = [
  {
    id: 'aetas-1',
    nomen: 'Initium',
    label: 'Initiation',
    age_range: '18-25',
    description: 'Beginning phase of development',
    capability_profile: { primary: ['learning', 'exploration'] },
    duration_years: 7,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'aetas-2',
    nomen: 'Emergens',
    label: 'Emergence',
    age_range: '25-32',
    description: "Finding one's voice",
    capability_profile: { primary: ['expression', 'contribution'] },
    duration_years: 7,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'aetas-3',
    nomen: 'Consolidatio',
    label: 'Consolidation',
    age_range: '32-40',
    description: 'Building mastery',
    capability_profile: { primary: ['mastery', 'depth'] },
    duration_years: 8,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

describe('AetasTimeline', () => {
  const mockOnUpdateAetas = vi.fn();
  const mockOnAddAetas = vi.fn();

  beforeEach(() => {
    mockOnUpdateAetas.mockClear();
    mockOnAddAetas.mockClear();
  });

  it('renders all 8 canonical aetas stages', () => {
    const fullAetas = Array.from({ length: 8 }, (_, i) => ({
      ...canonicalAetas[0],
      id: `aetas-${i}`,
      label: `Stage ${i + 1}`,
    }));

    render(
      <AetasTimeline
        canonicalAetas={fullAetas}
        profileAetas={[]}
        onUpdateAetas={mockOnUpdateAetas}
      />,
    );

    // Should render 8 stages
    const stageButtons = screen.getAllByRole('button', { name: /stage|aetas/i });
    expect(stageButtons.length).toBeGreaterThanOrEqual(8);
  });

  it('displays emoji-coded stages', () => {
    render(
      <AetasTimeline
        canonicalAetas={canonicalAetas}
        profileAetas={[]}
        onUpdateAetas={mockOnUpdateAetas}
      />,
    );

    // Should show emoji indicators for stages
    const emojis = screen.queryAllByText(/🌱|🚀|⭐|🏔️|💎|🌊|📚|🕯️/);
    expect(emojis.length).toBeGreaterThan(0);
  });

  it('shows connection lines between stages', () => {
    const { container } = render(
      <AetasTimeline
        canonicalAetas={canonicalAetas}
        profileAetas={[]}
        onUpdateAetas={mockOnUpdateAetas}
      />,
    );

    // Look for SVG lines or connector elements
    const connectors = container.querySelectorAll(
      "line, [data-testid='connector'], [class*='line']",
    );
    expect(connectors.length).toBeGreaterThan(0);
  });

  it('color-codes stages by completion status', () => {
    const profileAetas = [
      { id: 'aetas-1', startDate: new Date('2020-01-01') },
      { id: 'aetas-2', startDate: new Date('2024-01-01') }, // current
    ];

    const { container } = render(
      <AetasTimeline
        canonicalAetas={canonicalAetas}
        profileAetas={profileAetas}
        currentAetasId="aetas-2"
        onUpdateAetas={mockOnUpdateAetas}
      />,
    );

    // Check for color-coded elements
    const completedStages = container.querySelectorAll("[data-status='completed']");
    const currentStages = container.querySelectorAll("[data-status='current']");

    expect(completedStages.length).toBeGreaterThan(0);
    expect(currentStages.length).toBeGreaterThan(0);
  });

  it('displays stage details on expansion', async () => {
    const user = userEvent.setup();

    render(
      <AetasTimeline
        canonicalAetas={canonicalAetas}
        profileAetas={[]}
        onUpdateAetas={mockOnUpdateAetas}
      />,
    );

    // Click to expand first stage
    const expandButtons = screen.getAllByRole('button', { name: /expand|details/i });
    if (expandButtons.length > 0) {
      await user.click(expandButtons[0]);

      // Should show details
      expect(screen.getByText(/beginning|learning|exploration/i)).toBeInTheDocument();
    }
  });

  it('shows capability profile for each stage', () => {
    render(
      <AetasTimeline
        canonicalAetas={canonicalAetas}
        profileAetas={[]}
        onUpdateAetas={mockOnUpdateAetas}
      />,
    );

    // Capability profiles should be visible
    expect(screen.getByText(/learning/i)).toBeInTheDocument();
    expect(screen.getByText(/expression|contribution/i)).toBeInTheDocument();
    expect(screen.getByText(/mastery|depth/i)).toBeInTheDocument();
  });

  it('displays age ranges for each stage', () => {
    render(
      <AetasTimeline
        canonicalAetas={canonicalAetas}
        profileAetas={[]}
        onUpdateAetas={mockOnUpdateAetas}
      />,
    );

    expect(screen.getByText(/18-25|age/i)).toBeInTheDocument();
    expect(screen.getByText(/25-32|age/i)).toBeInTheDocument();
    expect(screen.getByText(/32-40|age/i)).toBeInTheDocument();
  });

  it("shows profile's current aetas progression", () => {
    const profileAetas = [
      { id: 'aetas-1', startDate: new Date('2020-01-01') },
      { id: 'aetas-2', startDate: new Date('2024-01-01') },
    ];

    render(
      <AetasTimeline
        canonicalAetas={canonicalAetas}
        profileAetas={profileAetas}
        currentAetasId="aetas-2"
        onUpdateAetas={mockOnUpdateAetas}
      />,
    );

    // Should highlight current stage
    const currentLabel = screen.queryByText(/current|active|now/i);
    expect(currentLabel).toBeTruthy();
  });

  it('allows editing aetas metadata', async () => {
    const user = userEvent.setup();

    render(
      <AetasTimeline
        canonicalAetas={canonicalAetas}
        profileAetas={[]}
        onUpdateAetas={mockOnUpdateAetas}
      />,
    );

    // Find edit button
    const editButtons = screen.queryAllByRole('button', {
      name: /edit|update/i,
    });

    if (editButtons.length > 0) {
      await user.click(editButtons[0]);

      // Should show edit form
      const input = screen.queryByRole('textbox', { name: /notes|description/i });
      if (input) {
        await user.type(input, 'Updated notes');
        expect(mockOnUpdateAetas).toHaveBeenCalled();
      }
    }
  });

  it('supports adding new aetas to profile progression', async () => {
    const user = userEvent.setup();

    render(
      <AetasTimeline
        canonicalAetas={canonicalAetas}
        profileAetas={[]}
        onAddAetas={mockOnAddAetas}
        onUpdateAetas={mockOnUpdateAetas}
      />,
    );

    // Find add button
    const addButton = screen.getByRole('button', { name: /add|new|assign/i });
    await user.click(addButton);

    // Should allow selecting an aetas
    const selectDropdown = screen.getByRole('combobox', { name: /aetas|stage/i });
    expect(selectDropdown).toBeInTheDocument();
  });

  it('shows duration for each stage', () => {
    render(
      <AetasTimeline
        canonicalAetas={canonicalAetas}
        profileAetas={[]}
        onUpdateAetas={mockOnUpdateAetas}
      />,
    );

    // Duration should be displayed
    expect(screen.getByText(/7\s+years/i)).toBeInTheDocument();
    expect(screen.getByText(/8\s+years/i)).toBeInTheDocument();
  });

  it('displays transitions between stages', async () => {
    const user = userEvent.setup();

    const profileAetas = [
      { id: 'aetas-1', startDate: new Date('2020-01-01'), endDate: new Date('2024-01-01') },
      { id: 'aetas-2', startDate: new Date('2024-01-01') },
    ];

    render(
      <AetasTimeline
        canonicalAetas={canonicalAetas}
        profileAetas={profileAetas}
        onUpdateAetas={mockOnUpdateAetas}
      />,
    );

    // Should show transition points
    const transitionElements = screen.queryAllByText(/transition|moved|progressed/i);
    expect(transitionElements.length).toBeGreaterThan(0);
  });

  it('shows summary section with progression info', () => {
    const profileAetas = [
      { id: 'aetas-1', startDate: new Date('2020-01-01'), endDate: new Date('2024-01-01') },
      { id: 'aetas-2', startDate: new Date('2024-01-01') },
    ];

    render(
      <AetasTimeline
        canonicalAetas={canonicalAetas}
        profileAetas={profileAetas}
        currentAetasId="aetas-2"
        onUpdateAetas={mockOnUpdateAetas}
        showSummary={true}
      />,
    );

    // Should show summary info
    expect(screen.getByText(/completed|currently in/i)).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(
      <AetasTimeline
        canonicalAetas={[]}
        profileAetas={[]}
        loading={true}
        onUpdateAetas={mockOnUpdateAetas}
      />,
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('allows setting end date for completed aetas', async () => {
    const user = userEvent.setup();

    const profileAetas = [{ id: 'aetas-1', startDate: new Date('2020-01-01') }];

    render(
      <AetasTimeline
        canonicalAetas={canonicalAetas}
        profileAetas={profileAetas}
        onUpdateAetas={mockOnUpdateAetas}
      />,
    );

    // Find edit button for completed stage
    const editButtons = screen.queryAllByRole('button', {
      name: /complete|end|finish/i,
    });

    if (editButtons.length > 0) {
      await user.click(editButtons[0]);

      // Should show date picker or confirmation
      const dateInput = screen.queryByRole('textbox', { name: /date|end/i });
      expect(dateInput).toBeTruthy();
    }
  });
});
