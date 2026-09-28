import type { ReactNode } from 'react';
import { Reveal, RevealItem } from '@/components/ui/Reveal';
import { Meta } from '@/components/ui/Meta';

/** Vertical line joining a sequence of entries. */
export function Timeline({ children }: { children: ReactNode }) {
  return (
    <Reveal as="ol" className="m-0 list-none border-l border-rule pl-6">
      {children}
    </Reveal>
  );
}

type ItemProps = { title: string; meta: string; children: ReactNode };

export function TimelineItem({ title, meta, children }: ItemProps) {
  return (
    <RevealItem
      as="li"
      className="relative mb-8 last:mb-0 before:absolute before:-left-[calc(1.5rem+4px)] before:top-[0.45rem] before:size-[7px] before:rounded-full before:bg-accent"
    >
      <h3 className="text-lg font-bold font-stretch-[105%] leading-snug">{title}</h3>
      <Meta className="mb-2 mt-0.5">{meta}</Meta>
      {children}
    </RevealItem>
  );
}
