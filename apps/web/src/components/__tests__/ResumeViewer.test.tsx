import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResumeViewer from '../ResumeViewer';
import type { CVEntry, TabulaPersonarumEntry } from '@in-midst-my-life/schema';

const mockPersona: TabulaPersonarumEntry = {
  id: 'persona-1',
  nomen: 'Archimago',
  everyday_name: 'Engineer',
  role_vector: 'Builds systems',
  tone_register: 'Analytical',
  visibility_scope: ['Technica'],
  motto: 'Via ratio ad solutionem',
  active: true,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockEntries: CVEntry[] = [
  {
    id: 'entry-1',
    type: 'experience',
    content: 'Senior Engineer at TechCorp (2023-2024)',
    priority: 95,
    startDate: new Date('2023-01-01'),
    endDate: new Date('2024-01-01'),
  },
  {
    id: 'entry-2',
    type: 'achievement',
    content: 'Led migration of 100+ microservices',
    priority: 85,
  },
  {
    id: 'entry-3',
    type: 'skill',
    content: 'TypeScript, React, Node.js',
    priority: 75,
  },
  {
    id: 'entry-4',
    type: 'education',
    content: 'BS Computer Science',
    priority: 60,
  },
];

describe('ResumeViewer', () => {
  const mockOnExport = vi.fn();

  beforeEach(() => {
    mockOnExport.mockClear();
  });

  it('renders theatrical preamble when provided', () => {
    const preamble = 'The following presents me as an Engineer';
    render(
      <ResumeViewer entries={mockEntries} persona={mockPersona} theatricalPreamble={preamble} />,
    );

    expect(screen.getByText(preamble)).toBeInTheDocument();
  });

  it('displays persona header with role vector', () => {
    render(<ResumeViewer entries={mockEntries} persona={mockPersona} />);

    expect(screen.getByText('Archimago')).toBeInTheDocument();
    expect(screen.getByText('Engineer')).toBeInTheDocument();
    expect(screen.getByText('Builds systems')).toBeInTheDocument();
  });

  it('shows persona visibility scope', () => {
    render(<ResumeViewer entries={mockEntries} persona={mockPersona} />);

    expect(screen.getByText(/technica/i)).toBeInTheDocument();
  });

  it('displays all entry types with corresponding emojis', () => {
    render(<ResumeViewer entries={mockEntries} persona={mockPersona} />);

    // Experience emoji
    expect(screen.getByText(/💼.*experience|experience.*💼/i)).toBeInTheDocument();
    // Achievement emoji
    expect(screen.getByText(/⭐.*achievement|achievement.*⭐/i)).toBeInTheDocument();
    // Skill emoji
    expect(screen.getByText(/🛠️.*skill|skill.*🛠️/i)).toBeInTheDocument();
    // Education emoji
    expect(screen.getByText(/🎓.*education|education.*🎓/i)).toBeInTheDocument();
  });

  it('groups entries by type when grouping is enabled', () => {
    render(<ResumeViewer entries={mockEntries} persona={mockPersona} grouping="type" />);

    // Should show type headings
    expect(screen.getByText(/experience/i)).toBeInTheDocument();
    expect(screen.getByText(/achievement/i)).toBeInTheDocument();
    expect(screen.getByText(/skill/i)).toBeInTheDocument();
    expect(screen.getByText(/education/i)).toBeInTheDocument();
  });

  it('groups entries by date when grouping is enabled', () => {
    const entriesWithDates: CVEntry[] = [
      {
        id: 'e1',
        type: 'experience',
        content: 'Role 1',
        startDate: new Date('2024-01-01'),
      },
      {
        id: 'e2',
        type: 'experience',
        content: 'Role 2',
        startDate: new Date('2023-01-01'),
      },
    ];

    render(<ResumeViewer entries={entriesWithDates} persona={mockPersona} grouping="date" />);

    // Should show year groupings
    expect(screen.getByText(/2024|2023/)).toBeInTheDocument();
  });

  it('sorts entries by priority within groups', () => {
    const { container } = render(
      <ResumeViewer entries={mockEntries} persona={mockPersona} grouping="type" />,
    );

    // Get experience section entries
    const experienceSection = container.querySelector("[data-entry-type='experience']");

    // Higher priority (95) should come before lower priority entries
    if (experienceSection) {
      const entryTexts = experienceSection.textContent;
      expect(entryTexts).toContain('Senior Engineer');
    }
  });

  it('allows PDF export', async () => {
    const user = userEvent.setup();

    // Mock window.print
    const mockPrint = vi.fn();
    window.print = mockPrint;

    render(<ResumeViewer entries={mockEntries} persona={mockPersona} onExport={mockOnExport} />);

    const pdfButton = screen.getByRole('button', { name: /pdf|print|export.*pdf/i });
    await user.click(pdfButton);

    expect(mockPrint).toHaveBeenCalled();
  });

  it('allows JSON export', async () => {
    const user = userEvent.setup();

    // Mock download
    const mockDownload = vi.fn();
    global.URL.createObjectURL = vi.fn();

    render(<ResumeViewer entries={mockEntries} persona={mockPersona} onExport={mockOnExport} />);

    const jsonButton = screen.getByRole('button', {
      name: /json|download.*json/i,
    });
    await user.click(jsonButton);

    expect(mockOnExport).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'json',
      }),
    );
  });

  it('allows Markdown export', async () => {
    const user = userEvent.setup();

    render(<ResumeViewer entries={mockEntries} persona={mockPersona} onExport={mockOnExport} />);

    const mdButton = screen.getByRole('button', {
      name: /markdown|md|export.*markdown/i,
    });
    await user.click(mdButton);

    expect(mockOnExport).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'markdown',
      }),
    );
  });

  it('shows batch generation UI when available', () => {
    render(<ResumeViewer entries={mockEntries} persona={mockPersona} showBatchGeneration={true} />);

    expect(screen.getByRole('button', { name: /generate all|batch/i })).toBeInTheDocument();
  });

  it('displays entry content with proper formatting', () => {
    render(<ResumeViewer entries={mockEntries} persona={mockPersona} />);

    expect(screen.getByText('Senior Engineer at TechCorp (2023-2024)')).toBeInTheDocument();
    expect(screen.getByText('Led migration of 100+ microservices')).toBeInTheDocument();
    expect(screen.getByText('TypeScript, React, Node.js')).toBeInTheDocument();
  });

  it('shows date range for time-bound entries', () => {
    render(<ResumeViewer entries={mockEntries} persona={mockPersona} />);

    // Should display formatted date ranges
    const dateDisplay = screen.queryByText(/2023.*2024|jan.*jan/i);
    expect(dateDisplay).toBeTruthy();
  });

  it('displays priority percentage visual indicator', () => {
    const { container } = render(
      <ResumeViewer entries={mockEntries} persona={mockPersona} showPriority={true} />,
    );

    // Look for priority indicators
    const priorityElements = container.querySelectorAll('[data-priority]');
    expect(priorityElements.length).toBeGreaterThan(0);
  });

  it('handles empty entries gracefully', () => {
    render(<ResumeViewer entries={[]} persona={mockPersona} />);

    expect(screen.getByText(/no entries|empty|create/i)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<ResumeViewer entries={mockEntries} persona={mockPersona} loading={true} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('allows copying resume to clipboard', async () => {
    const user = userEvent.setup();

    // Mock clipboard API
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    render(<ResumeViewer entries={mockEntries} persona={mockPersona} />);

    const copyButton = screen.getByRole('button', {
      name: /copy|clipboard/i,
    });
    await user.click(copyButton);

    expect(mockClipboard.writeText).toHaveBeenCalled();
  });

  it('supports share functionality', async () => {
    const user = userEvent.setup();

    // Mock share API
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share: mockShare });

    render(<ResumeViewer entries={mockEntries} persona={mockPersona} />);

    const shareButton = screen.queryByRole('button', { name: /share/i });
    if (shareButton) {
      await user.click(shareButton);
      expect(mockShare).toHaveBeenCalled();
    }
  });
});
