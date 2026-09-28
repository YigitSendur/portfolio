import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Props = { href: string; children: ReactNode; className?: string };

/** Accent-coloured link; opens external URLs in a new tab. */
export function TextLink({ href, children, className }: Props) {
  const external = /^https?:\/\//.test(href) || href.endsWith('.pdf');
  return (
    <a
      href={href}
      className={cn('font-semibold text-accent underline', className)}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
    </a>
  );
}

/** A wrapping row of TextLinks. */
export function LinkRow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('mt-6 flex flex-wrap gap-x-6 gap-y-2', className)}>{children}</p>;
}
