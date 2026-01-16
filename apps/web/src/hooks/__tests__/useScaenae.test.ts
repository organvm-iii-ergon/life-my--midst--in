import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useScaenae } from '../useScaenae';
import type { Scaena } from '@in-midst-my-life/schema';

global.fetch = vi.fn();

const mockCanonicalScaenae: Scaena[] = [
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
  {
    id: 'scaena-2',
    nomen: 'Artistica',
    emoji: '🎨',
    description: 'Artistic stage',
    immutable: true,
    canonical: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

describe('useScaenae', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with loading state', () => {
    (global.fetch as any).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    const { result } = renderHook(() => useScaenae());

    expect(result.current.loading).toBe(true);
    expect(result.current.canonicalScaenae).toEqual([]);
    expect(result.current.customScaenae).toEqual([]);
  });

  it('fetches canonical scaenae (6 immutable stages)', async () => {
    const sixCanonical = Array.from({ length: 6 }, (_, i) => ({
      ...mockCanonicalScaenae[0],
      id: `scaena-${i}`,
      nomen: ['Technica', 'Academica', 'Artistica', 'Civica', 'Domestica', 'Occulta'][i],
    }));

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/taxonomy/scaenae')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ scaenae: sixCanonical }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useScaenae());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.canonicalScaenae).toHaveLength(6);
  });

  it('separates canonical (immutable) from custom scaenae', async () => {
    const mixedScaenae = [
      ...mockCanonicalScaenae,
      {
        id: 'scaena-custom-1',
        nomen: 'Custom',
        emoji: '🎭',
        description: 'Custom stage',
        immutable: false,
        canonical: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/taxonomy/scaenae')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ scaenae: mixedScaenae }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useScaenae());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.canonicalScaenae).toHaveLength(2);
    expect(result.current.customScaenae).toHaveLength(1);
  });

  it('never allows deletion of canonical scaenae', async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/taxonomy/scaenae')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ scaenae: mockCanonicalScaenae }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useScaenae());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Try to delete canonical scaena
    const canDelete = result.current.canDeleteScaena('scaena-1');
    expect(canDelete).toBe(false);
  });

  it('allows deletion of custom scaenae', async () => {
    const customScaena = {
      id: 'scaena-custom-1',
      nomen: 'Custom',
      emoji: '🎭',
      description: 'Custom stage',
      immutable: false,
      canonical: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/taxonomy/scaenae')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ scaenae: [customScaena] }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useScaenae());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const canDelete = result.current.canDeleteScaena('scaena-custom-1');
    expect(canDelete).toBe(true);
  });

  it('provides scaena emoji lookup', async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/taxonomy/scaenae')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ scaenae: mockCanonicalScaenae }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useScaenae());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const emoji = result.current.getScaenaEmoji('scaena-1');
    expect(emoji).toBe('⚙️');
  });

  it('provides scaena label lookup', async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/taxonomy/scaenae')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ scaenae: mockCanonicalScaenae }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useScaenae());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const label = result.current.getScaenaLabel('scaena-1');
    expect(label).toBe('Technica');
  });

  it('provides function to create custom scaenae', async () => {
    (global.fetch as any).mockImplementation((url: string, options: any) => {
      if (url.includes('/taxonomy/scaenae') && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 'scaena-custom-1',
            nomen: 'Workshop',
            emoji: '🏗️',
            description: 'Workshop stage',
            immutable: false,
            canonical: false,
            created_at: new Date(),
            updated_at: new Date(),
          }),
        });
      }
      if (url.includes('/taxonomy/scaenae')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ scaenae: mockCanonicalScaenae }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useScaenae());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const created = await result.current.createCustomScaena({
      nomen: 'Workshop',
      emoji: '🏗️',
      description: 'Workshop stage',
    });

    expect(created).toBeDefined();
    expect(created?.nomen).toBe('Workshop');
  });

  it('provides function to delete custom scaenae', async () => {
    (global.fetch as any).mockImplementation((url: string, options: any) => {
      if (url.includes('/taxonomy/scaenae/scaena-custom-1') && options.method === 'DELETE') {
        return Promise.resolve({ ok: true });
      }
      if (url.includes('/taxonomy/scaenae')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ scaenae: mockCanonicalScaenae }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useScaenae());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const deleted = await result.current.deleteCustomScaena('scaena-custom-1');
    expect(deleted).toBe(true);
  });

  it('handles fetch errors gracefully', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useScaenae());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.canonicalScaenae).toHaveLength(0);
  });

  it('provides getAll function combining canonical and custom', async () => {
    const mixedScaenae = [
      ...mockCanonicalScaenae,
      {
        id: 'scaena-custom-1',
        nomen: 'Custom',
        emoji: '🎭',
        description: 'Custom',
        immutable: false,
        canonical: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/taxonomy/scaenae')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ scaenae: mixedScaenae }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useScaenae());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const all = result.current.getAllScaenae();
    expect(all).toHaveLength(3);
  });

  it('separates canonical 6 immutable stages correctly', async () => {
    const canonicalByType = {
      Technica: '⚙️',
      Academica: '🎓',
      Artistica: '🎨',
      Civica: '🏛️',
      Domestica: '🏠',
      Occulta: '🔮',
    };

    const sixCanonical = Object.entries(canonicalByType).map(([nomen, emoji]) => ({
      id: `scaena-${nomen}`,
      nomen,
      emoji,
      description: `${nomen} stage`,
      immutable: true,
      canonical: true,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/taxonomy/scaenae')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ scaenae: sixCanonical }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useScaenae());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.canonicalScaenae).toHaveLength(6);
    expect(result.current.canonicalScaenae[0].immutable).toBe(true);
  });
});
