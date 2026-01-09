/**
 * useScaenae Hook
 * 
 * Manages scaenae (theatrical stages/contexts) including:
 * - Canonical scaenae (6 immutable stages)
 * - Custom scaenae creation/management
 */

import { useEffect, useState, useCallback } from 'react';
import type { Scaena } from '@in-midst-my-life/schema';

interface ScaenaeTaxonomy {
  canonical_scaenae: string[];
  custom_scaenae: string[];
}

interface UseScaenaeReturn {
  scaenae: Scaena[];
  canonicalScaenae: Scaena[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export function useScaenae(): UseScaenaeReturn {
  const [scaenae, setScaenae] = useState<Scaena[]>([]);
  const [canonicalScaenae, setCanonicalScaenae] = useState<Scaena[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScaenae = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/taxonomy/scaenae`);
      if (!res.ok) throw new Error('Failed to fetch scaenae');

      const data = await res.json();
      const allScaenae = data.data?.scaenae ?? [];
      
      setScaenae(allScaenae);
      setCanonicalScaenae(allScaenae.filter((s: Scaena) => s.metadata?.canonical === true));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchScaenae();
  }, [fetchScaenae]);

  return {
    scaenae,
    canonicalScaenae,
    loading,
    error,
    refetch: fetchScaenae,
  };
}
