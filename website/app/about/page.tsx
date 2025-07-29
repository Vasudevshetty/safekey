import Link from 'next/link';
import {
  Github,
  Twitter,
  ArrowRight,
  Lock,
  Shield,
  Users,
} from '@/components/icons';

export default function AboutPage() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          About <span className="gradient-text">SafeKey</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Born from the need for a simple, secure, and developer-friendly way to
          manage secrets, SafeKey is built with security-first principles and
          modern development workflows in mind.
        </p>
      </div>

      {/* Mission */}
      <div className="glass rounded-2xl p-8 md:p-12 mb-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            To provide developers and teams with a secure, intuitive, and
            powerful tool for managing sensitive information without
            compromising on security or usability.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          {
            icon: Shield,
            title: 'Security First',
            description:
              'Every design decision prioritizes security. We use industry-standard encryption and follow security best practices.',
          },
          {
            icon: Users,
            title: 'Developer Focused',
            description:
              'Built by developers, for developers. We understand the workflow and tools that matter to modern development teams.',
          },
          {
            icon: Lock,
            title: 'Open Source',
            description:
              'Transparency builds trust. Our code is open source, auditable, and community-driven.',
          },
        ].map((value, index) => (
          <div
            key={index}
            className="glass rounded-2xl p-6 text-center group hover:scale-105 transition-all duration-300"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4">
              <value.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
            <p className="text-muted-foreground">{value.description}</p>
          </div>
        ))}
      </div>

      {/* Story */}
      <div className="glass rounded-2xl p-8 md:p-12 mb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">The Story</h2>
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <p className="text-muted-foreground leading-relaxed mb-6">
              SafeKey started as a personal project to solve a common problem:
              managing secrets across multiple projects and environments
              securely. After trying various solutions and finding them either
              too complex, insecure, or lacking essential features, the idea for
              SafeKey was born.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The project began with a simple goal: create a CLI tool that could
              securely store and manage secrets with military-grade encryption
              while remaining easy to use. As the project evolved, features like
              team collaboration, cloud synchronization, and web interfaces were
              added based on community feedback and real-world usage.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, SafeKey is used by developers and teams worldwide to secure
              their sensitive data, and it continues to evolve with new features
              and improvements driven by the community.
            </p>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="glass rounded-2xl p-8 md:p-12 mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Creator</h2>
        <div className="max-w-sm mx-auto">
          <div className="glass rounded-2xl p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">VS</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Vasudev Shetty</h3>
            <p className="text-muted-foreground mb-4">Creator & Maintainer</p>
            <p className="text-sm text-muted-foreground mb-6">
              Full-stack developer passionate about security, developer tools,
              and open source software.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="https://github.com/Vasudevshetty"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com/vasudevshetty"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Community */}
      <div className="glass rounded-2xl p-8 md:p-12 mb-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Join the Community</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            SafeKey is more than just a tool—it's a community of developers who
            care about security. Join us to contribute, share ideas, and help
            make SafeKey even better.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://github.com/Vasudevshetty/safekey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-medium transition-all hover:bg-primary/90"
            >
              <Github className="mr-2 h-4 w-4" />
              View on GitHub
            </Link>
            <Link
              href="https://github.com/Vasudevshetty/safekey/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background/80 backdrop-blur-sm px-6 py-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground"
            >
              Join Discussions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'GitHub Stars', value: '500+' },
          { label: 'Downloads', value: '10K+' },
          { label: 'Contributors', value: '12+' },
          { label: 'Open Issues', value: '5' },
        ].map((stat, index) => (
          <div key={index} className="glass rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
