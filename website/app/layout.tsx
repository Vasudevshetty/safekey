import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import React from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'SafeKey - Secure Secrets Manager CLI',
    template: '%s | SafeKey',
  },
  description:
    'A modern, secure, and user-friendly CLI tool for managing encrypted secrets and environment variables. Built with security-first principles.',
  keywords: [
    'cli',
    'secrets',
    'encryption',
    'security',
    'environment variables',
    'vault',
  ],
  authors: [
    {
      name: 'Vasudev Shetty',
      url: 'https://github.com/Vasudevshetty',
    },
  ],
  creator: 'Vasudev Shetty',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://safekey.dev',
    title: 'SafeKey - Secure Secrets Manager CLI',
    description:
      'A modern, secure, and user-friendly CLI tool for managing encrypted secrets and environment variables.',
    siteName: 'SafeKey',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafeKey - Secure Secrets Manager CLI',
    description:
      'A modern, secure, and user-friendly CLI tool for managing encrypted secrets and environment variables.',
    creator: '@vasudevshetty',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
