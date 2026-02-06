/**
 * useScaenae Hook
 *
 * Manages scaenae (theatrical stages/contexts) including:
 * - Canonical scaenae (6 immutable stages)
 * - Custom scaenae creation/management
 */

import { useEffect, useState, useCallback } from 'react';
import type { Scaena } from '@in-midst-my-life/schema';

/** API response includes convenience fields not in the canonical schema */
interface ScaenaResponse extends Scaena {
  canonical?: boolean;
  immutable?: boolean;
  emoji?: string;
  nomen?: string;
}

interface UseScaenaeReturn {
  scaenae: Scaena[];
  canonicalScaenae: Scaena[];
  customScaenae: Scaena[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  canDeleteScaena: (id: string) => boolean;
  getScaenaEmoji: (id: string) => string;
  getScaenaLabel: (id: string) => string;
  createCustomScaena: (data: {
    nomen: string;
    emoji: string;
    description?: string;
  }) => Promise<Scaena | null>;
  deleteCustomScaena: (id: string) => Promise<boolean>;
  getAllScaenae: () => Scaena[];
}

const apiBase = process.env['NEXT_PUBLIC_API_BASE_URL'] || 'http://localhost:3001';

export function useScaenae(): UseScaenaeReturn {
  const [scaenae, setScaenae] = useState<Scaena[]>([]);
  const [canonicalScaenae, setCanonicalScaenae] = useState<Scaena[]>([]);
  const [customScaenae, setCustomScaenae] = useState<Scaena[]>([]);
  const [loading, setLoading] = useState(true); // Start loading since we auto-fetch
  const [error, setError] = useState<string | null>(null);

  const fetchScaenae = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/taxonomy/scaenae`);
      if (!res.ok) throw new Error('Failed to fetch scaenae');

      const data: {
        scaenae?: ScaenaResponse[];
        data?: { scaenae?: ScaenaResponse[] };
      } = await res.json();
      // Handle both response formats: { scaenae: [...] } or { data: { scaenae: [...] } }
      const allScaenae: ScaenaResponse[] = data.scaenae ?? data.data?.scaenae ?? [];

      setScaenae(allScaenae);
      // Canonical scaenae: have canonical=true or metadata.canonical=true, and are immutable
      const canonical = allScaenae.filter(
        (s) => s.canonical === true || s.metadata?.canonical === true || s.immutable === true,
      );
      const custom = allScaenae.filter(
        (s) => !(s.canonical === true || s.metadata?.canonical === true || s.immutable === true),
      );
      setCanonicalScaenae(canonical);
      setCustomScaenae(custom);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchScaenae();
  }, [fetchScaenae]);

  // Check if a scaena can be deleted (only custom ones can be deleted)
  const canDeleteScaena = useCallback(
    (id: string): boolean => {
      const scaena = scaenae.find((s) => s.id === id) as ScaenaResponse | undefined;
      if (!scaena) return false;
      // Cannot delete if canonical or immutable
      const isCanonical = scaena.canonical === true || scaena.metadata?.canonical === true;
      const isImmutable = scaena.immutable === true;
      return !isCanonical && !isImmutable;
    },
    [scaenae],
  );

  // Get emoji for a scaena
  const getScaenaEmoji = useCallback(
    (id: string): string => {
      const scaena = scaenae.find((s) => s.id === id) as ScaenaResponse | undefined;
      if (!scaena) return '';
      return scaena.emoji ?? scaena.metadata?.icon ?? '';
    },
    [scaenae],
  );

  // Get label/name for a scaena
  const getScaenaLabel = useCallback(
    (id: string): string => {
      const scaena = scaenae.find((s) => s.id === id) as ScaenaResponse | undefined;
      if (!scaena) return '';
      return scaena.nomen ?? scaena.name ?? scaena.latin_name ?? '';
    },
    [scaenae],
  );

  // Create a custom scaena
  const createCustomScaena = useCallback(
    async (data: {
      nomen: string;
      emoji: string;
      description?: string;
    }): Promise<Scaena | null> => {
      try {
        const res = await fetch(`${apiBase}/taxonomy/scaenae`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.nomen,
            latin_name: data.nomen,
            description: data.description ?? '',
            metadata: { icon: data.emoji, canonical: false },
          }),
        });
        if (!res.ok) throw new Error('Failed to create scaena');

        const result: { data?: Scaena; scaena?: Scaena } & Partial<Scaena> = await res.json();
        void fetchScaenae();
        return result.data ?? result.scaena ?? (result.id ? (result as Scaena) : null);
      } catch (err) {
        setError((err as Error).message);
        return null;
      }
    },
    [fetchScaenae],
  );

  // Delete a custom scaena
  const deleteCustomScaena = useCallback(
    async (id: string): Promise<boolean> => {
      // Check if this is a known canonical scaena - if so, prevent deletion
      const knownScaena = scaenae.find((s) => s.id === id) as ScaenaResponse | undefined;
      if (knownScaena) {
        const isCanonical =
          knownScaena.canonical === true || knownScaena.metadata?.canonical === true;
        const isImmutable = knownScaena.immutable === true;
        if (isCanonical || isImmutable) return false;
      }
      // If scaena is unknown locally, try to delete anyway (let server decide)
      try {
        const res = await fetch(`${apiBase}/taxonomy/scaenae/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete scaena');
        void fetchScaenae();
        return true;
      } catch (err) {
        setError((err as Error).message);
        return false;
      }
    },
    [scaenae, fetchScaenae],
  );

  // Get all scaenae (canonical + custom)
  const getAllScaenae = useCallback((): Scaena[] => {
    return [...canonicalScaenae, ...customScaenae];
  }, [canonicalScaenae, customScaenae]);

  return {
    scaenae,
    canonicalScaenae,
    customScaenae,
    loading,
    error,
    refetch: fetchScaenae,
    canDeleteScaena,
    getScaenaEmoji,
    getScaenaLabel,
    createCustomScaena,
    deleteCustomScaena,
    getAllScaenae,
  };
}
