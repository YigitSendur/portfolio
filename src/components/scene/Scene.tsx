'use client';

import { useEffect, useRef } from 'react';
import { ParticleField, type Palette } from '@/lib/particles/ParticleField';
import type { ShapeImages } from '@/lib/particles/shapes';

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  return {
    ink: css.getPropertyValue('--particle').trim(),
    accent: css.getPropertyValue('--accent').trim(),
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;
  return img.decode().then(() => img);
}

/** Screenshots the project shapes are sampled from (~27 kB in total). */
async function loadShapeImages(): Promise<ShapeImages> {
  const [chatbot, slackAgent, ticTacToe] = await Promise.all([
    loadImage('/shapes/chatbot.webp'),
    loadImage('/shapes/slack-agent.webp'),
    loadImage('/shapes/tic-tac-toe.webp'),
  ]);
  return { chatbot, slackAgent, ticTacToe };
}

/**
 * Maps the scroll position to a shape index.
 * Each section "owns" the moment it is centred in the viewport; between two
 * centres the value moves from k to k+1, holding still near both ends so
 * a shape stays readable while its section is on screen.
 */
function progressFromScroll(centres: number[]): number {
  const y = window.scrollY;
  if (y <= centres[0]) return 0;
  for (let k = 0; k < centres.length - 1; k++) {
    const a = centres[k];
    const b = centres[k + 1];
    if (y < b) {
      const t = (y - a) / (b - a);
      const hold = Math.min(1, Math.max(0, (t - 0.2) / 0.6));
      return k + hold * hold * (3 - 2 * hold); // smoothstep
    }
  }
  return centres.length - 1;
}

export default function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let field: ParticleField | null = null;
    let disposed = false;

    let centres: number[] = [];
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      centres = [...document.querySelectorAll<HTMLElement>('[data-shape]')].map((el) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        return Math.min(max, Math.max(0, top + el.offsetHeight / 2 - window.innerHeight / 2));
      });
    };
    const onScroll = () => field?.setProgress(progressFromScroll(centres));
    const onResize = () => {
      field?.resize();
      measure();
      onScroll();
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return; // touch: no magnet, scrolling only
      field?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    };
    const onLeave = () => field?.clearPointer();
    // re-read the colour tokens when the system switches between light and dark
    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    const onScheme = () => field?.setPalette(readPalette());

    loadShapeImages()
      .then((images) => {
        if (disposed) return;
        field = new ParticleField(canvas, readPalette(), reduced, images);
        measure();
        onScroll();
      })
      .catch(() => {
        // no WebGL (or images failed): the page still works as a normal document
        document.documentElement.classList.add('no-webgl');
      });

    measure();
    // fonts and images change section heights after first paint
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(document.body);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointer);
    document.addEventListener('pointerleave', onLeave);
    scheme.addEventListener('change', onScheme);

    return () => {
      disposed = true;
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('pointerleave', onLeave);
      scheme.removeEventListener('change', onScheme);
      field?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-scene=""
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 size-full"
    />
  );
}
