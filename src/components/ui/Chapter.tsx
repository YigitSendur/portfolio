import type { ReactNode } from 'react';
import { shapeOf } from '@/content/content';
import { cn } from '@/lib/cn';

type Props = { id: string; labelledBy: string; children: ReactNode; className?: string };

/**
 * One full-screen section of the story. `data-shape` tells the particle
 * scene which shape belongs to this section.
 * Phones: the shape sits at the top, the text scrolls over it on a veil.
 * Desktop (lg): text on the left, shape on the right.
 */
export function Chapter({ id, labelledBy, children, className }: Props) {
  return (
    <section
      id={id}
      data-shape={shapeOf(id)}
      aria-labelledby={labelledBy}
      className={cn(
        'relative flex min-h-svh items-end px-4 pb-12 pt-[45vh]',
        'lg:items-center lg:px-[clamp(1.25rem,6vw,5.5rem)] lg:py-24',
        className,
      )}
    >
      <div className="w-full rounded-[10px] bg-surface-veil p-5 backdrop-blur-md lg:w-[min(36rem,44vw)] lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        {children}
      </div>
    </section>
  );
}
