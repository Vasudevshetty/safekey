import { GlassHero } from '@/components/sections/glass-hero';
import { Features } from '@/components/sections/features';
import { CodeShowcase } from '@/components/sections/code-showcase';
import { CTA } from '@/components/sections/cta';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <GlassHero />
      <Features />
      <CodeShowcase />
      <CTA />
    </div>
  );
}
