import Link from 'next/link';
import { ArrowLeft, Home, Search, Terminal } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          {/* Glass card */}
          <div className="relative rounded-2xl bg-background/60 backdrop-blur-xl border border-border/40 p-8 md:p-12 shadow-2xl">
            {/* 404 Animation */}
            <div className="relative mb-8">
              <div className="text-8xl md:text-9xl font-bold text-muted-foreground/20 select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Terminal className="w-16 h-16 md:w-20 md:h-20 text-primary animate-pulse" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Page Not Found
              </h1>

              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                The page you're looking for doesn't exist or has been moved to a
                different location.
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl group"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </Link>

                <Link
                  href="/docs"
                  className="inline-flex items-center px-6 py-3 rounded-lg border border-border bg-background/60 backdrop-blur-sm font-semibold hover:bg-accent transition-all duration-200 group"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Browse Docs
                </Link>
              </div>

              {/* Helpful links */}
              <div className="mt-12 pt-8 border-t border-border/40">
                <h3 className="text-lg font-semibold mb-4">
                  You might be looking for:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <Link
                    href="/docs"
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="font-medium">Documentation</div>
                    <div className="text-muted-foreground">
                      Get started with SafeKey
                    </div>
                  </Link>

                  <Link
                    href="/roadmap"
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="font-medium">Roadmap</div>
                    <div className="text-muted-foreground">
                      See what's coming next
                    </div>
                  </Link>

                  <Link
                    href="/about"
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="font-medium">About</div>
                    <div className="text-muted-foreground">
                      Learn about the project
                    </div>
                  </Link>

                  <Link
                    href="https://github.com/Vasudevshetty/safekey"
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="font-medium">GitHub</div>
                    <div className="text-muted-foreground">
                      View source code
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
