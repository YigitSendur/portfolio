/**
 * All shapes live in one float texture: each row block is one shape,
 * each texel is one particle's position in that shape.
 * uProgress = 2.4 means "40% of the way from shape 2 to shape 3".
 * Doing the interpolation on the GPU keeps the CPU work per frame
 * down to updating a handful of uniforms.
 */
export const vertexShader = /* glsl */ `
uniform sampler2D uShapes;
uniform sampler2D uColors;  // same layout; alpha = how much of the image colour to use
uniform float uRows;       // texture rows per shape
uniform float uMaxShape;   // index of the last shape
uniform float uProgress;
uniform float uIntro;      // 0 -> 1 on page load
uniform float uTime;
uniform float uMotion;     // 0 when the user prefers reduced motion
uniform vec2  uMouse;      // pointer position in world space
uniform float uMouseForce;
uniform float uSize;
uniform float uPixelRatio;

attribute vec2  aCell;     // this particle's texel column/row
attribute float aDelay;    // per-particle stagger, 0..1
attribute float aSeed;     // per-particle random for size/colour
attribute vec3  aScatter;  // random direction used for the burst

varying float vAccent;
varying float vAlpha;
varying vec4 vColor;

vec3 shapePos(float s) {
  ivec2 texel = ivec2(int(aCell.x), int(aCell.y + s * uRows));
  return texelFetch(uShapes, texel, 0).xyz;
}

vec4 shapeColor(float s) {
  ivec2 texel = ivec2(int(aCell.x), int(aCell.y + s * uRows));
  return texelFetch(uColors, texel, 0);
}

void main() {
  float p = clamp(uProgress, 0.0, uMaxShape);
  float from = floor(p);
  float to = min(from + 1.0, uMaxShape);
  float t = p - from;

  // each particle starts a bit later than the previous ones -> a wave instead of a blink
  float d = aDelay * 0.35;
  float tt = smoothstep(d, d + 0.65, t);

  vec3 pos = mix(shapePos(from), shapePos(to), tt);
  vColor = mix(shapeColor(from), shapeColor(to), tt);
  // burst outwards mid-morph, back in at the end
  pos += aScatter * sin(tt * 3.14159) * 0.55;

  // page-load: fly in from far away
  float intro = smoothstep(aDelay * 0.5, aDelay * 0.5 + 0.5, uIntro);
  pos = mix(aScatter * 6.0, pos, intro);

  // idle breathing
  pos += uMotion * 0.018 * vec3(
    sin(uTime * 0.9 + aSeed * 40.0),
    cos(uTime * 0.8 + aSeed * 31.0),
    sin(uTime * 0.7 + aSeed * 17.0)
  );

  vec4 world = modelMatrix * vec4(pos, 1.0);

  // pointer pushes particles away, like a magnet under iron filings
  vec2 away = world.xy - uMouse;
  float dist = length(away);
  float force = smoothstep(0.75, 0.0, dist) * uMouseForce;
  world.xy += normalize(away + 1e-5) * force * 0.35;
  world.z += force * 0.4;

  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed * 0.9) / -mv.z;

  vAccent = step(0.91, fract(aSeed * 7.13));
  vAlpha = intro * (0.45 + 0.4 * aSeed);
}
`;

export const fragmentShader = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uAccent;
varying float vAccent;
varying float vAlpha;
varying vec4 vColor;

void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float a = smoothstep(0.5, 0.3, r) * vAlpha;
  vec3 themed = mix(uInk, uAccent, vAccent);
  // screenshot particles keep the UI's own colour where it is strongly coloured
  gl_FragColor = vec4(mix(themed, vColor.rgb, vColor.a), a);
}
`;
