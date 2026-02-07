'use client';

import type React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const settingsLinks = [
  { href: '/settings/profile', label: 'Profile' },
  { href: '/settings/interview', label: 'Interview' },
  { href: '/settings/integrations', label: 'Integrations' },
  { href: '/settings/developer', label: 'Developer' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <nav
        aria-label="Settings navigation"
        style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid rgba(29, 26, 22, 0.08)',
          background: '#fff',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Link
          href="/dashboard"
          style={{
            fontSize: '0.85rem',
            color: 'var(--stone)',
            textDecoration: 'none',
            marginRight: '0.5rem',
          }}
        >
          &larr; Dashboard
        </Link>
        <span style={{ color: 'rgba(29, 26, 22, 0.2)', marginRight: '0.25rem' }}>|</span>
        {settingsLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent)' : 'var(--ink)',
                background: isActive ? 'rgba(211, 107, 60, 0.08)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.15s ease',
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
