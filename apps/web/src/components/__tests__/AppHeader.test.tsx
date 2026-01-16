import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppHeader from '../AppHeader';
import type { TabulaPersonarumEntry } from '@in-midst-my-life/schema';

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
  {
    id: 'persona-2',
    nomen: 'Artifex',
    everyday_name: 'Artist',
    role_vector: 'Creates',
    tone_register: 'Expressive',
    visibility_scope: ['Artistica'],
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

describe('AppHeader', () => {
  const mockOnNavigate = vi.fn();
  const mockOnPersonaChange = vi.fn();

  beforeEach(() => {
    mockOnNavigate.mockClear();
    mockOnPersonaChange.mockClear();
  });

  it('displays branding and profile name', () => {
    render(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/in-midst|life|profile/i)).toBeInTheDocument();
  });

  it('shows navigation links', () => {
    render(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /resumes?/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /narrative/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /interview/i })).toBeInTheDocument();
  });

  it('displays current persona in context button', () => {
    render(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    // Current persona should be displayed
    expect(screen.getByText('Archimago')).toBeInTheDocument();
    expect(screen.getByText('Engineer')).toBeInTheDocument();
  });

  it('opens persona selector dropdown on click', async () => {
    const user = userEvent.setup();

    render(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    // Click persona context button
    const personaButton = screen.getByRole('button', { name: /archimago|engineer/i });
    await user.click(personaButton);

    // Should show dropdown with all personas
    expect(screen.getByText('Artifex')).toBeInTheDocument();
    expect(screen.getByText('Artist')).toBeInTheDocument();
  });

  it('lists all personas in dropdown with nomen and everyday_name', async () => {
    const user = userEvent.setup();

    render(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    // Open dropdown
    const personaButton = screen.getByRole('button', { name: /archimago|engineer/i });
    await user.click(personaButton);

    // Check for both personas in dropdown
    const dropdownItems = screen.getAllByRole('menuitem');
    expect(dropdownItems.length).toBeGreaterThanOrEqual(2);

    // Both personas should be visible
    expect(screen.getByText('Archimago')).toBeInTheDocument();
    expect(screen.getByText('Engineer')).toBeInTheDocument();
    expect(screen.getByText('Artifex')).toBeInTheDocument();
    expect(screen.getByText('Artist')).toBeInTheDocument();
  });

  it('calls onPersonaChange when persona is selected', async () => {
    const user = userEvent.setup();

    render(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    // Open dropdown
    const personaButton = screen.getByRole('button', { name: /archimago|engineer/i });
    await user.click(personaButton);

    // Click on second persona
    const artifexOption = screen.getByRole('menuitem', { name: /artifex|artist/i });
    await user.click(artifexOption);

    expect(mockOnPersonaChange).toHaveBeenCalledWith('persona-2');
  });

  it('highlights currently selected persona in dropdown', async () => {
    const user = userEvent.setup();

    render(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    // Open dropdown
    const personaButton = screen.getByRole('button', { name: /archimago|engineer/i });
    await user.click(personaButton);

    // Selected persona should be highlighted
    const archImageOption = screen.getByRole('menuitem', {
      name: /archimago|engineer/i,
    });
    expect(archImageOption).toHaveClass('selected');
  });

  it('displays persona role vectors in dropdown', async () => {
    const user = userEvent.setup();

    render(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    // Open dropdown
    const personaButton = screen.getByRole('button', { name: /archimago|engineer/i });
    await user.click(personaButton);

    // Role vectors should be visible
    expect(screen.getByText('Builds systems')).toBeInTheDocument();
    expect(screen.getByText('Creates')).toBeInTheDocument();
  });

  it('allows navigation to Profile page', async () => {
    const user = userEvent.setup();

    render(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    const profileLink = screen.getByRole('link', { name: /profile/i });
    await user.click(profileLink);

    expect(mockOnNavigate).toHaveBeenCalledWith('profile');
  });

  it('allows navigation to Resumes page', async () => {
    const user = userEvent.setup();

    render(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    const resumesLink = screen.getByRole('link', { name: /resumes?/i });
    await user.click(resumesLink);

    expect(mockOnNavigate).toHaveBeenCalledWith('resumes');
  });

  it('allows navigation to Narrative page', async () => {
    const user = userEvent.setup();

    render(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    const narrativeLink = screen.getByRole('link', { name: /narrative/i });
    await user.click(narrativeLink);

    expect(mockOnNavigate).toHaveBeenCalledWith('narrative');
  });

  it('allows navigation to Interview page', async () => {
    const user = userEvent.setup();

    render(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    const interviewLink = screen.getByRole('link', { name: /interview/i });
    await user.click(interviewLink);

    expect(mockOnNavigate).toHaveBeenCalledWith('interview');
  });

  it('is sticky and stays visible while scrolling', () => {
    const { container } = render(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    const header = container.firstChild;
    expect(header).toHaveClass('sticky');
  });

  it('has color-coded styling for current persona', () => {
    const { container } = render(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    // Should have color-coded styling
    const personaContext = container.querySelector("[data-persona-id='persona-1']");
    expect(personaContext).toHaveClass('color-coded');
  });

  it('shows hover effects on navigation links', async () => {
    const user = userEvent.setup();

    render(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    const profileLink = screen.getByRole('link', { name: /profile/i });

    // Hover over link
    await user.hover(profileLink);

    expect(profileLink).toHaveClass('hover');
  });

  it('handles missing profile name gracefully', () => {
    render(
      <AppHeader
        profileName=""
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    // Should still display header
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays smooth transitions between persona changes', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-1"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    expect(screen.getByText('Archimago')).toBeInTheDocument();

    // Update to second persona
    rerender(
      <AppHeader
        profileName="John Doe"
        personas={mockPersonas}
        selectedPersonaId="persona-2"
        onNavigate={mockOnNavigate}
        onPersonaChange={mockOnPersonaChange}
      />,
    );

    // Should show new persona with transition
    expect(screen.getByText('Artifex')).toBeInTheDocument();
  });
});
