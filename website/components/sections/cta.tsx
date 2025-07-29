import Link from 'next/link';
import { ArrowRight, Github, Book } from '@/components/icons';

export function CTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-3xl p-8 md:p-16 text-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to secure your
            <br />
            <span className="gradient-text">secrets today?</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
            Join thousands of developers who trust SafeKey to keep their secrets
            secure. Start protecting your sensitive data in less than 5 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-8 py-4 text-lg font-medium transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring glass-hover group"
            >
              <Book className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Read the Docs
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="https://github.com/Vasudevshetty/safekey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background/80 backdrop-blur-sm px-8 py-4 text-lg font-medium transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring glass-hover group"
            >
              <Github className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Star on GitHub
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-border/30">
            {[
              { label: 'Downloads', value: '10K+' },
              { label: 'GitHub Stars', value: '500+' },
              { label: 'Contributors', value: '12+' },
              { label: 'Releases', value: '25+' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
