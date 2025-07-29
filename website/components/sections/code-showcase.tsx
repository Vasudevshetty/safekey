'use client';

import { useState } from 'react';
import { Copy, Check } from '@/components/icons';

const codeExamples = [
  {
    title: 'Initialize a new vault',
    code: `# Create a new secure vault
safekey init my-project

# Set your master password
# Vault created successfully! 🔐`,
  },
  {
    title: 'Add secrets securely',
    code: `# Add API keys and credentials
safekey add API_KEY "sk-1234567890abcdef"
safekey add DB_PASSWORD "super-secure-password"
safekey add JWT_SECRET "my-jwt-secret-key"

# Secret added successfully! ✅`,
  },
  {
    title: 'Use in your projects',
    code: `# Inject secrets into your environment
safekey inject -- npm run dev

# Or export to .env file
safekey export --format env > .env`,
  },
  {
    title: 'Team collaboration',
    code: `# Share vault with team members
safekey team add john@company.com --role editor
safekey team add jane@company.com --role viewer

# Sync with cloud storage
safekey cloud sync --provider aws-s3`,
  },
];

export function CodeShowcase() {
  const [activeExample, setActiveExample] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof window !== 'undefined' && window.navigator?.clipboard) {
        await window.navigator.clipboard.writeText(
          codeExamples[activeExample].code
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-muted/20 to-background">
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-border/50 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
            Getting Started
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Simple commands,
            <br />
            <span className="gradient-text">powerful results</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mt-6">
            Get started with SafeKey in minutes. Here's how easy it is to secure
            your secrets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Example selector */}
          <div className="space-y-4">
            {codeExamples.map((example, index) => (
              <button
                key={index}
                onClick={() => setActiveExample(index)}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                  activeExample === index
                    ? 'glass border-primary/50 bg-primary/5'
                    : 'border-border/50 bg-background/50 hover:border-border glass-hover'
                }`}
              >
                <h3 className="font-semibold text-lg mb-2 text-foreground">
                  {example.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activeExample === index
                        ? 'bg-primary animate-pulse'
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                  <span>Click to view example</span>
                </div>
              </button>
            ))}
          </div>

          {/* Code display */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="ml-4 text-sm font-medium text-muted-foreground">
                  Terminal
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-background/50 hover:bg-background/80 transition-colors text-sm"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-6 bg-background/50">
              <pre className="text-sm font-mono text-foreground leading-relaxed overflow-x-auto">
                <code>{codeExamples[activeExample].code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
