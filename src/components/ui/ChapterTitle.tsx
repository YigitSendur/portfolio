'use client';

import { motion, type Variants } from 'motion/react';
import { duration, ease, inView } from '@/design/motion';
import { cn } from '@/lib/cn';

type Props = { id: string; children: string; className?: string; level?: 1 | 2 };

const line: Variants = {
  hidden: { y: '105%' },
  shown: { y: 0, transition: { duration: duration.slow, ease: ease.out } },
};

/**
 * Large condensed heading that slides up out of a mask.
 * The heading (the mask) is what gets observed: the text inside starts
 * fully clipped, so observing the text itself would never trigger.
 */
export function ChapterTitle({ id, children, className, level = 2 }: Props) {
  const Heading = level === 1 ? motion.h1 : motion.h2;
  return (
    <Heading
      id={id}
      initial="hidden"
      whileInView="shown"
      viewport={inView}
      className={cn('mb-5 overflow-hidden pb-[0.06em] text-display font-bold font-stretch-[62%] tracking-[-0.01em]', className)}
    >
      <motion.span className="block" data-reveal="" variants={line}>
        {children}
      </motion.span>
    </Heading>
  );
}
