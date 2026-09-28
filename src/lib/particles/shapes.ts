/**
 * Every shape is turned into a list of 3D points (plus a colour per point):
 * - drawn shapes: drawn on a hidden 2D canvas, painted pixels are picked at random;
 * - screenshots: the real project UI is drawn on the canvas and pixels are picked
 *   with a probability based on local contrast, so text, borders and buttons get
 *   particles while flat backgrounds stay empty. Strongly coloured pixels keep
 *   their colour (a red header stays red); everything else uses the theme ink.
 * The particle system then only has to move each particle from its
 * point in shape A to its point in shape B.
 */

export type Shape = {
  positions: Float32Array; // x, y, z per particle
  colors: Uint8Array; // r, g, b, a per particle; a = 0 means "use the theme colour"
};

const SIZE = 400; // canvas resolution used for sampling
const WORLD = 3.2; // how wide a shape is in world units

type Draw = (ctx: CanvasRenderingContext2D) => void;

function rand(seed: number) {
  // small deterministic PRNG (mulberry32) so shapes look the same on every load
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleCanvas(draw: Draw, count: number, seed: number, depth?: (py: number) => number): Shape {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#000';
  ctx.strokeStyle = '#000';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  draw(ctx);

  const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
  const painted: number[] = [];
  for (let i = 0; i < SIZE * SIZE; i++) {
    if (data[i * 4 + 3] > 128) painted.push(i);
  }

  const r = rand(seed);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = painted[Math.floor(r() * painted.length)];
    const px = (p % SIZE) + r(); // +r() spreads points inside the pixel
    const py = Math.floor(p / SIZE) + r();
    out[i * 3] = (px / SIZE - 0.5) * WORLD;
    out[i * 3 + 1] = -(py / SIZE - 0.5) * WORLD;
    // a little depth so it reads as 3D when tilted; drawn diagrams can set real layers
    out[i * 3 + 2] = (depth ? depth(py) : 0) + (r() - 0.5) * 0.28;
  }
  return { positions: out, colors: new Uint8Array(count * 4) };
}

/** Screenshot of a real project UI. */
/**
 * `lift`: boost faint edges. Needed for pale UIs (light grey on white);
 * on busy, saturated UIs it would turn background gradients into noise.
 */
function sampleImage(img: HTMLImageElement, count: number, seed: number, lift = false): Shape {
  const scale = SIZE / Math.max(img.naturalWidth, img.naturalHeight);
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  // luminance and saturation per pixel
  const lum = new Float32Array(w * h);
  const sat = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4] / 255, g = data[i * 4 + 1] / 255, b = data[i * 4 + 2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    lum[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    sat[i] = max > 0.15 ? (max - min) / max : 0;
  }

  // local contrast = |pixel - blurred neighbourhood| (a high-pass filter)
  const blur = boxBlur(lum, w, h, 3);
  const weight = new Float32Array(w * h);
  let total = 0;
  for (let i = 0; i < w * h; i++) {
    const d = Math.abs(lum[i] - blur[i]);
    const edge = Math.min(1, lift ? Math.sqrt(d * 4) : d * 7);
    const colour = sat[i] > 0.55 ? 0.12 : 0; // solid, strongly coloured areas (buttons, headers)
    // the outer frame of the screenshot, so the shape reads as a screen
    const x = i % w, y = (i / w) | 0;
    const frame = x < 2 || y < 2 || x >= w - 2 || y >= h - 2 ? 1.5 : 0;
    weight[i] = edge + colour + frame;
    total += weight[i];
  }
  // cumulative distribution, sampled with binary search
  const cdf = new Float32Array(w * h);
  let acc = 0;
  for (let i = 0; i < w * h; i++) cdf[i] = acc += weight[i] / total;

  const r = rand(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Uint8Array(count * 4);
  const world = WORLD * 0.95;
  for (let i = 0; i < count; i++) {
    const u = r();
    let lo = 0, hi = cdf.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < u) lo = mid + 1;
      else hi = mid;
    }
    const px = (lo % w) + r();
    const py = Math.floor(lo / w) + r();
    positions[i * 3] = ((px - w / 2) / SIZE) * world;
    positions[i * 3 + 1] = -((py - h / 2) / SIZE) * world;
    positions[i * 3 + 2] = (r() - 0.5) * 0.12;
    if (sat[lo] > 0.35) {
      colors.set([data[lo * 4], data[lo * 4 + 1], data[lo * 4 + 2], 255], i * 4);
    }
  }
  return { positions, colors };
}

