'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

/** Every Framer Motion animation respects the OS "reduce motion" setting. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
