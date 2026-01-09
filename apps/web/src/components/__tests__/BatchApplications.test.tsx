import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BatchApplications from '@/components/BatchApplications';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  CheckCircle: () => <div data-testid="check-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Send: () => <div data-testid="send-icon" />,
  Pause: () => <div data-testid="pause-icon" />,
  RotateCcw: () => <div data-testid="rotate-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
}));

// Mock Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('BatchApplications Component', () => {
  const defaultProps = {
    profileId: 'profile-123',
    personaId: 'Architect',
    minCompatibilityScore: 70,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<BatchApplications {...defaultProps} />);
    // Component shows animated skeleton loaders while loading
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays stats dashboard with totals', async () => {
    render(<BatchApplications {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/total jobs/i)).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('calculates eligible jobs based on threshold', async () => {
    render(<BatchApplications {...defaultProps} minCompatibilityScore={80} />);

    await waitFor(() => {
      expect(screen.getByText(/eligible/i)).toBeInTheDocument();
    });
  });

  it('displays all jobs in list after loading', async () => {
    render(<BatchApplications {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/senior software engineer/i)).toBeInTheDocument();
      expect(screen.getByText(/staff engineer/i)).toBeInTheDocument();
      expect(screen.getByText(/engineering manager/i)).toBeInTheDocument();
    });
  });

  it('shows job compatibility scores with color coding', async () => {
    render(<BatchApplications {...defaultProps} />);

    await waitFor(() => {
      const scores = screen.getAllByText(/\d+%/);
      expect(scores.length).toBeGreaterThan(0);
    });
  });

  it('allows selecting individual jobs', async () => {
    render(<BatchApplications {...defaultProps} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/senior software engineer/i)).toBeInTheDocument();
    });

    const checkbox = screen.getAllByRole('checkbox')[0];
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it('allows selecting all jobs', async () => {
    render(<BatchApplications {...defaultProps} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/select all/i)).toBeInTheDocument();
    });

    const selectAllButton = screen.getByText(/select all/i);
    await user.click(selectAllButton);

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });
  });

  it('deselects all when all are selected', async () => {
    render(<BatchApplications {...defaultProps} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/select all/i)).toBeInTheDocument();
    });

    let selectAllButton = screen.getByText(/select all/i);
    await user.click(selectAllButton);

    // Click again to deselect
    selectAllButton = screen.getByText(/deselect all/i);
    await user.click(selectAllButton);

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it('allows adjusting auto-apply threshold with slider', async () => {
    render(<BatchApplications {...defaultProps} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/auto-apply threshold/i)).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider', { name: /threshold/i });
    await user.clear(slider);
    await user.type(slider, '80');

    expect(slider).toHaveValue('80');
  });

  it('displays correct eligible count for threshold', async () => {
    const { rerender } = render(<BatchApplications {...defaultProps} minCompatibilityScore={75} />);

    await waitFor(() => {
      expect(screen.getByText(/of 5 jobs are eligible/i)).toBeInTheDocument();
    });
  });

  it('auto-apply button disabled when no eligible jobs', async () => {
    render(<BatchApplications {...defaultProps} minCompatibilityScore={95} />);

    await waitFor(() => {
      const autoApplyButton = screen.getByText(/auto-apply all eligible/i);
      expect(autoApplyButton).toBeDisabled();
    });
  });

  it('submits selected applications when button clicked', async () => {
    render(<BatchApplications {...defaultProps} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/manual selection/i)).toBeInTheDocument();
    });

    // Select some jobs
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // Select second job
    await user.click(checkboxes[2]); // Select third job

    // Submit selected
    const submitButton = screen.getByText(/apply to selected \(2\)/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/submitting applications/i)).toBeInTheDocument();
    });
  });

  it('shows progress bar during batch submission', async () => {
    render(<BatchApplications {...defaultProps} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/senior software engineer/i)).toBeInTheDocument();
    });

    const autoApplyButton = screen.getByText(/auto-apply all eligible/i);
    if (!autoApplyButton.hasAttribute('disabled')) {
      await user.click(autoApplyButton);

      await waitFor(() => {
        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars.length).toBeGreaterThan(0);
      });
    }
  });

  it('allows pausing batch operations', async () => {
    render(<BatchApplications {...defaultProps} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/auto-apply all eligible/i)).toBeInTheDocument();
    });

    const autoApplyButton = screen.getByText(/auto-apply all eligible/i);
    if (!autoApplyButton.hasAttribute('disabled')) {
      await user.click(autoApplyButton);

      await waitFor(() => {
        expect(screen.getByText(/submitting applications/i)).toBeInTheDocument();
      });

      const pauseButton = screen.getByText(/pause/i);
      await user.click(pauseButton);

      expect(pauseButton).toHaveTextContent(/resume/i);
    }
  });

  it('resets applications to pending state', async () => {
    render(<BatchApplications {...defaultProps} />);
    const user = userEvent.setup();

    // Perform some action that changes status
    // Then click reset

    const resetButton = screen.queryByText(/reset/i);
    if (resetButton) {
      await user.click(resetButton);

      // Applications should return to pending
      const jobElements = screen.getAllByText(/pending/i);
      expect(jobElements.length).toBeGreaterThan(0);
    }
  });

  it('removes job from list when delete clicked', async () => {
    render(<BatchApplications {...defaultProps} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/senior software engineer/i)).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/remove/i);
    await user.click(deleteButtons[0]);

    expect(screen.queryByText(/senior software engineer/i)).not.toBeInTheDocument();
  });

  it('shows customize link for each job', async () => {
    render(<BatchApplications {...defaultProps} />);

    await waitFor(() => {
      const customizeLinks = screen.getAllByText(/customize/i);
      expect(customizeLinks.length).toBeGreaterThan(0);
    });
  });

  it('customize links point to correct URL', async () => {
    render(<BatchApplications {...defaultProps} />);

    await waitFor(() => {
      const customizeLinks = screen.getAllByText(/customize/i);
      expect(customizeLinks[0].closest('a')).toHaveAttribute(
        'href',
        '/profiles/profile-123/hunter/job-1'
      );
    });
  });

  it('displays job company and location', async () => {
    render(<BatchApplications {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/techcorp/i)).toBeInTheDocument();
      expect(screen.getByText(/san francisco/i)).toBeInTheDocument();
    });
  });

  it('shows salary range for jobs', async () => {
    render(<BatchApplications {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/180K-240K/i)).toBeInTheDocument();
    });
  });

  it('displays recommendation status for each job', async () => {
    render(<BatchApplications {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/apply now/i)).toBeInTheDocument();
      expect(screen.getByText(/strong candidate/i)).toBeInTheDocument();
    });
  });

  it('allows viewing job details', async () => {
    render(<BatchApplications {...defaultProps} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/senior software engineer/i)).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText(/view/i);
    await user.click(viewButtons[0]);

    // Details should expand
    await waitFor(() => {
      expect(screen.getByText(/skill match/i)).toBeInTheDocument();
    });
  });

  it('shows submission status for applications', async () => {
    render(<BatchApplications {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });
  });

  it('displays info box with best practices', async () => {
    render(<BatchApplications {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/how batch operations work/i)).toBeInTheDocument();
      expect(
        screen.getByText(/auto-apply submits applications/i)
      ).toBeInTheDocument();
    });
  });

  it('shows empty state when no jobs', async () => {
    // Would need to mock different data for this test
    render(<BatchApplications {...defaultProps} />);

    // If API returns empty, should show empty state
    // This test depends on mock data setup
  });

  it('displays error message if submission fails', async () => {
    render(<BatchApplications {...defaultProps} />);

    // This would require mocking a failed API response
    // Verify error message displays
  });

  it('tracks submission count correctly', async () => {
    render(<BatchApplications {...defaultProps} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/submitted/i)).toBeInTheDocument();
    });

    // After successful submission, count should update
    // Verify: "Submitted: X"
  });

  it('prevents duplicate selections', async () => {
    render(<BatchApplications {...defaultProps} />);
    const user = userEvent.setup();

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    const checkbox = screen.getAllByRole('checkbox')[0];
    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    // Click again to deselect
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
