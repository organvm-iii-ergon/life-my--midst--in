/**
 * useNarratives Hook
 * 
 * Manages narrative blocks with theatrical metadata including:
 * - Generate narratives for a persona
 * - Fetch narrative blocks with theatrical framing
 * - Update/save narrative modifications
 */

import { useEffect, useState, useCallback } from 'react';
import type { NarrativeBlock } from '@in-midst-my-life/schema';

interface NarrativeResponse {
  ok: boolean;
  mask?: { id: string; everyday_name: string };
  theatrical_preamble?: string;
  authentic_disclaimer?: string;
  blocks?: NarrativeBlock[];
  block_count?: number;
}

interface UseNarrativesReturn {
  blocks: NarrativeBlock[];
  mask: { id: string; everyday_name: string } | null;
  theatricalPreamble: string | null;
  authenticDisclaimer: string | null;
  loading: boolean;
  error: string | null;
  generateForMask: (maskId: string) => Promise<void>;
  updateBlock: (blockId: string, patch: Partial<NarrativeBlock>) => Promise<void>;
  saveNarratives: (
    updatedBlocks: NarrativeBlock[],
    preamble?: string,
    disclaimer?: string
  ) => Promise<void>;
  clear: () => void;
}

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export function useNarratives(profileId: string | null): UseNarrativesReturn {
  const [blocks, setBlocks] = useState<NarrativeBlock[]>([]);
  const [mask, setMask] = useState<{ id: string; everyday_name: string } | null>(null);
  const [theatricalPreamble, setTheatricalPreamble] = useState<string | null>(null);
  const [authenticDisclaimer, setAuthenticDisclaimer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateForMask = useCallback(
    async (maskId: string) => {
      if (!profileId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${apiBase}/profiles/${profileId}/narrative/${maskId}`
        );
        if (!res.ok) throw new Error('Failed to generate narrative');

        const data: NarrativeResponse = await res.json();
        if (data.ok) {
          setMask(data.mask ?? null);
          setBlocks(data.blocks ?? []);
          setTheatricalPreamble(data.theatrical_preamble ?? null);
          setAuthenticDisclaimer(data.authentic_disclaimer ?? null);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [profileId]
  );

  const updateBlock = useCallback((blockId: string, patch: Partial<NarrativeBlock>) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? {
              ...block,
              ...patch,
              theatrical_metadata: {
                ...block.theatrical_metadata,
                ...(patch.theatrical_metadata ?? {}),
              },
            }
          : block
      )
    );
  }, []);

  const saveNarratives = useCallback(
    async (
      updatedBlocks: NarrativeBlock[],
      preamble?: string,
      disclaimer?: string
    ) => {
      if (!profileId || !mask) return;
      setLoading(true);
      try {
        const res = await fetch(
          `${apiBase}/profiles/${profileId}/narrative/${mask.id}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              blocks: updatedBlocks,
              maskId: mask.id,
              customPreamble: preamble,
              customDisclaimer: disclaimer,
            }),
          }
        );
        if (!res.ok) throw new Error('Failed to save narrative');

        // Update local state
        setBlocks(updatedBlocks);
        if (preamble) setTheatricalPreamble(preamble);
        if (disclaimer) setAuthenticDisclaimer(disclaimer);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [profileId, mask]
  );

  const clear = useCallback(() => {
    setBlocks([]);
    setMask(null);
    setTheatricalPreamble(null);
    setAuthenticDisclaimer(null);
    setError(null);
  }, []);

  return {
    blocks,
    mask,
    theatricalPreamble,
    authenticDisclaimer,
    loading,
    error,
    generateForMask,
    updateBlock,
    saveNarratives,
    clear,
  };
}
