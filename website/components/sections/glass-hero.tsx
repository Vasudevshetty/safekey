'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Download,
  Github,
  Terminal,
  Shield,
  Lock,
} from 'lucide-react';

export function GlassHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Glass card container */}
          <div className="glass rounded-3xl p-8 md:p-12 glass-hover max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full border border-border/50 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground mb-8">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              v1.2.1 • Open Source
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
              <span className="gradient-text">Secure Secrets</span>
              <br />
              <span className="text-foreground">Made Simple</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground leading-8 mt-6">
              A modern, secure, and user-friendly CLI tool for managing
              encrypted secrets and environment variables. Built with{' '}
              <span className="font-semibold text-foreground">
                security-first
              </span>{' '}
              principles.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link
                href="/docs/getting-started"
                className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-8 py-4 text-sm font-medium transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring glass-hover"
              >
                <Terminal className="mr-2 h-4 w-4" />
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="https://github.com/Vasudevshetty/safekey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background/80 backdrop-blur-sm px-8 py-4 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring glass-hover"
              >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Link>
            </div>

            {/* Quick install */}
            <div className="mt-12 p-4 rounded-xl border border-border/50 bg-muted/50 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground mb-2">
                Quick Install:
              </p>
              <div className="flex items-center justify-between bg-background/80 rounded-lg px-4 py-3 border border-border/30">
                <code className="text-sm font-mono text-foreground">
                  npm install -g @safekey/cli
                </code>
                <button
                  className="ml-2 p-1.5 rounded-md hover:bg-accent transition-colors"
                  onClick={() => {
                    if (
                      typeof window !== 'undefined' &&
                      window.navigator?.clipboard
                    ) {
                      window.navigator.clipboard.writeText(
                        'npm install -g @safekey/cli'
                      );
                    }
                  }}
                  title="Copy to clipboard"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Features preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
            {[
              {
                title: 'CLI First',
                description:
                  'Powerful command-line interface designed for developers',
                icon: Terminal,
              },
              {
                title: 'Secure by Design',
                description: 'AES-256 encryption with secure key derivation',
                icon: '🔒',
              },
              {
                title: 'Team Ready',
                description: 'Built-in team collaboration and sharing features',
                icon: '👥',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-6 glass-hover text-center group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {typeof feature.icon === 'string' ? (
                    <span>{feature.icon}</span>
                  ) : (
                    <feature.icon className="h-8 w-8 mx-auto text-primary" />
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
