import type React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getServerEnv } from '@/env';

// Validate server environment on first render
getServerEnv();

export const metadata: Metadata = {
  title: {
    default: 'in midst my life',
    template: '%s | in midst my life',
  },
  description:
    'Transform your static resume into a dynamic, queryable, multi-perspective profile with mask-based identity filtering and blockchain-inspired verification.',
  metadataBase: new URL(process.env['NEXT_PUBLIC_SITE_URL'] || 'http://localhost:3000'),
  icons: {
    icon: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'in midst my life',
    description: 'Your identity, verified & composable.',
    type: 'website',
    siteName: 'in midst my life',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#d36b3c',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="app-body">{children}</body>
    </html>
  );
}
