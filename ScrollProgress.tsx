'use client';

import { motion, useScroll, useSpring } from 'motion/react';

/** Thin accent bar at the top of the screen showing how far down the page you are. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-20 h-0.5 origin-left bg-accent"
      style={{ scaleX }}
    />
  );
}
