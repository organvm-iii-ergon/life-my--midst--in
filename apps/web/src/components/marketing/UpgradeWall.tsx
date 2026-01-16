import React from 'react';
import { NeoCard } from '@in-midst-my-life/design-system';

export interface QuotaInfo {
  feature: string;
  used: number;
  limit: number;
  resetDate?: string;
}

export interface UpgradeWallProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  quotaInfo?: QuotaInfo;
  // Legacy props support
  featureName?: string;
  limit?: number;
  resetDate?: string;
}

export function UpgradeWall({
  isOpen,
  onClose,
  onUpgrade,
  quotaInfo,
  featureName,
  limit: legacyLimit,
  resetDate: legacyResetDate,
}: UpgradeWallProps) {
  if (!isOpen) return null;

  const displayFeature = quotaInfo?.feature || featureName || 'feature';
  const displayLimit = quotaInfo?.limit ?? legacyLimit ?? 0;
  const displayUsed = quotaInfo?.used ?? displayLimit;
  const displayReset = quotaInfo?.resetDate || legacyResetDate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <NeoCard variant="cyber" className="max-w-md w-full relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div className="text-center p-6">
          <div className="text-4xl mb-4">🛑</div>
          <h2 className="text-2xl font-bold text-white mb-2">Limit Reached</h2>
          <div className="text-gray-300 mb-6 space-y-2">
            <p>Your Hunter needs more fuel.</p>
            <p className="text-sm bg-black/50 p-3 rounded border border-gray-800">
              Usage: <strong>{displayUsed}</strong> /{' '}
              <strong>{displayLimit === -1 ? '∞' : displayLimit}</strong> {displayFeature}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onUpgrade}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105"
            >
              Unlock Unlimited Access
            </button>

            {displayReset && (
              <p className="text-xs text-gray-500 mt-4">
                Or wait until limits reset on {displayReset}
              </p>
            )}
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </NeoCard>
    </div>
  );
}
