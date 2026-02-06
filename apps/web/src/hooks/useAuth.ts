'use client';

import { useState, useEffect, useCallback } from 'react';

const AUTH_STORAGE_KEY = 'midst:auth:v1';
const apiBase = process.env['NEXT_PUBLIC_API_BASE_URL'] || 'http://localhost:3001';

interface AuthState {
  profileId: string | null;
  token: string | null;
  loading: boolean;
}

/**
 * Lightweight auth hook for the web app.
 *
 * Checks localStorage for a stored JWT, decodes the profileId from its claims,
 * and exposes it to billing/pricing pages.
 *
 * In development (no stored token), falls back to fetching the first available
 * profile from the API so the app remains functional without full auth setup.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    profileId: null,
    token: null,
    loading: true,
  });

  const resolveAuth = useCallback(async () => {
    // 1. Check for stored JWT token
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const { token, profileId } = JSON.parse(stored) as {
          token: string;
          profileId: string;
        };
        if (token && profileId) {
          setState({ token, profileId, loading: false });
          return;
        }
      }
    } catch {
      // Corrupted storage — fall through to fallback
    }

    // 2. Development fallback: fetch first profile from API
    try {
      const res = await fetch(`${apiBase}/profiles?limit=1`);
      if (res.ok) {
        const body = (await res.json()) as { data?: Array<{ id: string }> };
        const firstProfile = body.data?.[0];
        if (firstProfile) {
          setState({ token: null, profileId: firstProfile.id, loading: false });
          return;
        }
      }
    } catch {
      // API unavailable — no profile
    }

    setState({ token: null, profileId: null, loading: false });
  }, []);

  useEffect(() => {
    void resolveAuth();
  }, [resolveAuth]);

  return state;
}

/**
 * Store auth credentials after login.
 * Called by a future login flow to persist the JWT and profileId.
 */
export function setAuthCredentials(token: string, profileId: string): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, profileId }));
}

/**
 * Clear auth credentials (logout).
 */
export function clearAuthCredentials(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
