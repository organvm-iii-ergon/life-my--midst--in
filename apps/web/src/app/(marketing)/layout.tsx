import type React from 'react';
import Link from 'next/link';

const navLinks = [
  { href: '/blog', label: 'Blog' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'rgba(244, 239, 230, 0.85)',
          borderBottom: '1px solid rgba(29, 26, 22, 0.08)',
        }}
      >
        <nav
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0.75rem clamp(1rem, 3vw, 2.5rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: '1.2rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
            }}
          >
            in&thinsp;midst&thinsp;my&thinsp;life
          </Link>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--stone)',
                  transition: 'color 0.2s ease',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '3rem clamp(1rem, 3vw, 2.5rem) 2rem',
          borderTop: '1px solid rgba(29, 26, 22, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '2rem',
          fontSize: '0.85rem',
          color: 'var(--stone)',
        }}
      >
        <div>
          <p style={{ margin: 0 }}>
            &copy; {new Date().getFullYear()} in&thinsp;midst&thinsp;my&thinsp;life
          </p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem' }}>
            Identity infrastructure for the autonomous professional.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/blog">Blog</Link>
          <Link href="/pricing">Pricing</Link>
          <a href="https://github.com/in-midst-my-life" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </footer>
    </>
  );
}
