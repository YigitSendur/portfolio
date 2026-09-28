import { profile } from '@/content/content';
import { isReal } from '@/lib/links';
import { ChapterNav } from './ChapterNav';

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-10 flex items-baseline justify-between gap-6 bg-linear-to-b from-surface from-55% to-transparent px-[clamp(1.25rem,4vw,3rem)] pb-4 pt-[calc(env(safe-area-inset-top,0px)+1.1rem)] text-[0.95rem]">
      <a href="#top" className="font-bold font-stretch-[112%] text-ink no-underline hover:text-accent">
        Yiğit Şendur
      </a>
      <ChapterNav />
      <nav aria-label="Profiles" className="flex gap-4 sm:gap-6">
        <a className="text-ink no-underline hover:text-accent" href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
        <a className="text-ink no-underline hover:text-accent" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        {isReal(profile.cv) && (
          <a className="text-ink no-underline hover:text-accent" href={profile.cv} target="_blank" rel="noreferrer">CV</a>
        )}
      </nav>
    </header>
  );
}
