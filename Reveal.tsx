'use client';

import { motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';
import { duration, ease, inView, stagger } from '@/design/motion';

const container: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: stagger.base } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
};

const tags = { div: motion.div, ul: motion.ul, ol: motion.ol, li: motion.li, p: motion.p, dl: motion.dl };
type Tag = keyof typeof tags;

type Props = { children: ReactNode; className?: string; as?: Tag };

/** Animates its RevealItem children in one after another when scrolled into view. */
export function Reveal({ children, className, as = 'div' }: Props) {
  const Component = tags[as];
  return (
    <Component className={className} variants={container} initial="hidden" whileInView="shown" viewport={inView}>
      {children}
    </Component>
  );
}

/** One step of a Reveal sequence. Must be a descendant of Reveal. */
export function RevealItem({ children, className, as = 'div' }: Props) {
  const Component = tags[as];
  return (
    <Component className={className} variants={item} data-reveal="">
      {children}
    </Component>
  );
}
