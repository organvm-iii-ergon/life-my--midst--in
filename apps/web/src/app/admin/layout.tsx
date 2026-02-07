'use client';

import type React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const adminLinks = [
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/masks', label: 'Masks' },
  { href: '/admin/monitoring', label: 'Monitoring' },
  { href: '/admin/beta', label: 'Beta' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <nav
        aria-label="Admin navigation"
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
          href="/"
          style={{
            fontSize: '0.85rem',
            color: 'var(--stone)',
            textDecoration: 'none',
            marginRight: '0.5rem',
          }}
        >
          &larr; Home
        </Link>
        <span style={{ color: 'rgba(29, 26, 22, 0.2)', marginRight: '0.25rem' }}>|</span>
        {adminLinks.map((link) => {
          const isActive = pathname === link.href;
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
