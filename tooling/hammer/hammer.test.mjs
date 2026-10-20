/* Hammer hit points (r209), guarded against drift.
 *
 * The recorded values live in specs/2026-10-01-hammer-hit-points.md. The build keeps them in ONE
 * object, HM_HITS, between the HAMMER-HITS markers, and the pure rules (grade, band, placement)
 * between the HAMMER-PURE markers. This test reads both OUT OF THE SHIPPED HTML.
 * Run: node tooling/hammer/hammer.test.mjs
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const HTML = 'Swordforge_looptest_landscape.html';
const src = readFileSync(HTML, 'utf8');

const cfg = src.match(/\/\* HAMMER-HITS-BEGIN \*\/([\s\S]*?)\/\* HAMMER-HITS-END \*\//);
assert.ok(cfg, 'HAMMER-HITS markers not found in ' + HTML);
const pure = src.match(/\/\* HAMMER-PURE-BEGIN \*\/([\s\S]*?)\/\* HAMMER-PURE-END \*\//);
assert.ok(pure, 'HAMMER-PURE markers not found in ' + HTML);
const M = new Function(cfg[1] + pure[1] + '; return { HM_HITS, hmGrade, hmBand, hmPlacePoints, hmHeatColor };')();
const { HM_HITS } = M;

let n = 0;
function eq(label, got, want) { assert.deepStrictEqual(got, want, label); n++; console.log('  ok   ' + label); }

/* the record */
eq('orbStrikes', HM_HITS.orbStrikes, 3);
eq('midPoints', HM_HITS.midPoints, 3);
eq('size (diameter, % of stage width)', HM_HITS.size, 5);
eq('bands', HM_HITS.bands, [
  { name: 'Masterwork', min: 0.85, mul: 1.3 },
  { name: 'Good',       min: 0.60, mul: 1.0 },
  { name: 'Crude',      min: 0,    mul: 0.8 } ]);
eq('skip quality', HM_HITS.skip, 'Good');
eq('unforged quality', HM_HITS.unforged, 'Good');
eq('inset (fraction of the radius that must be on metal)', HM_HITS.inset, 0.6);
eq('gap (min spacing, in diameters)', HM_HITS.gap, 1.6);
eq('ring at rest (% of stage)', HM_HITS.ring, { x: 55, y: 46.5 });   /* owner, 2026-10-01: further from the head */
/* r219 (owner, 2026-10-06): the marks show the heat as a smooth gradient - yellow hot, orange, red, grey cold */
eq('heat colour stops', HM_HITS.heat, [
  { h: 1.00, c: [255, 224, 58] },    /* yellow */
  { h: 0.70, c: [255, 140, 26] },    /* orange */
  { h: 0.45, c: [232, 50, 30] },     /* red */
  { h: 0.35, c: [200, 205, 212] } ]);   /* grey: HM_FORGE.workMin, below it a strike does not count */
eq('colour at each stop', [1, 0.7, 0.45, 0.35].map(M.hmHeatColor), [[255, 224, 58], [255, 140, 26], [232, 50, 30], [200, 205, 212]]);
eq('colour blends between stops', M.hmHeatColor(0.85), [255, 182, 42]);
eq('colour clamps: above hot, below cold', [M.hmHeatColor(1.4), M.hmHeatColor(0.1)], [[255, 224, 58], [200, 205, 212]]);
eq('marks recolour as the heat changes', src.includes('function hmPtsHeat(){') && src.includes('hmRender(); hmHeatWatch(); hmPtsHeat(); }'), true);

/* accuracy: 1 at the centre, 0 where the circles only touch, never below 0 */
eq('grade centre', M.hmGrade(0, 50), 1);
eq('grade half', M.hmGrade(25, 50), 0.5);
eq('grade touching', M.hmGrade(50, 50), 0);
eq('grade outside', M.hmGrade(80, 50), 0);

/* bands, with the edges on the right side */
eq('band 0.85', M.hmBand(0.85).name, 'Masterwork');
eq('band 0.849', M.hmBand(0.849).name, 'Good');
eq('band 0.60', M.hmBand(0.60).name, 'Good');
eq('band 0.599', M.hmBand(0.599).name, 'Crude');
eq('band 0', M.hmBand(0).name, 'Crude');

