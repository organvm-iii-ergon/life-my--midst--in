'use client';

import Link from 'next/link';

export function Hero() {
  return (
    <section
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '5rem clamp(1rem, 3vw, 2.5rem) 3rem',
        textAlign: 'center',
      }}
    >
      <h1
        className="fade-up"
        style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          margin: 0,
          maxWidth: 740,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        Your identity, <br />
        <span style={{ color: 'var(--accent)' }}>verified &amp; composable</span>
      </h1>

      <p
        className="fade-up"
        style={{
          fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
          color: 'var(--stone)',
          maxWidth: 560,
          margin: '1.5rem auto 2.5rem',
          lineHeight: 1.6,
          animationDelay: '0.1s',
        }}
      >
        Transform your static r&eacute;sum&eacute; into a dynamic, queryable, multi-perspective
        profile with mask-based identity filtering and blockchain-inspired verification.
      </p>

      <div
        className="fade-up"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          animationDelay: '0.2s',
        }}
      >
        <Link
          href="/dashboard"
          className="button"
          style={{ fontSize: '1rem', padding: '0.75rem 1.6rem' }}
        >
          Open Dashboard
        </Link>
        <Link
          href="/pricing"
          className="button secondary"
          style={{ fontSize: '1rem', padding: '0.75rem 1.6rem' }}
        >
          View Plans
        </Link>
      </div>

      {/* Decorative badge row */}
      <div
        className="fade-up"
        style={{
          marginTop: '3rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          animationDelay: '0.3s',
        }}
      >
        {['DID/VC Ready', 'Schema-First', 'Mask Engine', 'LLM Agents'].map((tag) => (
          <span className="chip" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}
