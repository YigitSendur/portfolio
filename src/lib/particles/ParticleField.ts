import * as THREE from 'three';
import { buildShapes, type ShapeImages } from './shapes';
import { vertexShader, fragmentShader } from './shaders';

export type Palette = { ink: string; accent: string };

/**
 * Owns the renderer, the scene and the render loop.
 * React only creates it, feeds it the scroll target and disposes it.
 */
export class ParticleField {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  private points: THREE.Points;
  private material: THREE.ShaderMaterial;
  private texture: THREE.DataTexture;
  private colorTexture: THREE.DataTexture;
  private last = performance.now();
  private frame = 0;

  // values React writes, the loop eases towards them
  private targetProgress = 0;
  private progress = 0;
  private pointer = new THREE.Vector2(99, 99); // far away = no push
  private pointerSmooth = new THREE.Vector2(99, 99);
  private tilt = new THREE.Vector2();
  private reducedMotion: boolean;
  private viewW = 1;
  private viewH = 1;
  private lastW = 0;
  private lastH = 0;

  constructor(canvas: HTMLCanvasElement, palette: Palette, reducedMotion: boolean, images: ShapeImages) {
    this.reducedMotion = reducedMotion;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.camera.position.set(0, 0, 6);

    // fewer particles on small screens
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    const cols = 128;
    const rows = small ? 56 : 104;
    const count = cols * rows;

    // pack every shape into two textures with the same layout, one block of rows per shape:
    // positions (float) and colours (8-bit, alpha = how much of the image colour to use)
    const shapes = buildShapes(count, images);
    const data = new Float32Array(cols * rows * shapes.length * 4);
    const colorData = new Uint8Array(cols * rows * shapes.length * 4);
    shapes.forEach((shape, s) => {
      data.set(interleave(shape.positions, count), s * count * 4);
      colorData.set(shape.colors, s * count * 4);
    });
    this.texture = new THREE.DataTexture(data, cols, rows * shapes.length, THREE.RGBAFormat, THREE.FloatType);
    this.colorTexture = new THREE.DataTexture(colorData, cols, rows * shapes.length, THREE.RGBAFormat, THREE.UnsignedByteType);
    for (const t of [this.texture, this.colorTexture]) {
      t.minFilter = t.magFilter = THREE.NearestFilter;
      t.needsUpdate = true;
    }

    // per-particle attributes
    const cell = new Float32Array(count * 2);
    const delay = new Float32Array(count);
    const seed = new Float32Array(count);
    const scatter = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      cell[i * 2] = i % cols;
      cell[i * 2 + 1] = Math.floor(i / cols);
      delay[i] = Math.random();
      seed[i] = Math.random();
      const dir = new THREE.Vector3().randomDirection();
      scatter.set([dir.x, dir.y, dir.z], i * 3);
    }
    const geometry = new THREE.BufferGeometry();
    // three needs a position attribute to know how many vertices to draw
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute('aCell', new THREE.BufferAttribute(cell, 2));
    geometry.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geometry.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3));
    // positions come from the texture, so the default bounding sphere is wrong
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uShapes: { value: this.texture },
        uColors: { value: this.colorTexture },
        uRows: { value: rows },
        uMaxShape: { value: shapes.length - 1 },
        uProgress: { value: 0 },
        uIntro: { value: reducedMotion ? 1 : 0 },
        uTime: { value: 0 },
        uMotion: { value: reducedMotion ? 0 : 1 },
        uMouse: { value: this.pointerSmooth },
        uMouseForce: { value: reducedMotion ? 0 : 1 },
        uSize: { value: small ? 20 : 23 },
        uPixelRatio: { value: 1 },
        uInk: { value: new THREE.Color(palette.ink) },
        uAccent: { value: new THREE.Color(palette.accent) },
      },
    });

    this.points = new THREE.Points(geometry, this.material);
    this.scene.add(this.points);

    this.resize();
    this.loop();
  }

  setProgress(value: number) {
    this.targetProgress = value;
  }

  /** x, y in normalized device coordinates (-1..1) */
  setPointer(x: number, y: number) {
    this.pointer.set((x * this.viewW) / 2, (y * this.viewH) / 2);
    this.tilt.set(x, y);
  }

  clearPointer() {
    this.pointer.set(99, 99);
    this.tilt.set(0, 0);
  }

  setPalette(palette: Palette) {
    (this.material.uniforms.uInk.value as THREE.Color).set(palette.ink);
    (this.material.uniforms.uAccent.value as THREE.Color).set(palette.accent);
  }

  /**
   * Sized from the canvas element, which is 100lvh tall (the largest viewport
   * height). On phones the address bar shows and hides while scrolling and
   * changes window.innerHeight each time; the canvas height does not, so the
   * scene no longer jumps. Calls with an unchanged size do nothing.
   */
  resize() {
    const canvas = this.renderer.domElement;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (w === this.lastW && h === this.lastH) return;
    this.lastW = w;
    this.lastH = h;
    const dpr = Math.min(window.devicePixelRatio, 1.75);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.material.uniforms.uPixelRatio.value = dpr;

    // size of the visible area at z = 0, in world units
    this.viewH = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.position.z;
    this.viewW = this.viewH * this.camera.aspect;

    // wide screens: object sits in the right half next to the text
    // narrow screens: object sits at the top, behind the text
    if (w >= 1024) { // Tailwind 'lg' breakpoint
      this.points.position.set(this.viewW * 0.25, 0, 0);
      this.points.scale.setScalar(Math.min(0.95, this.viewH / 4.6, this.viewW / 7.2));
    } else {
      this.points.position.set(0, this.viewH * 0.2, 0);
      this.points.scale.setScalar(Math.min(0.75, this.viewW / 4.2));
    }
  }

  private loop = () => {
    this.frame = requestAnimationFrame(this.loop);
    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    const u = this.material.uniforms;
    u.uTime.value += dt;

    if (!this.reducedMotion && u.uIntro.value < 1) {
      u.uIntro.value = Math.min(1, u.uIntro.value + dt / 2.2);
    }

    // frame-rate independent easing towards the scroll target
    const ease = 1 - Math.exp(-dt * (this.reducedMotion ? 30 : 5));
    this.progress += (this.targetProgress - this.progress) * ease;
    u.uProgress.value = this.progress;

    if (!this.reducedMotion) {
      this.pointerSmooth.lerp(this.pointer, 1 - Math.exp(-dt * 8));
      this.points.rotation.y += (this.tilt.x * 0.35 + Math.sin(u.uTime.value * 0.2) * 0.12 - this.points.rotation.y) * ease;
      this.points.rotation.x += (-this.tilt.y * 0.25 - this.points.rotation.x) * ease;
    }

    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    cancelAnimationFrame(this.frame);
    this.points.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
    this.colorTexture.dispose();
    this.renderer.dispose();
  }
}

/** xyz per particle -> xyzw per texel (w unused) */
function interleave(xyz: Float32Array, count: number): Float32Array {
  const out = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    out[i * 4] = xyz[i * 3];
    out[i * 4 + 1] = xyz[i * 3 + 1];
    out[i * 4 + 2] = xyz[i * 3 + 2];
    out[i * 4 + 3] = 1;
  }
  return out;
}
