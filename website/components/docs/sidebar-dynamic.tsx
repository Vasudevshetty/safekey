'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, BookOpen, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DocSection {
  id: string;
  title: string;
  file: string;
  order: number;
}

interface DocCategory {
  id: string;
  title: string;
  order: number;
  sections: DocSection[];
}

interface DocMetadata {
  navigation: DocCategory[];
}

export function DocsSidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [navigation, setNavigation] = useState<DocCategory[]>([]);

  useEffect(() => {
    // Fetch the docs metadata
    fetch('/api/docs/metadata')
      .then((res) => res.json())
      .then((data: DocMetadata) => {
        const sortedNavigation = data.navigation.sort(
          (a, b) => a.order - b.order
        );
        setNavigation(sortedNavigation);

        // Open the section containing the current page
        const currentCategory = sortedNavigation.find((category) =>
          category.sections.some(
            (section) => pathname === `/docs/${category.id}/${section.id}`
          )
        );
        if (currentCategory) {
          setOpenSections([currentCategory.id]);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch docs metadata:', error);
        // Fallback navigation
        setNavigation([
          {
            id: 'getting-started',
            title: 'Getting Started',
            order: 1,
            sections: [
              {
                id: 'introduction',
                title: 'Introduction',
                file: 'introduction.md',
                order: 1,
              },
              {
                id: 'installation',
                title: 'Installation',
                file: 'installation.md',
                order: 2,
              },
              {
                id: 'quick-start',
                title: 'Quick Start',
                file: 'quick-start.md',
                order: 3,
              },
            ],
          },
        ]);
      });
  }, [pathname]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/docs"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
            pathname === '/docs'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          Documentation
        </Link>
      </div>

      {/* Navigation */}
      <nav className="space-y-3">
        {navigation.map((category) => {
          const isOpen = openSections.includes(category.id);
          const hasActiveItem = category.sections.some(
            (section) => pathname === `/docs/${category.id}/${section.id}`
          );

          return (
            <div key={category.id} className="space-y-1">
              <button
                onClick={() => toggleSection(category.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                  hasActiveItem
                    ? 'text-foreground bg-accent/60'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                }`}
              >
                <span className="flex items-center gap-2">
                  {category.title}
                </span>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                )}
              </button>

              {isOpen && (
                <div className="ml-2 pl-4 border-l-2 border-border/40 space-y-1">
                  {category.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => {
                      const href = `/docs/${category.id}/${section.id}`;
                      const isActive = pathname === href;

                      return (
                        <Link
                          key={section.id}
                          href={href}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                            isActive
                              ? 'bg-primary/10 text-primary border-l-2 border-primary ml-[-2px] pl-[14px]'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent/40 hover:translate-x-1'
                          }`}
                        >
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{section.title}</span>
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-border/40">
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Version</span>
            <span className="font-mono">1.2.1</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Updated</span>
            <span>Jan 29, 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
}
