import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — in midst my life',
  description:
    'Our mission: transform the static résumé into a dynamic, verifiable, composable identity system.',
};

export default function AboutPage() {
  return (
    <section
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: '3rem clamp(1rem, 3vw, 2.5rem) 5rem',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: 'clamp(2rem, 3vw, 2.6rem)',
          marginBottom: '0.5rem',
        }}
      >
        About
      </h1>
      <p style={{ color: 'var(--stone)', marginBottom: '2.5rem', fontSize: '1.05rem' }}>
        Rethinking professional identity from first principles.
      </p>

      <div className="section" style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: '1.4rem',
            marginBottom: '0.75rem',
          }}
        >
          Our Mission
        </h2>
        <p style={{ lineHeight: 1.7, color: 'var(--ink)' }}>
          The professional résumé has been static for decades — a PDF, a Word document, a page of
          bullet points. <strong>in&thinsp;midst&thinsp;my&thinsp;life</strong> replaces that with a
          dynamic identity system: one that adapts to every audience, verifies every claim, and
          presents the right facet of your experience at the right time.
        </p>
      </div>

      <div className="section" style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: '1.4rem',
            marginBottom: '0.75rem',
          }}
        >
          Design Philosophy
        </h2>
        <ul style={{ lineHeight: 1.8, paddingLeft: '1.2rem', color: 'var(--ink)' }}>
          <li>
            <strong>Schema-first</strong> — Every data model is defined in Zod before any UI or
            business logic touches it
          </li>
          <li>
            <strong>Mask-driven identity</strong> — 15+ identity masks filter and reframe your
            experience for different contexts
          </li>
          <li>
            <strong>Verifiable by default</strong> — DID/VC integration anchors credentials in
            cryptographic proof
          </li>
          <li>
            <strong>Composable, not monolithic</strong> — Your identity is a system of
            interchangeable parts, not a single document
          </li>
        </ul>
      </div>

      <div className="section" style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: '1.4rem',
            marginBottom: '0.75rem',
          }}
        >
          Technology
        </h2>
        <p style={{ lineHeight: 1.7, color: 'var(--ink)', marginBottom: '1rem' }}>
          Built as a modular monorepo with clear architectural boundaries:
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            { label: 'Frontend', detail: 'Next.js 15, React 19' },
            { label: 'API', detail: 'Fastify, GraphQL' },
            { label: 'Orchestrator', detail: 'Node.js worker service' },
            { label: 'Schema', detail: 'Zod + TypeScript strict mode' },
            { label: 'Verification', detail: 'W3C DID & Verifiable Credentials' },
            { label: 'Infrastructure', detail: 'PostgreSQL, Redis, Helm' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: '1rem',
                borderRadius: '8px',
                background: 'rgba(29, 26, 22, 0.03)',
                border: '1px solid rgba(29, 26, 22, 0.06)',
              }}
            >
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{item.label}</strong>
              <span style={{ color: 'var(--stone)', fontSize: '0.9rem' }}>{item.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: '1.4rem',
            marginBottom: '0.75rem',
          }}
        >
          Open Source
        </h2>
        <p style={{ lineHeight: 1.7, color: 'var(--ink)' }}>
          The platform is built in the open. Explore the architecture, contribute to the codebase,
          or use the schema packages in your own identity projects. Read more on our{' '}
          <a
            href="https://github.com/in-midst-my-life"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--terracotta)' }}
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </section>
  );
}