function boxBlur(src: Float32Array, w: number, h: number, radius: number): Float32Array {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const span = radius * 2 + 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) sum += src[y * w + Math.min(w - 1, Math.max(0, x + k))];
      tmp[y * w + x] = sum / span;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) sum += tmp[Math.min(h - 1, Math.max(0, y + k)) * w + x];
      out[y * w + x] = sum / span;
    }
  }
  return out;
}

/**
 * Hero: a layered architecture diagram, interface on top, API in the middle,
 * model at the bottom. Each layer sits at a different depth, so the 3D shows
 * when the pointer tilts the scene.
 */
const architecture: Draw = (ctx) => {
  const rows = [
    { y: 70, boxes: [[40, 120], [150, 100], [260, 100]] }, // interfaces
    { y: 180, boxes: [[85, 110], [205, 110]] }, // API services
    { y: 290, boxes: [[140, 120]] }, // model
  ];
  const H = 58;
  ctx.lineWidth = 9;
  for (const row of rows) {
    for (const [x, bw] of row.boxes) {
      ctx.beginPath();
      ctx.roundRect(x, row.y, bw, H, 10);
      ctx.stroke();
      // two "text lines" inside each box
      ctx.fillRect(x + 16, row.y + 18, bw * 0.55, 6);
      ctx.fillRect(x + 16, row.y + 33, bw * 0.35, 6);
    }
  }
  // connectors between layers
  ctx.lineWidth = 5;
  const links: [number, number, number, number][] = [
    [100, 128, 140, 180], [200, 128, 140, 180], [200, 128, 260, 180], [310, 128, 260, 180],
    [140, 238, 200, 290], [260, 238, 200, 290],
  ];
  for (const [x1, y1, x2, y2] of links) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
};
const layerDepth = (py: number) => (py < 150 ? 0.25 : py < 260 ? 0 : -0.25);

/** Experience (Efsora): an ultrasound scan fan, drawn as echo lines. */
const ultrasound: Draw = (ctx) => {
  const cx = 200, cy = 40;
  const a0 = Math.PI * 0.27, a1 = Math.PI * 0.73;
  ctx.lineWidth = 7;
  for (let rad = 70; rad <= 340; rad += 18) {
    ctx.beginPath();
    ctx.arc(cx, cy, rad, a0, a1);
    ctx.stroke();
  }
  ctx.lineWidth = 10;
  for (const a of [a0, a1]) {
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 60, cy + Math.sin(a) * 60);
    ctx.lineTo(cx + Math.cos(a) * 345, cy + Math.sin(a) * 345);
    ctx.stroke();
  }
};

/** Contact: an "@". */
const at: Draw = (ctx) => {
  ctx.font = '700 340px Arial, Helvetica, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('@', 200, 215);
};

export type ShapeImages = { chatbot: HTMLImageElement; slackAgent: HTMLImageElement; ticTacToe: HTMLImageElement };

/** Order must match the order of the sections on the page. */
export function buildShapes(count: number, images: ShapeImages): Shape[] {
  return [
    sampleCanvas(architecture, count, 1, layerDepth),
    sampleCanvas(ultrasound, count, 2),
    sampleImage(images.chatbot, count, 3, true),
    sampleImage(images.slackAgent, count, 4),
    sampleImage(images.ticTacToe, count, 5),
    sampleCanvas(at, count, 7),
  ];
}
