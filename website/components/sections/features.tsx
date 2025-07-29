import { Shield, Terminal, Users, Cloud, Key, Zap } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Military-Grade Security',
    description:
      'AES-256 encryption with PBKDF2 key derivation ensures your secrets are protected with industry-standard cryptography.',
  },
  {
    icon: Terminal,
    title: 'Developer-First CLI',
    description:
      'Intuitive command-line interface designed for modern development workflows with rich help and autocomplete.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Share secrets securely with team members using built-in collaboration features and access controls.',
  },
  {
    icon: Cloud,
    title: 'Cloud Sync',
    description:
      'Synchronize your vaults across devices with support for AWS S3, Azure Blob, and GitHub Gist storage.',
  },
  {
    icon: Key,
    title: 'Multiple Vaults',
    description:
      'Organize secrets into separate vaults for different projects, environments, or security levels.',
  },
  {
    icon: Zap,
    title: 'Performance Focused',
    description:
      'Lightning-fast operations with minimal dependencies and optimized for large-scale secret management.',
  },
];

export function Features() {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-border/50 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
            Features
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Everything you need for
            <br />
            <span className="gradient-text">secure secret management</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mt-6">
            SafeKey provides all the tools you need to manage secrets securely,
            from development to production.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-8 glass-hover group hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-24 glass rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                256-bit
              </div>
              <div className="text-muted-foreground">AES Encryption</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                0
              </div>
              <div className="text-muted-foreground">
                Security Vulnerabilities
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                100%
              </div>
              <div className="text-muted-foreground">Open Source</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
