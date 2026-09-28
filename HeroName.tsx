'use client';

import { motion } from 'motion/react';
import { duration, ease } from '@/design/motion';

/**
 * The name in two widths of the same variable font: wide first names,
 * tall condensed surname. Each line rises out of its own mask on load.
 */
export function HeroName({ first, last }: { first: string; last: string }) {
  const lines = [
    { text: first, className: 'text-[clamp(2.6rem,6vw,5.4rem)] font-stretch-[125%]' },
    { text: last, className: 'mt-[0.08em] text-[clamp(4.2rem,11.5vw,10.5rem)] font-stretch-[62%]' },
  ];
  return (
    <h1 id="hero-title" className="mb-6 font-extrabold leading-[0.88] tracking-[-0.02em]">
      {lines.map((line, i) => (
        <span key={line.text} className={`block overflow-hidden pb-[0.06em] ${line.className}`}>
          <motion.span
            className="block"
            data-reveal=""
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: duration.slow, ease: ease.out, delay: 0.15 + i * 0.12 }}
          >
            {line.text}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}
