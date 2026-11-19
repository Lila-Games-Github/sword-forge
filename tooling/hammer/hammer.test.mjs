/* Hammer hit points (r209), guarded against drift.
 *
 * The recorded values live in specs/2026-10-01-hammer-hit-points.md. The build keeps them in ONE
 * object, HM_HITS, between the HAMMER-HITS markers, and the pure rules (grade, band, placement)
 * between the HAMMER-PURE markers. This test reads both OUT OF THE SHIPPED HTML.
 * Run: node tooling/hammer/hammer.test.mjs
 */
import { readFileSync } from 'node:fs';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const HTML = 'Swordforge_looptest_landscape.html';
const src = readFileSync(HTML, 'utf8');

const cfg = src.match(/\/\* HAMMER-HITS-BEGIN \*\/([\s\S]*?)\/\* HAMMER-HITS-END \*\//);
assert.ok(cfg, 'HAMMER-HITS markers not found in ' + HTML);
const pure = src.match(/\/\* HAMMER-PURE-BEGIN \*\/([\s\S]*?)\/\* HAMMER-PURE-END \*\//);
assert.ok(pure, 'HAMMER-PURE markers not found in ' + HTML);
const M = new Function(cfg[1] + pure[1] + '; return { HM_HITS, hmGrade, hmBand, hmPlacePoints, hmHeatColor, hmAccMul: typeof hmAccMul === "function" ? hmAccMul : () => NaN };')();
const { HM_HITS } = M;

let n = 0;
function eq(label, got, want) { assert.deepStrictEqual(got, want, label); n++; console.log('  ok   ' + label); }

/* the record */
eq('orbStrikes', HM_HITS.orbStrikes, 3);
eq('midPoints', HM_HITS.midPoints, 3);
eq('size (diameter, % of stage width)', HM_HITS.size, 5);
eq('bands (R92: labels only, no price)', HM_HITS.bands, [
  { name: 'Masterwork', min: 0.85 },
  { name: 'Good',       min: 0.60 },
  { name: 'Crude',      min: 0 } ]);
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
eq('D15a text (r283, owner)', (src.match(/\n\s*D15a: "([^"]*)"/) || [])[1], 'Pick up your hammer, line up the ring on the hammer with the glowing mark, then tap the hammer.');
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
/* R92 (owner, 2026-11-05): the price follows the accuracy percent - the curve to 80%, then a row a percent to x1.3 */
eq('R92: HM_HITS.price is the recorded curve and table', HM_HITS.price, { lo: 0.8, knee: 1.0, k: 4, top: [
  1.010, 1.021, 1.032, 1.043, 1.055, 1.068, 1.081, 1.095, 1.109, 1.124, 1.139, 1.155, 1.171, 1.188, 1.205, 1.223, 1.242, 1.261, 1.280, 1.300] });
{ const mul = M.hmAccMul, r3 = x => +x.toFixed(3);
  eq('R92: the curve\'s ends and examples (0, 40, 60, 70, 75, 79, 80%)', [0, .4, .6, .7, .75, .79, .8].map(a => r3(mul(a))), [0.8, 0.824, 0.871, 0.92, 0.955, 0.99, 1]);
  eq('R92: 81-100% read the table', [.81, .85, .9, .95, .99, 1].map(mul), [1.010, 1.055, 1.124, 1.205, 1.280, 1.300]);
  eq('R92: the percent is rounded as the popups round it', [mul(0.805), mul(0.8049), mul(0.996)], [1.010, 1, 1.300]);
  eq('R92: clamped to 0-100%', [mul(-0.2), mul(1.4)], [0.8, 1.3]);
  const P = [...Array(101).keys()];
  eq('R92: every percent raises the multiplier', P.slice(1).filter(p => !(mul(p / 100) > mul((p - 1) / 100))), []);
  eq('R92: each step from 80% is bigger than the last', P.slice(82).filter(p => !(r3(mul(p / 100) - mul((p - 1) / 100)) >= r3(mul((p - 1) / 100) - mul((p - 2) / 100)))), []);
  eq('R92: from 80%, every percent adds gold on a 100g base (and on 150g, 237g)', [100, 150, 237].map(b => P.slice(81).filter(p => !(Math.floor(b * mul(p / 100)) > Math.floor(b * mul((p - 1) / 100))))), [[], [], []]); }
{ const s2 = src.replace(/\r\n/g, '\n'), i = s2.indexOf('function hmForgeMul('), body = i < 0 ? '' : s2.slice(i, s2.indexOf('\n', i));
  const fm = new Function('hmAccMul', body + '; return hmForgeMul;')(M.hmAccMul);
  eq('R92: hmForgeMul - the accuracy when there is one, else x1.0 (skip, unforged pages, old saves)',
    [fm({ forge: 0.9, quality: 'Good' }), fm({ forge: 0, quality: 'Crude' }), fm({ quality: 'Masterwork' }), fm({ forge: null }), fm(null)], [1.124, 0.8, 1, 1, 1]); }
/* R121 (owner, 2026-11-14): the quick hammer for book crafts - specs/2026-11-14-quick-hammer.md */
{ const s3 = src.replace(/\r\n/g, '\n'), q = s3.match(/\/\* HAMMER-QUICK-BEGIN \*\/([\s\S]*?)\/\* HAMMER-QUICK-END \*\//);
  eq('R121: the quick hammer block is in the build', !!q, true);
  const Q = q ? new Function(q[1] + '; return { HM_QUICK_CFG, hmQuickProg };')() : {};
  eq('R121: HM_QUICK_CFG (the record)', Q.HM_QUICK_CFG, { orbTaps: 3, midTaps: 3, sway: 4, swayMs: 1800, gap: 170, endMs: 700 });
  eq('R121: six taps - 3 shape the orb, 3 the mid-blade; never past the blade', [0, 1, 2, 3, 4, 5, 6, 7].map(t => +Q.hmQuickProg(t).toFixed(3)), [0, 0.333, 0.667, 1, 1.333, 1.667, 2, 2]);
  eq('R121: CRAFT 1 opens the quick hammer after the shape window; the sword (and the ore) only at its end',
    s3.includes('    SHAPE_CB=(shape)=>{ SHAPE_CB=null; hmQuickOpen(shape, rSkin, ()=>{   /* R121: the quick hammer first */\n        spendTally(need);'), true);
  eq('R121: the trait card\'s CRAFT 1 goes the same way', s3.includes('function tcCraft1(){ closeTraitCard(); cbCraft(1); }'), true);
  eq('R121: the page\'s quality, as before', s3.includes("quality:(r.forge ? r.forge.quality : HM_HITS.unforged), forge:(r.forge ? r.forge.acc : null),"), true);
  eq('R121: no marks, no ring, no swing arrow, no mug, no drag pads in the quick hammer',
    s3.includes('#sfHammerModal.hm-quick #hmPoints, #sfHammerModal.hm-quick #hmRing, #sfHammerModal.hm-quick #hmSwing, #sfHammerModal.hm-quick #hmGrip,\n#sfHammerModal.hm-quick #hmAimPad, #sfHammerModal.hm-quick #hmStrikePad, #sfHammerModal.hm-quick #hmMug { display: none !important; }'), true);
  eq('R121: over the craft book it is opened from (as the shape window is)', s3.includes('#sfHammerModal.hm-quick { z-index: 1010; }'), true);
  eq('R121: a tap anywhere strikes (the scene and the window around it), buttons excepted',
    [s3.includes("    sc.addEventListener('pointerdown', e=>{ if(HM_QUICK){ if(e.target.closest && e.target.closest('button')) return; e.stopPropagation(); e.preventDefault(); hmQuickTap(); return; }"),
     s3.includes("    md.addEventListener('pointerdown', e=>{ if(!HM_QUICK || (e.target.closest && e.target.closest('button'))) return; e.preventDefault(); hmQuickTap(); });")], [true, true]);
  eq('R121: the dragon breathes by himself and sways; the heat stays full; the tutorial\'s minigame hooks stay out',
    s3.includes("    if(HM_QUICK){ hmQuickSway(ts); hmHeat=1; if(hmShow!==hmProg){ const st=2.5*dt; hmShow = Math.abs(hmProg-hmShow)<=st ? hmProg : hmShow+Math.sign(hmProg-hmShow)*st; } hmRender(); return; }"), true);
  eq('R121: the blade picture is the recipe\'s', s3.includes('function hmBladeFile(){ if(HM_QUICK) return bladeFor(HM_QUICK.skin, hmShape);   /* R121 */'), true);
  eq('R121: SKIP HAMMER and Cancel', [s3.includes('function smShaped(){ if(HM_QUICK){ hmQuickEnd(); return; }   /* R121: SKIP HAMMER in the quick hammer */'),
    s3.includes("function hmCancel(){ if(HM_QUICK){ hmQuickClose(); toast('Crafting cancelled. Nothing was spent.'); return; }   /* R121 */")], [true, true]);
  eq('R121: the full minigame drops quick mode', s3.includes("function openHammer(){ hmQuickClose(true);   /* R121 */"), true); }
/* R122 (owner, 2026-11-16): hammer sounds, placeholders - specs/2026-11-16-hammer-sounds.md */
{ const s4 = src.replace(/\r\n/g, '\n'), b = s4.match(/\/\* HAMMER-SFX-BEGIN \*\/([\s\S]*?)\/\* HAMMER-SFX-END \*\//);
  eq('R122: the sound block is in the build', !!b, true);
  const S = b ? new Function(cfg[1] + pure[1] + b[1] + '; return { HM_SFX, hmSfxKey };')() : {};
  eq('R122: HM_SFX (the record)', S.HM_SFX, { dir: 'assets/sfx/', vol: 0.8, quick: 'Good',
    files: { Masterwork: 'hammer_masterwork.wav', Good: 'hammer_good.wav', Crude: 'hammer_crude.wav', dull: 'hammer_dull.wav' } });
  eq('R122: a graded strike plays its own band, the rest the dull thud, a quick tap Good',
    [['hit', 0.9], ['hit', 0.85], ['hit', 0.7], ['hit', 0.6], ['hit', 0.3], ['miss'], ['cold'], ['done'], ['quick']].map(([k, a]) => S.hmSfxKey(k, a)),
    ['Masterwork', 'Masterwork', 'Good', 'Good', 'Crude', 'dull', 'dull', 'dull', 'Good']);
  eq('R122: a sound for every band', HM_HITS.bands.map(x => x.name).every(nm => S.HM_SFX && S.HM_SFX.files[nm]), true);
  eq('R122: every file is a WAV on disk', Object.values((S.HM_SFX || { files: {} }).files).map(fl => { const p = 'assets/sfx/' + fl;
    return fs.existsSync(p) && fs.readFileSync(p).subarray(0, 4).toString() === 'RIFF' && fs.readFileSync(p).subarray(8, 12).toString() === 'WAVE'; }), [true, true, true, true]);
  eq('R122: every strike plays one sound - done, miss, cold, graded', [
    s4.includes("    if(hmProg>=2){ hmSfx('done'); return; }"),
    s4.includes("    if(!t){ hmSfx('miss'); hmImpact(false, at); return; }"),
    s4.includes("    if(hmHeat<HM_FORGE.workMin){ hmSfx('cold'); hmJolt('chill'); hmImpact(false, at); return; }"),
    s4.includes("    const acc=hmGrade(t.d, t.D), P={ x:t.p.x, y:t.p.y }; hmSfx('hit', acc);")], [true, true, true, true]);
  eq('R122: a quick-hammer tap plays HM_SFX.quick', s4.includes("    q.taps++; hmProg=hmQuickProg(q.taps); hmSfx('quick');"), true);
  eq('R122: the sounds load when either minigame opens', [s4.includes("    document.getElementById('sfHammerModal').classList.add('show'); hmSfxLoad();"), s4.includes("m.classList.add('show'); hmSfxLoad();")], [true, true]);
  eq('R122: each strike on its own copy; a blocked sound is ignored', s4.includes('const a=base.cloneNode(); a.volume=HM_SFX.vol; const p=a.play(); if(p && p.catch) p.catch(()=>{});'), true); }
console.log('[hammer] GREEN / ' + n + ' checks');
