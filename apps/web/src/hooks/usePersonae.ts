/**
 * usePersonae Hook
 * 
 * Fetches and manages theatrical personas (masks) including:
 * - List of personas for a profile
 * - Resonance data (fit scores)
 * - Create/update/delete operations
 */

import { useEffect, useState, useCallback } from 'react';
import type { TabulaPersonarumEntry, PersonaResonance } from '@in-midst-my-life/schema';

interface PersonaWithResonance extends TabulaPersonarumEntry {
  resonances?: PersonaResonance[];
}

interface UsePersonaeReturn {
  personas: PersonaWithResonance[];
  selectedPersonaId: string | null;
  loading: boolean;
  error: string | null;
  selectPersona: (personaId: string) => void;
  addPersona: (persona: Omit<TabulaPersonarumEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<TabulaPersonarumEntry | null>;
  updatePersona: (id: string, patch: Partial<TabulaPersonarumEntry>) => Promise<TabulaPersonarumEntry | null>;
  deletePersona: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export function usePersonae(profileId: string | null): UsePersonaeReturn {
  const [personas, setPersonas] = useState<PersonaWithResonance[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonae = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/profiles/${profileId}/personae`);
      if (!res.ok) throw new Error('Failed to fetch personas');

      const data = await res.json();
      const personaeList = data.data?.personas ?? [];
      setPersonas(personaeList);

      // Auto-select first persona if none selected
      if (personaeList.length > 0 && !selectedPersonaId) {
        setSelectedPersonaId(personaeList[0]?.id ?? null);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [profileId, selectedPersonaId]);

  useEffect(() => {
    void fetchPersonae();
  }, [fetchPersonae]);

  const addPersona = useCallback(
    async (persona: Omit<TabulaPersonarumEntry, 'id' | 'created_at' | 'updated_at'>) => {
      if (!profileId) return null;
      try {
        const res = await fetch(`${apiBase}/profiles/${profileId}/personae`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(persona),
        });
        if (!res.ok) throw new Error('Failed to add persona');

        const data = await res.json();
        void fetchPersonae();
        return data.data ?? null;
      } catch (err) {
        setError((err as Error).message);
        return null;
      }
    },
    [profileId, fetchPersonae]
  );

  const updatePersona = useCallback(
    async (id: string, patch: Partial<TabulaPersonarumEntry>) => {
      if (!profileId) return null;
      try {
        const res = await fetch(`${apiBase}/profiles/${profileId}/personae/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error('Failed to update persona');

        const data = await res.json();
        void fetchPersonae();
        return data.data ?? null;
      } catch (err) {
        setError((err as Error).message);
        return null;
      }
    },
    [profileId, fetchPersonae]
  );

  const deletePersona = useCallback(
    async (id: string) => {
      if (!profileId) return false;
      try {
        const res = await fetch(`${apiBase}/profiles/${profileId}/personae/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete persona');
        void fetchPersonae();
        return true;
      } catch (err) {
        setError((err as Error).message);
        return false;
      }
    },
    [profileId, fetchPersonae]
  );

  return {
    personas,
    selectedPersonaId,
    loading,
    error,
    selectPersona: setSelectedPersonaId,
    addPersona,
    updatePersona,
    deletePersona,
    refetch: fetchPersonae,
  };
}
