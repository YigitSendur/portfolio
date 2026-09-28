/**
 * Motion tokens. Every animation on the site takes its timing from here,
 * the same way every colour comes from the CSS tokens.
 */
export const ease = {
  out: [0.16, 1, 0.3, 1] as const, // strong ease-out, used for entrances
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const duration = {
  fast: 0.25,
  base: 0.6,
  slow: 0.9,
};

export const stagger = {
  tight: 0.06,
  base: 0.1,
};

/** How much of an element must be visible before it animates in. */
export const inView = { once: true, amount: 0.25 } as const;
