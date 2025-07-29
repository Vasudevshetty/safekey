'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from '@/components/icons';
import { useState } from 'react';

const docsNavigation = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs/getting-started/introduction' },
      { title: 'Installation', href: '/docs/getting-started/installation' },
      { title: 'Quick Start', href: '/docs/getting-started/quick-start' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { title: 'Vaults', href: '/docs/core-concepts/vaults' },
      { title: 'Encryption', href: '/docs/core-concepts/encryption' },
      { title: 'Security', href: '/docs/core-concepts/security' },
    ],
  },
  {
    title: 'CLI Reference',
    items: [
      { title: 'Basic Commands', href: '/docs/cli-reference/basic-commands' },
      {
        title: 'Vault Management',
        href: '/docs/cli-reference/vault-management',
      },
      { title: 'Team Commands', href: '/docs/cli-reference/team-commands' },
      { title: 'Cloud Sync', href: '/docs/cli-reference/cloud-sync' },
    ],
  },
  {
    title: 'Guides',
    items: [
      { title: 'Cloud Setup', href: '/docs/guides/cloud-setup' },
      { title: 'Team Setup', href: '/docs/guides/team-setup' },
      { title: 'Migration', href: '/docs/guides/migration' },
    ],
  },
  {
    title: 'API',
    items: [
      { title: 'TypeScript API', href: '/docs/api/typescript-api' },
      { title: 'Core Classes', href: '/docs/api/core-classes' },
      { title: 'Utilities', href: '/docs/api/utilities' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { title: 'Configuration', href: '/docs/advanced/configuration' },
      { title: 'Integrations', href: '/docs/advanced/integrations' },
      { title: 'Automation', href: '/docs/advanced/automation' },
    ],
  },
  {
    title: 'Troubleshooting',
    items: [
      { title: 'Common Issues', href: '/docs/troubleshooting/common-issues' },
      { title: 'Debugging', href: '/docs/troubleshooting/debugging' },
      { title: 'FAQ', href: '/docs/troubleshooting/faq' },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(
    docsNavigation.map((section) => section.title)
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <aside className="w-64 glass border-r border-border/40 h-screen sticky top-14 overflow-y-auto">
      <div className="p-6">
        <h2 className="font-semibold text-lg mb-4">Documentation</h2>
        <nav className="space-y-2">
          {docsNavigation.map((section) => (
            <div key={section.title}>
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full text-left font-medium text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-accent/50"
              >
                {section.title}
                {expandedSections.includes(section.title) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {expandedSections.includes(section.title) && (
                <div className="ml-4 mt-1 space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block text-sm p-2 rounded-lg transition-colors ${
                        pathname === item.href
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
