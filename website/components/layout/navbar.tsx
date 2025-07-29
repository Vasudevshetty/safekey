'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../theme-provider';
import { Menu, X, Sun, Moon, Monitor, Github, Terminal } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Terminal className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">SafeKey</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/docs"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="/roadmap"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Roadmap
            </Link>
            <Link
              href="/about"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              About
            </Link>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-accent transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
              >
                {getThemeIcon()}
              </button>

              <Link
                href="https://github.com/Vasudevshetty/safekey"
                className="p-2 rounded-md hover:bg-accent transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-accent transition-colors"
            >
              {getThemeIcon()}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-accent transition-colors"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border/40">
              <Link
                href="/docs"
                className="block px-3 py-2 text-foreground/60 hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Documentation
              </Link>
              <Link
                href="/roadmap"
                className="block px-3 py-2 text-foreground/60 hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Roadmap
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-foreground/60 hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="https://github.com/Vasudevshetty/safekey"
                className="flex items-center px-3 py-2 text-foreground/60 hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
              >
                <Github className="h-5 w-5 mr-2" />
                GitHub
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
