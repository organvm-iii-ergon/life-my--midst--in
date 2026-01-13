import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MaskSelector } from '../src/components/MaskSelector';

describe('MaskSelector', () => {
  it('renders all mask options', () => {
    render(<MaskSelector value="analyst" onChange={() => {}} />);
    
    expect(screen.getByText('Analyst')).toBeInTheDocument();
    expect(screen.getByText('Artisan')).toBeInTheDocument();
    expect(screen.getByText('Architect')).toBeInTheDocument();
    expect(screen.getByText('Strategist')).toBeInTheDocument();
  });

  it('calls onChange when a mask is clicked', () => {
    const handleChange = vi.fn();
    render(<MaskSelector value="analyst" onChange={handleChange} />);
    
    const artisanButton = screen.getByText('Artisan').closest('.stat-card');
    if (artisanButton) {
      fireEvent.click(artisanButton);
    }
    
    expect(handleChange).toHaveBeenCalledWith('artisan');
  });

  it('highlights the selected mask', () => {
    const { container } = render(<MaskSelector value="architect" onChange={() => {}} />);
    
    // Check if Architect card has the active class or styles
    const architectCard = screen.getByText('Architect').closest('.stat-card');
    expect(architectCard).toHaveClass('active');
  });
});
