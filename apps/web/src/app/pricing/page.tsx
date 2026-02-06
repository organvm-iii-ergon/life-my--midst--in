'use client';

import React, { useState } from 'react';
import { PricingCard } from '@/components/marketing/PricingCard';
import { createCheckoutSession } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { profileId } = useAuth();

  const handleUpgrade = async (
    tier: 'PRO' | 'ENTERPRISE',
    interval: 'monthly' | 'yearly' = 'monthly',
  ) => {
    if (!profileId) {
      setError('No profile found. Please create a profile first.');
      return;
    }
    setLoading(`${tier}-${interval}`);
    setError(null);

    try {
      const response = await createCheckoutSession(profileId, {
        tier,
        billingInterval: interval,
        successUrl: `${window.location.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/billing/cancel`,
      });

      if (!response.ok) {
        throw new Error(response.message || 'Failed to create checkout session');
      }

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(null);
    }
  };

  return (
    <div className="page">
      <div
        className="section"
        style={{ textAlign: 'center', maxWidth: '48rem', margin: '0 auto 3rem' }}
      >
        <div className="label" style={{ marginBottom: '0.5rem' }}>
          Plans &amp; Pricing
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 700,
            margin: '0 0 1rem',
          }}
        >
          Invest in your professional identity
        </h1>
        <p className="section-subtitle" style={{ fontSize: '1.1rem' }}>
          Gate the automation, not your data. Choose the plan that fits how you want to present
          yourself to the world.
        </p>
      </div>

      {error && (
        <div
          style={{
            maxWidth: '28rem',
            margin: '0 auto 2rem',
            background: 'rgba(220, 60, 60, 0.1)',
            border: '1px solid rgba(220, 60, 60, 0.3)',
            color: '#b91c1c',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.9rem' }}>{error}</p>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              fontSize: '1.1rem',
            }}
          >
            &times;
          </button>
        </div>
      )}

      <div
        className="grid three"
        style={{ maxWidth: '72rem', margin: '0 auto', alignItems: 'stretch' }}
      >
        <PricingCard
          tier="FREE"
          name="The Explorer"
          price="$0"
          description="Perfect for casual browsing and organising your identity."
          features={[
            '5 AI Job Searches / month',
            '3 Identity Masks',
            'Basic Resume Builder',
            'Manual Applications',
            '7-day Data Retention',
          ]}
          isCurrent={true}
          onSelect={() => {}}
          loading={loading === 'FREE-monthly'}
        />

        <PricingCard
          tier="PRO"
          name="The Hunter"
          price="$29"
          description="For serious job seekers who value their time."
          features={[
            'Unlimited AI Job Searches',
            '16 Identity Masks',
            '1 Autonomous Auto-Apply Agent',
            'Advanced Resume Tailoring',
            'Priority Processing',
            'Unlimited Data Retention',
          ]}
          isCurrent={false}
          isPopular={true}
          loading={loading === 'PRO-monthly'}
          onSelect={() => handleUpgrade('PRO', 'monthly')}
        />

        <PricingCard
          tier="ENTERPRISE"
          name="The Architect"
          price="Custom"
          description="For agencies and power users managing multiple profiles."
          features={[
            'Multiple Autonomous Agents',
            'Unlimited Masks',
            'API Access',
            'White-label Reports',
            'Dedicated Account Manager',
            'SLA Support',
          ]}
          isCurrent={false}
          loading={loading === 'ENTERPRISE-monthly'}
          onSelect={() => (window.location.href = 'mailto:sales@in-midst.com')}
        />
      </div>

      {/* FAQ-style info */}
      <div style={{ maxWidth: '40rem', margin: '3rem auto 0' }}>
        <div
          style={{
            background: 'rgba(47, 94, 100, 0.08)',
            border: '1px solid rgba(47, 94, 100, 0.2)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            color: 'var(--ink)',
          }}
        >
          <strong>Your data is always yours.</strong> Every plan includes full data export (JSON-LD,
          Verifiable Credentials). We gate automation features, never your identity data.
        </div>
      </div>
    </div>
  );
}
