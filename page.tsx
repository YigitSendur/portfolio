import { projects } from '@/content/content';
import { SceneLoader } from '@/components/scene/SceneLoader';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { Hero } from '@/components/sections/Hero';
import { Experience } from '@/components/sections/Experience';
import { ProjectChapter } from '@/components/sections/ProjectChapter';
import { Also } from '@/components/sections/Also';

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="absolute -top-16 left-4 z-30 bg-surface px-3 py-2 focus:top-[calc(env(safe-area-inset-top,0px)+1rem)]"
      >
        Skip to content
      </a>
      <SceneLoader />
      <ScrollProgress />
      <SiteHeader />
      <main id="main" className="relative z-[1]">
        <Hero />
        <Experience />
        {projects.map((p) => (
          <ProjectChapter key={p.id} project={p} />
        ))}
        <Also />
      </main>
      <footer className="relative z-[1] px-[clamp(1.25rem,6vw,5.5rem)] pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] pt-8 text-sm text-muted">
        Built with Next.js, TypeScript, Tailwind CSS, Framer Motion and a hand-written WebGL particle shader.
      </footer>
    </>
  );
}