/* placement: a seeded rng and a fake blade (a diagonal strip) */
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const strip = (u, v) => Math.abs(u - v) < 0.06 && u > 0.2 && u < 0.8;   /* the blade: u = v, 0.12 wide */
const r = 0.03;
let allOk = true, spaced = true, differs = false, prev = null;
for (let seed = 1; seed <= 40; seed++) {
  const pts = M.hmPlacePoints(3, strip, r, HM_HITS.inset, HM_HITS.gap, rng(seed));
  if (pts.length !== 3) allOk = false;
  for (const p of pts) {
    if (!strip(p.u, p.v)) allOk = false;
    for (let a = 0; a < 12; a++) { const t = a * Math.PI / 6;
      if (!strip(p.u + r * HM_HITS.inset * Math.cos(t), p.v + r * HM_HITS.inset * Math.sin(t))) allOk = false; }
  }
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++)
    if (Math.hypot(pts[i].u - pts[j].u, pts[i].v - pts[j].v) < HM_HITS.gap * 2 * r - 1e-9) spaced = false;
  const key = JSON.stringify(pts); if (prev && key !== prev) differs = true; prev = key;
}
eq('placement: 3 points, all on the metal (centre and inset circle)', allOk, true);
eq('placement: points at least gap diameters apart', spaced, true);
eq('placement: random every time', differs, true);
/* too small for the spacing: it still places 3 on the metal */
const tiny = (u, v) => Math.abs(u - 0.5) < 0.04 && Math.abs(v - 0.5) < 0.04;
const t3 = M.hmPlacePoints(3, tiny, 0.02, HM_HITS.inset, HM_HITS.gap, rng(7));
eq('placement: crowded blade still gets 3 points', t3.length === 3 && t3.every(p => tiny(p.u, p.v)), true);

/* wiring in the build */
eq('D15a follows D15', (() => { const k = [...src.matchAll(/\n\s*(D\d+[a-z]?): "/g)].map(x => x[1]); return k[k.indexOf('D15a') - 1]; })(), 'D15');
eq('D15a text', (src.match(/\n\s*D15a: "([^"]*)"/) || [])[1], 'Line up the ring on the hammer with the glowing mark, then tap the hammer.');
eq('price uses the forging band', /function swordBase\(w\)\{[^}]*hmForgeMul\(w\)/.test(src), true);
eq('ring colour follows the band', /function hmRingPaint\(\)\{[\s\S]{0,700}hmBand\(hmGrade\(/.test(src), true);
eq('skip gives the skip quality', /function hmSkip\(\)\{[\s\S]{0,400}HM_HITS\.skip/.test(src), true);

/* r226 (owner, 2026-10-06): the accuracy popup is bigger, lasts twice as long, and rises almost to the top before it fades */
eq('popup size and time', src.includes('font: bold 26px/1 Georgia, serif;') && src.includes('animation: hmAcc 1.6s'), true);
eq('popup rises to near the top of the scene', src.includes("t.style.setProperty('--rise', Math.max(0, (at.y-4-HM_ACC_TOP)/100*sc.height).toFixed(0)+'px');") && src.includes('const HM_ACC_TOP=10;'), true);
/* r277 (owner, 2026-10-20): a press goes to what is under the finger - the hammer's pixels, else the metal's, else through */
eq('touch slack (screen px, Claude\'s proposal)', HM_HITS.touch, { hammer: 6, metal: 8 });
{ const P = new Function(cfg[1] + pure[1] + '; return { hmMaskHit, hmPickTarget };')();
  const w = 20, h = 10, a = new Uint8Array(w * h); for (let x = 8; x < 12; x++) a[5 * w + x] = 1;   /* a 4-pixel bar on row 5 */
  const m = { w, h, a };
  eq('mask hit: on the art', P.hmMaskHit(m, 9.5 / w, 5.5 / h, 0), true);
  eq('mask hit: off the art, no slack', P.hmMaskHit(m, 9.5 / w, 1.5 / h, 0), false);
  eq('mask hit: off the art, inside the slack', P.hmMaskHit(m, 9.5 / w, 2.5 / h, 3), true);
  eq('mask hit: off the art, beyond the slack', P.hmMaskHit(m, 9.5 / w, 1.5 / h, 3), false);
  eq('mask hit: outside the image', P.hmMaskHit(m, 1.5, 0.5, 2), false);
  eq('the hammer wins a press on both', P.hmPickTarget(true, true), 'hammer');
  eq('the metal alone', P.hmPickTarget(false, true), 'work');
  eq('neither: the press is not taken', P.hmPickTarget(false, false), null); }
eq('one handler on the scene routes every press (capture)', /function wireHmTouch\(\)\{[\s\S]{0,700}hmPickTarget\(hmOnHammer\(e\.clientX,e\.clientY\), hmOnWork\(e\.clientX,e\.clientY\)\)[\s\S]{0,200}\}, true\);/.test(src), true);
eq('the hammer is hit on its own alpha, through its live transform', /function hmOnHammer\(x,y\)\{[\s\S]{0,500}hmLocalUV\(h,x,y\)[\s\S]{0,200}hmMaskHit\(/.test(src) && /function hmLocalUV\(el, x, y\)\{[\s\S]{0,700}getComputedStyle\(el\)[\s\S]{0,300}\.inverse\(\)/.test(src), true);
eq('the metal: the orb circle, then the blades\' alpha, each while it shows', /function hmOnWork\(x,y\)\{[\s\S]{0,300}hmOrb[\s\S]{0,500}\['hmRough','hmFinal'\][\s\S]{0,400}hmMaskHit\(/.test(src), true);
eq('the old box pads take no presses', ['#hmAimPad {', '#hmGrip {', '#hmStrikePad {'].every(s => { const i = src.indexOf(s); return i >= 0 && /pointer-events: none;/.test(src.slice(i, src.indexOf('}', i))); }), true);
console.log('[hammer] GREEN / ' + n + ' checks');
