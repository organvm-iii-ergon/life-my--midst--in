'use client';

import { useEffect, useState } from 'react';
import { getSubscription, cancelSubscription } from '@/lib/api-client';
import { NeoCard } from '@in-midst-my-life/design-system';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profileId } = useAuth();

  useEffect(() => {
    if (profileId) void fetchSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  async function fetchSubscription() {
    if (!profileId) return;
    try {
      const response = await getSubscription(profileId);
      if (!response.ok) {
        throw new Error(response.message || 'Failed to fetch subscription');
      }
      setSubscription(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setCancelLoading(true);
    try {
      if (!profileId) return;
      const response = await cancelSubscription(profileId, true); // Cancel at period end
      if (!response.ok) {
        throw new Error(response.message || 'Failed to cancel subscription');
      }

      alert(response.message);
      await fetchSubscription(); // Refresh subscription data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCancelLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
        <p>Loading subscription...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
        <NeoCard variant="obsidian" className="max-w-md w-full p-8 border-red-900 text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white underline"
          >
            Back to Dashboard
          </button>
        </NeoCard>
      </div>
    );
  }

  const isFree = subscription?.tier === 'FREE';

  return (
    <main className="min-h-screen bg-black text-white p-6 sm:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-500 hover:text-cyan-400 transition-colors mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold">Manage Subscription</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <NeoCard variant="obsidian" className="p-8">
              <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-6">
                Current Plan
              </h2>
              <div className="mb-8">
                <span className="text-3xl font-bold text-white">{subscription?.tier}</span>
                <span className="ml-2 text-gray-500 text-sm">
                  / {subscription?.billingInterval || 'forever'}
                </span>
              </div>

              <div className="space-y-4 text-sm border-t border-gray-800 pt-6">
                <p className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`font-mono ${subscription?.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}
                  >
                    {subscription?.status}
                  </span>
                </p>
                {subscription?.currentPeriodEnd && (
                  <p className="flex justify-between">
                    <span className="text-gray-500">Next Invoice:</span>
                    <span className="text-white">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
            </NeoCard>

            {!isFree && (
              <div className="bg-red-900/10 border border-red-900/30 p-6 rounded-lg">
                <h3 className="text-red-400 font-bold mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Cancelling your subscription will restrict your account to the Free tier features
                  at the end of your current billing period.
                </p>
                <button
                  onClick={handleCancel}
                  disabled={cancelLoading || subscription?.cancelAtPeriodEnd}
                  className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900 font-bold py-2 px-4 rounded transition-all"
                >
                  {cancelLoading
                    ? 'Cancelling...'
                    : subscription?.cancelAtPeriodEnd
                      ? 'Cancellation Scheduled'
                      : 'Cancel Subscription'}
                </button>
                {subscription?.cancelAtPeriodEnd && (
                  <p className="mt-4 text-xs text-yellow-500 font-mono">
                    Access ends on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {isFree && (
              <button
                onClick={() => router.push('/pricing')}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                Upgrade Now
              </button>
            )}
          </div>

          <div>
            <NeoCard variant="obsidian" className="p-8 h-full">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">
                Plan Entitlements
              </h3>
              <ul className="space-y-4">
                {Object.entries(subscription?.plan?.features || {}).map(
                  ([key, feature]: [string, any]) => (
                    <li key={key} className="border-b border-gray-800 pb-4 last:border-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-cyan-400 font-mono">
                          {feature.limit === -1
                            ? 'Unlimited'
                            : feature.limit === 0
                              ? 'Locked'
                              : feature.limit}
                        </span>
                      </div>
                      {feature.limit > 0 && (
                        <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden mt-2">
                          <div
                            className="bg-cyan-600 h-full transition-all"
                            style={{
                              width: `${Math.min(100, (feature.used / feature.limit) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      )}
                    </li>
                  ),
                )}
              </ul>
            </NeoCard>
          </div>
        </div>
      </div>
    </main>
  );
}
