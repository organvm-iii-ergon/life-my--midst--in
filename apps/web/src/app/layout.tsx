import type React from 'react';
import './globals.css';
import { getServerEnv } from '@/env';

// Validate server environment on first render
getServerEnv();

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
