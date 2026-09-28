'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { chapters } from '@/content/content';
import { cn } from '@/lib/cn';

/**
 * Chapter list in the header. The active chapter is the one crossing the
 * middle of the viewport; its underline is a single element that Framer
 * Motion moves between items (shared layout animation via layoutId).
 */
export function ChapterNav() {
  const [active, setActive] = useState(chapters[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    for (const c of chapters) {
      const el = document.getElementById(c.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Chapters" className="hidden xl:block">
      <ul className="flex gap-5">
        {chapters.map((c) => (
          <li key={c.id} className="relative">
            <a
              href={`#${c.id}`}
              aria-current={active === c.id ? 'true' : undefined}
              className={cn('no-underline transition-colors hover:text-ink', active === c.id ? 'text-ink' : 'text-muted')}
            >
              {c.label}
            </a>
            {active === c.id && (
              <motion.span
                layoutId="chapter-underline"
                className="absolute inset-x-0 -bottom-1 h-0.5 bg-accent"
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
              />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
