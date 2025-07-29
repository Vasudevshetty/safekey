import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Book, Clock, Edit } from 'lucide-react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { processMarkdown } from '@/lib/markdown';

// Simple interfaces for now
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
  metadata: {
    title: string;
    description: string;
    version: string;
  };
  navigation: DocCategory[];
}

function getDocMetadata(): DocMetadata {
  try {
    const metadataPath = path.join(
      process.cwd(),
      '..',
      'docs',
      'metadata.json'
    );
    const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
    return JSON.parse(metadataContent);
  } catch (error) {
    console.error('Error reading metadata.json:', error);
    throw new Error('Failed to load documentation metadata');
  }
}

async function getDocContent(categoryId: string, sectionId: string) {
  try {
    const metadata = getDocMetadata();
    const category = metadata.navigation.find((cat) => cat.id === categoryId);

    if (!category) return null;

    const section = category.sections.find((sec) => sec.id === sectionId);
    if (!section) return null;

    const filePath = path.join(
      process.cwd(),
      '..',
      'docs',
      categoryId,
      section.file
    );

    if (!fs.existsSync(filePath)) return null;

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { content, data: frontmatter } = matter(fileContent);

    return {
      content,
      frontmatter,
      title: frontmatter.title || section.title,
      description: frontmatter.description,
      category: category.title,
    };
  } catch (error) {
    console.error(
      `Error reading doc content for ${categoryId}/${sectionId}:`,
      error
    );
    return null;
  }
}

export default async function DocPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const [categoryId, sectionId] = params.slug;

  if (!categoryId || !sectionId) {
    notFound();
  }

  const docContent = await getDocContent(categoryId, sectionId);

  if (!docContent) {
    notFound();
  }

  // Process markdown to HTML
  const htmlContent = await processMarkdown(docContent.content);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link
            href="/docs"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Book className="w-4 h-4" />
            Docs
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">
            {docContent.category}
          </span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{docContent.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {docContent.title}
          </h1>
          {docContent.description && (
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              {docContent.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-border/40 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>5 min read</span>
            </div>
            <div className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              <span>Last updated: Jan 29, 2025</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-pre:bg-muted prose-pre:border prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </article>

        {/* Page Navigation */}
        <div className="flex justify-between items-center pt-12 mt-12 border-t border-border/40">
          <div>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-accent transition-all duration-200 text-sm font-medium group"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Back to Overview
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`https://github.com/Vasudevshetty/safekey/edit/main/docs/${categoryId}/${docContent.frontmatter?.file || sectionId + '.md'}`}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-accent transition-all duration-200 text-sm font-medium group"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit on GitHub</span>
            </Link>
            <Link
              href="https://github.com/Vasudevshetty/safekey/issues/new"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl group"
              target="_blank"
              rel="noopener noreferrer"
            >
              Feedback
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
