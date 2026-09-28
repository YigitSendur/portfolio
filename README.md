# Portfolio — İsmail Yiğit Şendur

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Three.js with a hand-written GLSL shader.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Deploy
Push to GitHub; Vercel builds it automatically. If the Vercel project was created for the earlier Vite version, set
Settings → Build and Deployment → Framework Preset to **Next.js** (and clear any custom Output Directory) once.

## Project structure

```
src/
  app/            layout.tsx (font, metadata, viewport), page.tsx (composes sections), globals.css (design tokens)
  content/        content.ts: every piece of text, and the chapter list
  design/         motion.ts: motion tokens (easings, durations, stagger)
  components/
    ui/           reusable building blocks: Chapter, ChapterTitle, Reveal/RevealItem, BulletList, TextLink, Meta
    layout/       SiteHeader, ChapterNav, ScrollProgress, MotionProvider
    sections/     Hero, Experience (+ Timeline), ProjectChapter, Also — built only from ui/ pieces
    scene/        Scene (WebGL lifecycle), SceneLoader (next/dynamic, ssr: false)
  lib/particles/  ParticleField (Three.js), shaders.ts (GLSL), shapes.ts (shape sampling)
```

## How it works

### Design tokens (`app/globals.css`)
Two layers. **Primitive tokens** are the raw palette (`--fog-100`, `--cobalt-600`…); nothing in the UI uses them directly. **Semantic tokens** say what a value is for (`--surface`, `--ink`, `--muted`, `--rule`, `--accent`, `--particle`). Dark mode (following the system setting) only re-points the semantic layer. Tailwind v4's `@theme inline` turns the semantic tokens into utilities (`bg-surface`, `text-ink`, `border-rule`, `text-accent`), so components never contain a hex value. The WebGL scene reads `--particle` and `--accent` with `getComputedStyle`, so the canvas follows the same theme. Motion has tokens too (`design/motion.ts`): every animation takes its easing and duration from there.

### Component architecture
- `ui/` components know nothing about the content. `Chapter` is a full-screen section: it sets `data-shape` for the particle scene and handles the phone vs desktop layout in one place.
- `sections/` compose `ui/` pieces with data from `content.ts`. Adding a project means adding an object to `projects` (and a shape in the same position in `shapes.ts`); the chapter, navigation item and particle shape all follow from it.
- Server Components by default. Only what needs the browser is a Client Component (`'use client'`): the animated pieces, the chapter nav (IntersectionObserver) and the WebGL scene.

### Framer Motion
- `Reveal` / `RevealItem`: variants with `staggerChildren`, triggered by `whileInView`.
- `ChapterTitle` and `HeroName`: text slides up out of an `overflow: hidden` mask. The mask element is what's observed; the text starts fully clipped, so observing it would never fire.
- `ChapterNav`: the active underline is one element moved between items with `layoutId` (shared layout animation).
- `ScrollProgress`: `useScroll` + `useSpring` drive `scaleX`.
- `MotionConfig reducedMotion="user"` turns transform animations off for users who ask for reduced motion.

### Particles (`lib/particles`)
1. **Shapes** (`shapes.ts`): two kinds.
   - *Drawn shapes* (hero architecture diagram, ultrasound fan, @): drawn on a hidden 400×400 canvas; `getImageData` reads the pixels back and painted pixels are picked with a seeded PRNG. The diagram's layers get different depths, so the 3D shows when the pointer tilts the scene.
   - *Screenshots* (the three projects, `public/shapes/*.webp`): the real UI is drawn on the canvas and a high-pass filter (pixel luminance minus a box-blurred copy) measures local contrast. Pixels are sampled in proportion to that contrast through a cumulative distribution and binary search, so text, borders and buttons get particles while flat backgrounds stay empty. Strongly saturated pixels keep their colour (the red chatbot header stays red); everything else uses the theme colour, so the shapes work in light and dark mode.
2. **Two textures**: all positions are packed into one float `DataTexture` and all colours into an 8-bit one with the same layout, one block of rows per shape. Each particle only carries its texel coordinates.
3. **GPU morph**: one uniform, `uProgress` (2.4 = 40% from shape 2 to 3). The vertex shader reads both positions with `texelFetch` and mixes them (and their colours), with a per-particle delay (wave) and a `sin(t·π)` burst mid-morph. CPU work per frame is a few uniforms regardless of particle count.
4. **Scroll → progress** (`scene/Scene.tsx`): the scroll position where each chapter is centred is measured; between two centres the value moves k → k+1 through a smoothstep that holds still near both ends. The render loop eases towards it with `1 − exp(−dt·k)` (frame-rate independent).
5. **Pointer**: converted to world coordinates at z = 0; the shader pushes nearby particles away. Touch is ignored.

### Performance and accessibility
- Three.js is loaded with `next/dynamic` + `ssr: false`: not in the server HTML or the first bundle.
- Variable font self-hosted with `next/font/local`, subset to Latin + Turkish (112 kB for every weight and width).
- `next/image` for the screenshot (responsive sizes, lazy loading).
- Pixel ratio capped at 1.75, fewer particles on small screens, no WebGL → normal document.
- Skip link, visible focus styles, `aria-current` on the active chapter, content visible without JS.

## Content still to add
`src/content/content.ts`: the SOLID talk PDF (`public/solid-design-patterns.pdf`, then set its `href`).
