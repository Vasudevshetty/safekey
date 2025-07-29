import { DocsSidebar } from '@/components/docs/sidebar-dynamic';
import { DocsNav } from '@/components/docs/nav';
import React from 'react';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Sticky */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 border-r border-border/40 bg-muted/30">
        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <DocsSidebar />
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navigation - Sticky */}
        <div className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <DocsNav />
        </div>

        {/* Content */}
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
