'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Github, Edit, Search, Menu } from 'lucide-react';

export function DocsNav() {
  const pathname = usePathname();

  const getEditUrl = () => {
    const path = pathname.replace('/docs/', '');
    return `https://github.com/Vasudevshetty/safekey/edit/main/docs/${path}.md`;
  };

  return (
    <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:gap-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center text-sm text-muted-foreground">
            <span>SafeKey</span>
            <span className="mx-2">/</span>
            <span className="text-foreground">Documentation</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search placeholder */}
          <button className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted transition-colors text-sm">
            <Search className="h-4 w-4" />
            <span>Search docs...</span>
            <kbd className="hidden lg:inline-block px-2 py-1 text-xs bg-background border rounded">
              ⌘K
            </kbd>
          </button>

          <Link
            href={getEditUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent/50"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Edit page</span>
          </Link>

          <Link
            href="https://github.com/Vasudevshetty/safekey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent/50"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
