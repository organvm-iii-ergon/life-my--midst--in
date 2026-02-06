import React from 'react';

export interface PricingCardProps {
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  isCurrent?: boolean;
  isPopular?: boolean;
  onSelect: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function PricingCard({
  tier,
  name,
  price,
  period = '/mo',
  description,
  features,
  isCurrent = false,
  isPopular = false,
  onSelect,
  loading = false,
  disabled = false,
}: PricingCardProps) {
  const isEnterprise = tier === 'ENTERPRISE';

  return (
    <div
      className="stat-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        border: isPopular ? '2px solid var(--accent)' : undefined,
        transform: isPopular ? 'scale(1.03)' : undefined,
        zIndex: isPopular ? 1 : undefined,
      }}
    >
      {isPopular && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--accent)',
            color: 'var(--paper)',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Recommended
        </div>
      )}

      <div style={{ padding: '1.5rem', flexGrow: 1 }}>
        <h3
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            color: isPopular ? 'var(--accent)' : 'var(--ink)',
          }}
        >
          {name}
        </h3>
        <p className="section-subtitle" style={{ marginBottom: '1.5rem', minHeight: '2.5rem' }}>
          {description}
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <span
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: 'var(--ink)',
            }}
          >
            {price}
          </span>
          {price !== 'Custom' && (
            <span style={{ color: 'var(--stone)', fontSize: '0.9rem' }}>{period}</span>
          )}
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {features.map((feature, idx) => (
            <li
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                fontSize: '0.9rem',
                marginBottom: '0.6rem',
                color: 'var(--ink)',
              }}
            >
              <span
                style={{
                  marginRight: '0.5rem',
                  color: isPopular ? 'var(--accent)' : 'var(--accent-cool)',
                  fontWeight: 700,
                }}
              >
                ✓
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ padding: '0 1.5rem 1.5rem', marginTop: 'auto' }}>
        <button
          onClick={onSelect}
          disabled={isCurrent || loading || disabled}
          className={isPopular ? 'button' : 'button secondary'}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            opacity: loading || isCurrent || disabled ? 0.5 : 1,
            cursor: isCurrent || disabled ? 'default' : loading ? 'wait' : 'pointer',
          }}
        >
          {loading && (
            <div
              style={{
                width: '1rem',
                height: '1rem',
                border: '2px solid currentColor',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          )}
          {loading
            ? 'Redirecting...'
            : isCurrent
              ? 'Current Plan'
              : isEnterprise
                ? 'Contact Sales'
                : 'Upgrade'}
        </button>
      </div>
    </div>
  );
}
