import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Analyst Dashboard',
  description: 'Browse analyst transcript summaries and thesis tracking',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
  },
  other: {
    'theme-color': '#020617',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
