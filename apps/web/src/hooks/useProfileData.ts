/**
 * useProfileData Hook
 * 
 * Fetches and manages profile CV data including:
 * - Master curriculum vitae
 * - CV entries with filtering
 * - Profile metadata
 */

import { useEffect, useState, useCallback } from 'react';
import type { CVEntry, Profile } from '@in-midst-my-life/schema';

interface CVFilter {
  includePersonae?: string[];
  excludePersonae?: string[];
  includeAetas?: string[];
  excludeAetas?: string[];
  includeScaenae?: string[];
  excludeScaenae?: string[];
  minPriority?: number;
  includeTags?: string[];
  excludeTags?: string[];
  offset?: number;
  limit?: number;
}

interface CVData {
  entries: CVEntry[];
  total: number;
  offset: number;
  limit: number;
}

interface UseProfileDataReturn {
  profile: Profile | null;
  cv: CVData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  filterEntries: (filter: CVFilter) => Promise<void>;
  addEntry: (entry: Omit<CVEntry, 'id'>) => Promise<CVEntry | null>;
  updateEntry: (id: string, patch: Partial<CVEntry>) => Promise<CVEntry | null>;
  deleteEntry: (id: string) => Promise<boolean>;
}

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export function useProfileData(profileId: string | null): UseProfileDataReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cv, setCV] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    setError(null);
    try {
      const [profileRes, cvRes] = await Promise.all([
        fetch(`${apiBase}/profiles/${profileId}`),
        fetch(`${apiBase}/profiles/${profileId}/cv`),
      ]);

      if (!profileRes.ok || !cvRes.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const profileData = await profileRes.json();
      const cvData = await cvRes.json();

      setProfile(profileData.data ?? null);
      setCV({
        entries: cvData.data?.entries ?? [],
        total: cvData.total ?? 0,
        offset: cvData.offset ?? 0,
        limit: cvData.limit ?? 50,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const filterEntries = useCallback(
    async (filter: CVFilter) => {
      if (!profileId) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filter.includePersonae)
          params.append('includePersonae', JSON.stringify(filter.includePersonae));
        if (filter.excludePersonae)
          params.append('excludePersonae', JSON.stringify(filter.excludePersonae));
        if (filter.includeAetas)
          params.append('includeAetas', JSON.stringify(filter.includeAetas));
        if (filter.excludeAetas)
          params.append('excludeAetas', JSON.stringify(filter.excludeAetas));
        if (filter.includeScaenae)
          params.append('includeScaenae', JSON.stringify(filter.includeScaenae));
        if (filter.excludeScaenae)
          params.append('excludeScaenae', JSON.stringify(filter.excludeScaenae));
        if (filter.minPriority !== undefined)
          params.append('minPriority', filter.minPriority.toString());
        if (filter.includeTags)
          params.append('includeTags', JSON.stringify(filter.includeTags));
        if (filter.excludeTags)
          params.append('excludeTags', JSON.stringify(filter.excludeTags));
        params.append('offset', (filter.offset ?? 0).toString());
        params.append('limit', (filter.limit ?? 50).toString());

        const res = await fetch(
          `${apiBase}/profiles/${profileId}/cv/entries?${params.toString()}`
        );
        if (!res.ok) throw new Error('Failed to filter entries');

        const data = await res.json();
        setCV({
          entries: data.data ?? [],
          total: data.total ?? 0,
          offset: data.offset ?? 0,
          limit: data.limit ?? 50,
        });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [profileId]
  );

  const addEntry = useCallback(
    async (entry: Omit<CVEntry, 'id'>) => {
      if (!profileId) return null;
      try {
        const res = await fetch(`${apiBase}/profiles/${profileId}/cv/entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
        if (!res.ok) throw new Error('Failed to add entry');

        const data = await res.json();
        void fetchProfile();
        return data.data ?? null;
      } catch (err) {
        setError((err as Error).message);
        return null;
      }
    },
    [profileId, fetchProfile]
  );

  const updateEntry = useCallback(
    async (id: string, patch: Partial<CVEntry>) => {
      if (!profileId) return null;
      try {
        const res = await fetch(`${apiBase}/profiles/${profileId}/cv/entries/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error('Failed to update entry');

        const data = await res.json();
        void fetchProfile();
        return data.data ?? null;
      } catch (err) {
        setError((err as Error).message);
        return null;
      }
    },
    [profileId, fetchProfile]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      if (!profileId) return false;
      try {
        const res = await fetch(`${apiBase}/profiles/${profileId}/cv/entries/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete entry');
        void fetchProfile();
        return true;
      } catch (err) {
        setError((err as Error).message);
        return false;
      }
    },
    [profileId, fetchProfile]
  );

  return {
    profile,
    cv,
    loading,
    error,
    refetch: fetchProfile,
    filterEntries,
    addEntry,
    updateEntry,
    deleteEntry,
  };
}
