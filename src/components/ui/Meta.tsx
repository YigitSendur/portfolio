import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Small muted line: dates, company names, notes. */
export function Meta({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-[0.95rem] text-muted', className)}>{children}</p>;
}
