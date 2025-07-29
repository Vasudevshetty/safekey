import Link from 'next/link';
import { ArrowRight, Book, Terminal, Users, Cloud } from 'lucide-react';

const quickLinks = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of SafeKey and set up your first vault',
    href: '/docs/getting-started/introduction',
    icon: Book,
  },
  {
    title: 'CLI Reference',
    description: 'Complete reference for all SafeKey commands',
    href: '/docs/cli-reference/basic-commands',
    icon: Terminal,
  },
  {
    title: 'Team Setup',
    description: 'Configure SafeKey for team collaboration',
    href: '/docs/guides/team-setup',
    icon: Users,
  },
  {
    title: 'Cloud Sync',
    description: 'Sync your vaults across devices with cloud storage',
    href: '/docs/guides/cloud-setup',
    icon: Cloud,
  },
];

export default function DocsPage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          SafeKey <span className="gradient-text">Documentation</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know about using SafeKey to manage your secrets
          securely.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="glass rounded-2xl p-6 glass-hover group hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <link.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {link.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {link.description}
                </p>
                <div className="flex items-center text-primary text-sm font-medium">
                  Read more
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Getting started section */}
      <div className="glass rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-4">New to SafeKey?</h2>
        <p className="text-muted-foreground mb-6">
          Start with our getting started guide to learn the fundamentals and set
          up your first vault in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/docs/getting-started/introduction"
            className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-medium transition-all hover:bg-primary/90"
          >
            <Book className="mr-2 h-4 w-4" />
            Introduction
          </Link>
          <Link
            href="/docs/getting-started/installation"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background/80 backdrop-blur-sm px-6 py-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground"
          >
            <Terminal className="mr-2 h-4 w-4" />
            Installation
          </Link>
        </div>
      </div>

      {/* Popular guides */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Popular Guides</h2>
        <div className="space-y-4">
          {[
            {
              title: 'Setting up your first vault',
              href: '/docs/getting-started/quick-start',
              description: 'Create and configure your first SafeKey vault',
            },
            {
              title: 'Understanding encryption',
              href: '/docs/core-concepts/encryption',
              description: 'Learn how SafeKey protects your secrets',
            },
            {
              title: 'Team collaboration',
              href: '/docs/guides/team-setup',
              description: 'Share vaults securely with your team',
            },
            {
              title: 'Cloud synchronization',
              href: '/docs/guides/cloud-setup',
              description: 'Sync your vaults across multiple devices',
            },
          ].map((guide, index) => (
            <Link
              key={index}
              href={guide.href}
              className="block p-4 rounded-xl border border-border/50 bg-background/50 hover:border-border hover:bg-accent/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {guide.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
