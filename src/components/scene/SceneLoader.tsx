'use client';

import dynamic from 'next/dynamic';

/**
 * three.js is ~130 kB gzipped. Loading it with ssr: false keeps it out of the
 * server HTML and the first JS bundle, so the text is readable before WebGL starts.
 */
const Scene = dynamic(() => import('./Scene'), { ssr: false });

export function SceneLoader() {
  return <Scene />;
}
