/* R122 (owner, 2026-11-16): placeholder hammer sounds, synthesised (no recordings).
 * Writes assets/sfx/hammer_{masterwork,good,crude,dull}.wav: 16-bit mono PCM, 22050 Hz.
 * Record: specs/2026-11-16-hammer-sounds.md. Real sounds replace these files under the same names.
 * Run: node tooling/sfx/make-placeholder-sfx.mjs
 *
 * A struck metal bar rings at inharmonic partials (about 1 : 2.76 : 5.40 : 8.93), each dying away at its own rate.
 * Every sound here is a short noise burst (the hammer's contact) plus some of those partials. A fixed seed keeps the
 * files the same on every run.
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const RATE = 22050;
let seed = 20261116;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

/* partials: [ratio, level, decay seconds]; click: noise level and length; base Hz; length s; buzz: a second set detuned by this ratio */
function strike({ base, len, partials, click, clickMs, lowpass, buzz }) {
  const n = Math.round(RATE * len), out = new Float32Array(n);
  for (const [ratio, level, decay] of partials) {
    const f = base * ratio, ph = rnd() * Math.PI * 2;
    for (let i = 0; i < n; i++) { const t = i / RATE; out[i] += level * Math.exp(-t / decay) * Math.sin(2 * Math.PI * f * t + ph); }
    if (buzz) { const f2 = f * buzz; for (let i = 0; i < n; i++) { const t = i / RATE; out[i] += level * 0.6 * Math.exp(-t / decay) * Math.sin(2 * Math.PI * f2 * t); } }
  }
  /* the contact: a burst of noise, smoothed by a one-pole low-pass (lower = duller) */
  const cn = Math.round(RATE * clickMs / 1000); let y = 0;
  for (let i = 0; i < cn && i < n; i++) { y += lowpass * ((rnd() * 2 - 1) - y); out[i] += click * y * Math.exp(-i / (cn / 4)); }
  /* a 2 ms fade in (no pop) and a fade out over the last 10% */
  const fi = Math.round(RATE * 0.002), fo = Math.round(n * 0.1);
  for (let i = 0; i < fi; i++) out[i] *= i / fi;
  for (let i = 0; i < fo; i++) out[n - 1 - i] *= i / fo;
  let peak = 0; for (const v of out) peak = Math.max(peak, Math.abs(v));
  for (let i = 0; i < n; i++) out[i] = out[i] / (peak || 1) * 0.9;
  return out;
}

function wav(samples) {
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + samples.length * 2, 4); b.write('WAVE', 8);
  b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(RATE, 24); b.writeUInt32LE(RATE * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((v, i) => b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  return b;
}

const SOUNDS = {
  /* Masterwork: a bright anvil ring that carries */
  masterwork: { base: 1180, len: 1.1, click: 0.9, clickMs: 6, lowpass: 0.85,
    partials: [[1, 1.0, 0.42], [2.76, 0.7, 0.26], [5.40, 0.45, 0.14], [8.93, 0.25, 0.08], [1.5, 0.25, 0.30]] },
  /* Good: a clear clang, shorter and lower */
  good: { base: 820, len: 0.6, click: 0.9, clickMs: 7, lowpass: 0.7,
    partials: [[1, 1.0, 0.20], [2.76, 0.55, 0.12], [5.40, 0.3, 0.07]] },
  /* Crude: a flat clank that buzzes (a detuned twin) and dies fast */
  crude: { base: 430, len: 0.35, click: 1.1, clickMs: 12, lowpass: 0.45, buzz: 1.045,
    partials: [[1, 1.0, 0.09], [2.76, 0.45, 0.05], [3.9, 0.3, 0.04]] },
  /* dull: a thud with no ring (off the marks, cold metal) */
  dull: { base: 140, len: 0.15, click: 1.4, clickMs: 25, lowpass: 0.12,
    partials: [[1, 1.0, 0.035], [1.9, 0.35, 0.02]] }
};

mkdirSync('assets/sfx', { recursive: true });
for (const [name, spec] of Object.entries(SOUNDS)) {
  const file = 'assets/sfx/hammer_' + name + '.wav', data = wav(strike(spec));
  writeFileSync(file, data); console.log(file + '  ' + (data.length / 1024).toFixed(1) + ' KB');
}
