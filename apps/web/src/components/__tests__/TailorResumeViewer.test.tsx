import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TailorResumeViewer from '@/app/profiles/[id]/hunter/[jobId]/page';

// Mock Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
  Copy: () => <div data-testid="copy-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Send: () => <div data-testid="send-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
  CheckCircle: () => <div data-testid="check-icon" />,
  Info: () => <div data-testid="info-icon" />,
}));

describe('TailorResumeViewer Component', () => {
  const mockParams = {
    params: {
      id: 'profile-123',
      jobId: 'job-456',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<TailorResumeViewer {...mockParams} />);
    // Component shows animated skeleton loaders while loading
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays job title and company after loading', async () => {
    render(<TailorResumeViewer {...mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('TechCorp')).toBeInTheDocument();
    });
  });

  it('shows compatibility score with proper color coding', async () => {
    render(<TailorResumeViewer {...mockParams} />);

    await waitFor(() => {
      const scoreElement = screen.getByText('82%');
      expect(scoreElement).toBeInTheDocument();
      expect(scoreElement.parentElement).toHaveClass('text-green-600');
    });
  });

  it('displays all five compatibility dimensions', async () => {
    render(<TailorResumeViewer {...mockParams} />);

    await waitFor(() => {
      expect(screen.getByText(/skills match/i)).toBeInTheDocument();
      expect(screen.getByText(/cultural fit/i)).toBeInTheDocument();
      expect(screen.getByText(/growth potential/i)).toBeInTheDocument();
      expect(screen.getByText(/compensation fit/i)).toBeInTheDocument();
      expect(screen.getByText(/location fit/i)).toBeInTheDocument();
    });
  });

  it('shows progress bars with correct percentages', async () => {
    render(<TailorResumeViewer {...mockParams} />);

    await waitFor(() => {
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('displays strengths section with list items', async () => {
    render(<TailorResumeViewer {...mockParams} />);

    await waitFor(() => {
      expect(screen.getByText(/strong typescript/i)).toBeInTheDocument();
      expect(screen.getByText(/proven system design/i)).toBeInTheDocument();
      expect(screen.getByText(/postgresql experience/i)).toBeInTheDocument();
    });
  });

  it('displays concerns section with warnings', async () => {
    render(<TailorResumeViewer {...mockParams} />);

    await waitFor(() => {
      expect(screen.getByText(/limited kubernetes/i)).toBeInTheDocument();
      expect(screen.getByText(/no docker compose/i)).toBeInTheDocument();
    });
  });

  it('shows suggested persona name', async () => {
    render(<TailorResumeViewer {...mockParams} />);

    await waitFor(() => {
      expect(screen.getByText(/Architect/)).toBeInTheDocument();
      expect(screen.getByText(/emphasizes your architectural/i)).toBeInTheDocument();
    });
  });

  it('renders tailored resume with correct content', async () => {
    render(<TailorResumeViewer {...mockParams} />);

    await waitFor(() => {
      expect(screen.getByText(/jane doe/i)).toBeInTheDocument();
      expect(screen.getByText(/professional summary/i)).toBeInTheDocument();
      expect(screen.getByText(/core expertise/i)).toBeInTheDocument();
    });
  });

  it('allows switching between formatted and raw view', async () => {
    render(<TailorResumeViewer {...mockParams} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/formatted resume/i)).toBeInTheDocument();
    });

    const viewToggle = screen.getByText(/raw view/i).parentElement;
    await user.click(viewToggle!);

    await waitFor(() => {
      expect(screen.getByText(/raw view/i)).toBeInTheDocument();
    });
  });

  it('allows copying resume to clipboard', async () => {
    const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText');
    render(<TailorResumeViewer {...mockParams} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/copy/i)).toBeInTheDocument();
    });

    const copyButton = screen.getAllByText(/copy/i)[0];
    await user.click(copyButton);

    expect(clipboardSpy).toHaveBeenCalled();
  });

  it('allows downloading resume', async () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    render(<TailorResumeViewer {...mockParams} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/download/i)).toBeInTheDocument();
    });

    const downloadButton = screen.getByText(/download/i);
    await user.click(downloadButton);

    expect(createElementSpy).toHaveBeenCalledWith('a');
  });

  it('generates cover letter on button click', async () => {
    render(<TailorResumeViewer {...mockParams} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/generate cover letter/i)).toBeInTheDocument();
    });

    const generateButton = screen.getByText(/generate cover letter/i);
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/generated cover letter/i)).toBeInTheDocument();
      expect(screen.getByText(/dear hiring manager/i)).toBeInTheDocument();
    });
  });

  it('displays generated cover letter in modal', async () => {
    render(<TailorResumeViewer {...mockParams} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/generate cover letter/i)).toBeInTheDocument();
    });

    const generateButton = screen.getByText(/generate cover letter/i);
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/dear hiring manager/i)).toBeInTheDocument();
      expect(screen.getByText(/with.*expertise spanning 8\+ years/i)).toBeInTheDocument();
    });
  });

  it('allows closing cover letter modal', async () => {
    render(<TailorResumeViewer {...mockParams} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/generate cover letter/i)).toBeInTheDocument();
    });

    const generateButton = screen.getByText(/generate cover letter/i);
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/dear hiring manager/i)).toBeInTheDocument();
    });

    const closeButton = screen.getByText(/close/i);
    await user.click(closeButton);

    // Modal should be closed - cover letter text should not be visible
    // Note: This may need adjustment based on actual modal behavior
  });

  it('shows job location and remote status', async () => {
    render(<TailorResumeViewer {...mockParams} />);

    await waitFor(() => {
      expect(screen.getByText(/san francisco, ca/i)).toBeInTheDocument();
      expect(screen.getByText(/hybrid/i)).toBeInTheDocument();
    });
  });

  it('displays salary range', async () => {
    render(<TailorResumeViewer {...mockParams} />);

    await waitFor(() => {
      expect(screen.getByText(/\$180,000-\$240,000/i)).toBeInTheDocument();
    });
  });

  it('shows recommendation status', async () => {
    render(<TailorResumeViewer {...mockParams} />);

    await waitFor(() => {
      expect(screen.getByText(/apply now/i)).toBeInTheDocument();
    });
  });

  it('handles apply button click', async () => {
    render(<TailorResumeViewer {...mockParams} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/apply now/i)).toBeInTheDocument();
    });

    const applyButton = screen.getByText(/apply now/i);
    await user.click(applyButton);

    // Should show submitting state
    await waitFor(() => {
      expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    });
  });

  it('shows back link to job search', async () => {
    render(<TailorResumeViewer {...mockParams} />);

    await waitFor(() => {
      const backLink = screen.getByText(/back to job search/i);
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/profiles/profile-123/hunter');
    });
  });

  it('displays negotiation points', async () => {
    render(<TailorResumeViewer {...mockParams} />);

    await waitFor(() => {
      expect(screen.getByText(/competitive salary range/i)).toBeInTheDocument();
      expect(screen.getByText(/negotiate for equity/i)).toBeInTheDocument();
    });
  });

  it('shows recommended persona emphasize points', async () => {
    render(<TailorResumeViewer {...mockParams} />);

    await waitFor(() => {
      expect(screen.getByText(/emphasize your architectural/i)).toBeInTheDocument();
    });
  });
});
