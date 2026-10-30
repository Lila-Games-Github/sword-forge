/* The smelter version's crafting loop, guarded against drift.
 *
 * Record: specs/2026-10-21-smelter-version-loop.md. The smelter version keeps the values in SMELT and the rules between
 * the SMELT-PURE markers. This test reads both OUT OF Swordforge_looptest_landscape.html (the main game since
 * 2026-10-23; it was Swordforge_looptest_landscape_smelterversion.html), checks the wiring, and checks the old hammer
 * loop (kept as Swordforge_looptest_landscape_hammerloop.html) carries none of it.
 * Run: node tooling/smelter/smelter.test.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const HTML = 'Swordforge_looptest_landscape.html';
const src = readFileSync(HTML, 'utf8');
const old = readFileSync('Swordforge_looptest_landscape_hammerloop.html', 'utf8');   /* 2026-10-23: the old loop, kept for reference */
const m = src.match(/\/\* SMELT-PURE-BEGIN \*\/([\s\S]*?)\/\* SMELT-PURE-END \*\//);
assert.ok(m, 'SMELT-PURE markers not found in ' + HTML);
const S = new Function(m[1] + '; return { SMELT, smHandle, smTravelDt, smEase, smLadleTilt, smLadleSpeed, smPendStep, smFollow, smBladeEnds, smRot, smInWater, smDipped };')();

let n = 0;
function eq(label, got, want) { assert.deepStrictEqual(got, want, label); n++; console.log('  ok   ' + label); }
const r2 = o => ({ pos: Math.round(o.pos * 1000) / 1000, moved: Math.round(o.moved * 1000) / 1000 });

/* the record */
eq('SMELT (s2: strokeSec 0.5 -> 0.2, springMs)', S.SMELT, { rangePx: 40, lift: 12, strokeSec: 0.2, springMs: 250, easeSec: 0.15, flush: 0.002, bladeW: 2, shapedHold: 700, freeOres: 20, freeGold: 500,
  ladleMax: 45, ladleDead: 4, ladlePull: 24, ladleHead: { x: -22.2, y: 4.9, w: 57.3 }, ladleBase: { x: 2.8, y: 26.7, w: 26.5 }, ladlePivot: { x: 66.7, y: 90.6 },
  bladeG: 2600, bladeCom: 0.5, bladeDamp: 1.2, bladeFollow: 700, bladeGrab: 24, bladeDropPx: 70, bladeDropMs: 320, waterX0: 0.23, waterX1: 0.8, waterY0: 0.3, swingW: 317 });
/* s7 (owner, 2026-10-28): a sword dragged on any screen hangs from its handle and swings like the anvil's blade */
eq('the held sword: the anvil blade\'s size, its grip and tip read from the blade picture, swinging from the anvil\'s lying angle',
  /function swSwingStart\(ghost, w, cx, cy\)\{ smBladeEndsOf\(w\.blade\); const E=SM_ENDS\[w\.blade\]\|\|SM_ENDS_DEFAULT, W=SMELT\.swingW;[\s\S]{0,400}th:\(90-\(E\.art\+SM_REST_DEG\)\)\*Math\.PI\/180, om:0, L:SMELT\.bladeCom\*Math\.hypot\(/.test(src), true);
eq('each frame: the same physics as the anvil blade (follow, pendulum, 4 substeps), its own loop (the game tick holds in a pause)',
  /function swSwingFrame\(now\)\{[\s\S]{0,300}const fx=smFollow\(s\.px,s\.vx,s\.tx,h\), fy=smFollow\(s\.py,s\.vy,s\.ty,h\);[\s\S]{0,200}const st=smPendStep\(s\.th,s\.om,fx\.a,fy\.a,s\.L,h\);[\s\S]{0,200}s\.raf=requestAnimationFrame\(swSwingFrame\);/.test(src), true);
eq('turned about its grip, the grip under the finger', /function swSwingPaint\(\)\{[\s\S]{0,500}transformOrigin=[\s\S]{0,300}'rotate\('\+smRot\(s\.th, E\.art\)\.toFixed\(2\)\+'deg\)'/.test(src), true);
eq('the inventory drag swings it', /function startSwordDrag\(w,e\)\{[\s\S]{0,700}swSwingStart\(ghost, w, e\.clientX-fr\.left, e\.clientY-fr\.top\);[\s\S]{0,200}const move=ev=>\{ swSwingTo\(ev\.clientX-fr\.left, ev\.clientY-fr\.top\);[\s\S]{0,300}swSwingStop\(\); ghost\.remove\(\);/.test(src), true);
eq('so does the counter\'s and the table\'s', /function wireWorkDrag\(el, kind\)\{[\s\S]{0,400}const kill=\(\)=>\{ swSwingStop\(\); if\(ghost\)[\s\S]{0,1200}swSwingStart\(ghost, held\(\), e\.clientX-fr\.left, e\.clientY-fr\.top\);[\s\S]{0,200}if\(moved\)\{ const fr=[^\n]*\n\s*swSwingTo\(e\.clientX-fr\.left, e\.clientY-fr\.top\);/.test(src), true);
/* the handle */
eq('up 20px from closed: half raised', r2(S.smHandle(0, -20)), { pos: 0.5, moved: 0.5 });
eq('up past the top: clamped, only the real travel counts', r2(S.smHandle(0.5, -60)), { pos: 1, moved: 0.5 });
eq('down a full stroke', r2(S.smHandle(1, 40)), { pos: 0, moved: 1 });
eq('down past closed: nothing more', r2(S.smHandle(0, 25)), { pos: 0, moved: 0 });
eq('a full stroke = 0.2 s of full-speed travel; a down-and-up pump = 0.4 s', [S.smTravelDt(1), S.smTravelDt(1) + S.smTravelDt(1)], [0.2, 0.4]);
eq('no movement, no travel', S.smTravelDt(0), 0);
/* s3: the glide */
eq('a 60 fps frame releases 1 - e^(-dt/0.15) of the store', Math.round(S.smEase(0.2, 1/60) * 1e6) / 1e6, Math.round(0.2 * (1 - Math.exp(-(1/60) / 0.15)) * 1e6) / 1e6);
eq('the last bit goes at once', S.smEase(0.002, 1/60), 0.002);
eq('nothing stored, nothing released', S.smEase(0, 1/60), 0);
eq('a full stroke has glided out within 0.8 s, never more than was stored', (() => { let o = 0.2, out = 0, f = 0;
  while (o > 0 && f < 48) { const d = S.smEase(o, 1/60); o -= d; out += d; f++; } return [o <= 1e-12, Math.abs(out - 0.2) < 1e-12]; })(), [true, true]);

/* s4: the ladle */
eq('the tilt adds the turn', S.smLadleTilt(0, 10), 10);
eq('the tilt stops at ladleMax', S.smLadleTilt(40, 10), 45);
eq('the tilt stops upright', S.smLadleTilt(5, -10), 0);
eq('no pull upright or inside the dead zone', [S.smLadleSpeed(0), S.smLadleSpeed(4)], [0, 0]);
eq('full tilt pulls at ladlePull; half way at half', [S.smLadleSpeed(45), S.smLadleSpeed(24.5)], [24, 12]);
eq('the ladle sits in the smelter station, behind the furnace', /<div class="station" id="stSmelt">[\s\S]{0,200}<div id="ladle"><img id="ladleBase" src="assets\/forge\/ladle_base\.webp" alt=""><img id="ladleHead" src="assets\/forge\/ladle_head\.webp" alt="Ladle"><\/div>(<!--[^>]*-->)?\s*<img class="furnace"/.test(src)
  && src.includes('#ladle { position: absolute; inset: 0; z-index: -1; pointer-events: none; }') && src.includes('<div id="ladleHot" title="Tilt the ladle"></div>'), true);
eq('placed from SMELT, turned about its foot', /function wireLadle\(\)\{[\s\S]{0,900}SMELT\.ladleHead[\s\S]{0,300}SMELT\.ladleBase[\s\S]{0,400}SMELT\.ladlePivot/.test(src), true);
eq('a drag tilts it by the turn of the pointer; a release tips it back', /function wireLadle\(\)\{[\s\S]{0,2400}SM_TILT=smLadleTilt\(SM_TILT, /.test(src) && /function wireLadle\(\)\{[\s\S]{0,3000}SM_TILT=0; paint\(SMELT\.springMs\);/.test(src), true);
eq('every frame a tilted ladle pulls the route toward the centre, only while the metal is in the smelter', /function tick\(now\)\{[\s\S]{0,4000}smLadleTick\(dt\);/.test(src)
  && /function smLadleTick\(dt\)\{[\s\S]{0,200}const v=smLadleSpeed\(SM_TILT\)[\s\S]{0,300}melt\.stage!=='smelting'[\s\S]{0,1200}pull\.x\+=dx\/dist\*step; pull\.y\+=dy\/dist\*step;[\s\S]{0,300}checkTraitReach\(np\); checkHazard\(np,dt\); checkBooks\(np\);/.test(src), true);
eq('wired at start', /wireBellowGate\(\); wireSmBlade\(\); wireLadle\(\);/.test(src), true);

/* s5: the pendulum */
eq('hanging still stays still', S.smPendStep(0, 0, 0, 0, 80, 1/60), { th: 0, om: 0 });
eq('swung out, gravity pulls it back', S.smPendStep(0.5, 0, 0, 0, 80, 1/60).om < 0, true);
eq('the pivot pulled right, the tip lags left', S.smPendStep(0, 0, 2000, 0, 80, 1/60).om < 0, true);
eq('the swing dies down: from 1 rad, under 0.15 rad after 6 s', (() => { let st = { th: 1, om: 0 }, mx = 0;
  for (let i = 0; i < 720; i++) { st = S.smPendStep(st.th, st.om, 0, 0, 80, 1/120); if (i >= 600) mx = Math.max(mx, Math.abs(st.th)); } return mx < 0.15; })(), true);
eq('a swing takes about 1.1 s (L 80)', (() => { let st = { th: 0.2, om: 0 }, prev = 0.2, cross = []; for (let i = 0; i < 1800; i++) { st = S.smPendStep(st.th, st.om, 0, 0, 80, 1/600);
  if (prev > 0 && st.th <= 0) cross.push(i / 600); prev = st.th; } return Math.round((cross[1] - cross[0]) * 10) / 10; })(), 1.1);
eq('the handle follows the finger: within 1 px of 100 px in 0.4 s, without overshooting', (() => { let p = 0, v = 0, over = false;
  for (let i = 0; i < 24; i++) { const r = S.smFollow(p, v, 100, 1/60); p = r.p; v = r.v; if (p > 100.5) over = true; } return [Math.abs(100 - p) < 1, over]; })(), [true, false]);
eq('the ends of a diagonal blade: the tang bottom left, the tip top right', (() => { const w = 512, h = 512, d = new Uint8ClampedArray(w * h * 4);
  for (let t = 0; t <= 300; t++) for (let k = -2; k <= 2; k++) { const x = 100 + t + k, y = 400 - t + k; d[(y * w + x) * 4 + 3] = 255; }
  const e = S.smBladeEnds(d, w, h); return [Math.abs(e.tang.x - 100) <= 3 && Math.abs(e.tang.y - 400) <= 3, Math.abs(e.tip.x - 400) <= 3 && Math.abs(e.tip.y - 100) <= 3]; })(), [true, true]);
eq('no pixels, no ends', S.smBladeEnds(new Uint8ClampedArray(16), 2, 2), null);
eq('hanging straight down, a -45 deg art turns 135 deg', S.smRot(0, -45), 135);
eq('the picture takes no taps; a press near the blade\'s line takes it', src.includes('#smBlade { position: absolute; z-index: 26; display: none; pointer-events: none;')
  && /document\.addEventListener\('pointerdown', smBladeGrab, true\);/.test(src) && /function smBladeGrab\(e\)\{[\s\S]{0,600}<=SMELT\.bladeGrab/.test(src), true);
eq('every frame the held blade swings', /function tick\(now\)\{[\s\S]{0,4000}smBladeTick\(dt\);/.test(src)
  && /function smBladeTick\(dt\)\{[\s\S]{0,900}smFollow\([\s\S]{0,600}smPendStep\(/.test(src), true);
eq('the bucket test reads the tip; over it the blade drops straight down', /function smOverBucket\(\)\{[\s\S]{0,200}smBladeTip\(\)/.test(src)
  && /function smBladeDrop\(\)\{[\s\S]{0,700}SMELT\.bladeDropPx[\s\S]{0,400}SMELT\.bladeDropMs/.test(src), true);

/* s6: hot, then quenched in the water */
const BK = { L: 0, R: 100, T: 0, B: 200 };
eq('the tip in the water quenches', S.smInWater({ x: 50, y: 70 }, BK), true);
eq('above the water, no', S.smInWater({ x: 50, y: 59 }, BK), false);
eq('beside the water (the rim), no', [S.smInWater({ x: 22, y: 100 }, BK), S.smInWater({ x: 81, y: 100 }, BK)], [false, false]);
eq('below the bucket, no', S.smInWater({ x: 50, y: 201 }, BK), false);
eq('a dip comes from above: over the surface, then in the water', S.smDipped({ x: 50, y: 55 }, { x: 50, y: 65 }, BK), true);
eq('in through the side wall is no dip', S.smDipped({ x: 10, y: 100 }, { x: 30, y: 100 }, BK), false);
eq('already under the surface is no new dip', S.smDipped({ x: 50, y: 90 }, { x: 52, y: 95 }, BK), false);
eq('the blade glows hot until quenched; the glow fades out', /#smBlade \{[^}]*transition: filter \.7s ease-out;/.test(src) && src.includes('#smBlade.hot {')
  && /function smBladeShow\(\)\{[\s\S]{0,300}b\.classList\.add\('hot'\);/.test(src), true);
eq('held, the tip in the water quenches it where it is', /function smBladeTick\(dt\)\{[\s\S]{0,1400}const tip=smBladeTip\(\), was=SM_BL\.tip\|\|tip; SM_BL\.tip=tip;[\s\S]{0,200}if\(smDipped\(was, tip, benchRect\(document\.getElementById\('bucketBack'\)\)\)\) smBladeQuench\(\);/.test(src)
  && /function smBladeQuench\(\)\{[\s\S]{0,500}b\.classList\.remove\('hot'\);[\s\S]{0,400}quenchFx\(\(\)=>\{[\s\S]{0,200}finishBlade\(\);/.test(src), true);
eq('dropped in, it cools too', /function smBladeDrop\(\)\{[\s\S]{0,400}b\.classList\.remove\('hot'\);/.test(src), true);

/* 1. free play - since 2026-10-23 (R0) a test aid: the main game starts the tutorial (D1); ?freeplay starts free play */
eq('the tutorial starts again (D1 on load, after the intro, on a new game); ?freeplay gives free play instead', /function initMechanics\(\)\{[\s\S]{0,1800}wireIntro\(\); if\(!introOpen\(\)\) setTimeout\(sayStart, 600\);/.test(src)
  && /function introEnd\(\)\{[\s\S]{0,200}setTimeout\(sayStart, 600\);/.test(src) && /function newGame\(\)\{[\s\S]{0,700}setTimeout\(sayStart, 500\);/.test(src)
  && /function sayStart\(\)\{ if\(SM_FREE\)\{ smFreePlay\(\); return; \}/.test(src) && src.includes("const SM_FREE=location.search.indexOf('freeplay')>=0;"), true);
eq('free play: tutorial done, stations and market open, the ores and gold', /function smFreePlay\(\)\{[\s\S]{0,900}tutDone\(\);[\s\S]{0,300}TUT_SEEN_END=true;[\s\S]{0,300}FTUE_ST\.done=true;[\s\S]{0,400}SMELT\.freeOres[\s\S]{0,200}GOLD=SMELT\.freeGold;/.test(src), true);
eq('free play is past the tutorial\'s parts (part 1 caps the first sword at 2 iron + 2 manganese and greys the rest)', /function smFreePlay\(\)\{[\s\S]{0,600}FTUE_ST\.part=7; TUT_BRAM_SOLD=true;/.test(src), true);
eq('the PART buttons are back (R0), SKIP HAMMER stays', !src.includes('.cheatPart { display: none !important; }') && src.includes('id="cheatSkipHm"'), true);
/* 2. the gate */
eq('the gate glows on a trait, not on heat', /function tick\(now\)\{[\s\S]{0,4000}smGateSync\(\);/.test(src) && !src.includes('if(!gateReady && melt.heat>=HEAT_READY) markGateReady();'), true);
eq('the gate opens only on a trait, and acquires it', /function openGate\(\)\{ if\(!melt\|\|melt\.stage!=='smelting'\) return; if\(!melt\.reachedTrait\)\{[\s\S]{0,200}return; \}[\s\S]{0,200}tryAcquire\(\);/.test(src), true);
eq('acquiring releases the hot metal at the gate, with no water', /function tryAcquire\(\)\{[\s\S]{0,2200}melt\.stage='hot'; melt\.heat=100;[\s\S]{0,200}snapToGate\(\);/.test(src) && !/function tryAcquire\(\)\{[\s\S]{0,2600}quenchFx\(/.test(src), true);
/* 3. the bellows */
eq('the bellows handle stores the travel (s3), it does not move the sword itself', /function wireBellowGate\(\)\{[\s\S]{0,1600}smHandle\(SM_POS, [\s\S]{0,400}SM_OWED\+=smTravelDt\(h\.moved\);/.test(src)
  && !/function wireBellowGate\(\)\{[\s\S]{0,2400}advanceSword\(/.test(src), true);
eq('every frame the sword glides out part of the store', /function tick\(now\)\{[\s\S]{0,4000}smGlide\(dt\); smGateSync\(\);/.test(src)
  && /function smGlide\(dt\)\{[\s\S]{0,300}const d=smEase\(SM_OWED, dt\); SM_OWED=Math\.max\(0, SM_OWED-d\); advanceSword\(d\);/.test(src), true);
eq('the gate and a reset drop the rest of the store', /function openGate\(\)\{[\s\S]{0,500}SM_OWED=0;/.test(src) && /function resetRun\(\)\{[^\n]{0,120}SM_OWED=0;/.test(src), true);
eq('released, the handle springs back to closed, and the spring moves nothing (s2)', /const end=e=>\{ if\(live!==e\.pointerId\) return; live=null; quiet\(\); SM_POS=0; paint\(SMELT\.springMs\); \};/.test(src)
  && /const paint=ms=>\{[^}]*top\.style\.transition=ms \? 'transform '\+ms\+'ms ease-out' : 'none';/.test(src), true);
eq('heat no longer sets the speed', /function advanceSword\(dt\)\{[\s\S]{0,400}let step=SWORD_SPEED\*mul\*dt,/.test(src), true);
eq('the forge hammer no longer moves the sword', !/hammerStriking\(\)\)\{ advanceSword\(dt\);/.test(src), true);
eq('no dragon fire on the forge', /function wireDragon\(\)\{[\s\S]{0,700}mode = 'say';/.test(src) && !/mode = dragonAtAnvil\(\) \? 'breath' : 'say';/.test(src), true);
eq('the forge hammer, the forge mug and the minigame mug are hidden', src.includes('#hammerTool, #mug, #hmMug { display: none !important; }'), true);
/* 4. the anvil, the minigame, the bucket */
eq('the metal on the anvil opens the shape window', /function placeOnAnvil\(\)\{[\s\S]{0,500}if\(melt\.traits && melt\.traits\.length\) setTimeout\(openShapeSelect, 0\);/.test(src), true);
eq('the last strike closes the minigame onto the anvil', /function hmStrike\(\)\{[\s\S]{0,1600}if\(hmProg>=2\)\{ hmMugState\(\); setTimeout\(smShaped, SMELT\.shapedHold\); \}/.test(src), true);
eq('SKIP HAMMER does the same', /function hmSkip\(\)\{[\s\S]{0,300}smShaped\(\);/.test(src), true);
eq('the shaped blade lies on the anvil, and the bucket finishes it', /function smShaped\(\)\{[\s\S]{0,600}melt\.stage='shaped';[\s\S]{0,300}smBladeShow\(\);/.test(src)
  && /function smBladeDrop\(\)\{[\s\S]{0,400}smOverBucket\(\)[\s\S]{0,600}quenchFx\(\(\)=>\{ finishBlade\(\); \}/.test(src), true);
eq('the blade on the anvil is SMELT.bladeW anvils wide (s3)', /function smBladeHome\(\)\{[\s\S]{0,200}getBoundingClientRect\(\)\.width\*SMELT\.bladeW\)/.test(src), true);
eq('a reset clears the blade', /function resetRun\(\)\{[\s\S]{0,300}smBladeHide\(\);/.test(src), true);
eq('the minigame line no longer asks for the mug', !src.includes("'Blade shaped: <b>splash it with the mug</b> to finish'"), true);

/* 2026-10-23 (owner): this loop is the main game; the old hammer loop is kept as its own file, without it */
eq('the old loop is kept apart, without the smelter loop', ['SMELT-PURE', 'const SMELT=', 'smFreePlay', 'smShaped', 'smHandle'].some(k => old.includes(k)), false);

/* R40 (owner, 2026-10-30): the fire sword's swing effect - A glow, B embers, C ribbon; fire only, while dragged.
   Record: specs/2026-10-30-fire-swing-fx.md */
const fxm = src.match(/\/\* FIREFX-PURE-BEGIN \*\/([\s\S]*?)\/\* FIREFX-PURE-END \*\//);
assert.ok(fxm, 'FIREFX-PURE markers not found in ' + HTML);
const X = new Function(fxm[1] + '; return { SWING_FX, FX_PLAIN_TRAITS, fxFor, fxGlow, fxSpawn, fxAlong, fxEmber, fxEmberStep, fxRamp, fxEmberLook, fxRibbonKeep };')();
const FF = X.SWING_FX.fire, r3 = v => Math.round(v * 1000) / 1000;
eq('R40: the values (record: Values)', X.SWING_FX, { fire: {
  glow: { rest: 0.35, full: 1, speed: 1600 },
  embers: { rest: 14, perPx: 0.09, max: 180, life: [0.25, 0.55], size: [12, 26], inherit: 0.3, drag: 3, rise: 420, jitter: 35, tipBias: 2 },
  ribbon: { speed: 900, keep: 0.12, inner: 0.65, alpha: 0.65, gap: 140, stops: [[0, [255, 200, 90], 1], [0.45, [255, 95, 20], 0.8], [1, [190, 35, 8], 0]] } },
  plain: { ribbon: { speed: 900, keep: 0.12, inner: 0.65, alpha: 0.7, gap: 140, stops: [[0, [255, 255, 255], 1], [0.45, [235, 242, 255], 0.55], [1, [220, 230, 250], 0]] } } });   /* R45: the white slash, no glow, no embers */
eq('R40 A: the glow - rest when still, rising with speed, full from 1600 px/s', [X.fxGlow(FF, 0), r3(X.fxGlow(FF, 800)), X.fxGlow(FF, 1600), X.fxGlow(FF, 5000)], [0.35, 0.675, 1, 1]);
eq('R40 B: embers made - 14 a second when still', X.fxSpawn(FF, 0, 1, 0), { n: 14, carry: 0 });
const sp = X.fxSpawn(FF, 1000, 0.1, 0.5);
eq('R40 B: plus 0.09 per px/s of speed, the fraction carried to the next frame', [sp.n, r3(sp.carry)], [10, 0.9]);
eq('R40 B: along the blade, tip-heavy', [X.fxAlong(FF, 0), X.fxAlong(FF, 0.5), X.fxAlong(FF, 1)], [0, 0.75, 1]);
const em = X.fxEmber(FF, { x: 10, y: 20, vx: 100, vy: -50 }, { a: 0.5, b: 0.5, c: 0.5, d: 0.5 });
eq('R40 B: a new ember - its point, 0.3 of its velocity, mid life and size', Object.assign({}, em, { life: r3(em.life), size: r3(em.size) }), { x: 10, y: 20, vx: 30, vy: -15, age: 0, life: 0.4, size: 19 });
const e2 = Object.assign({}, em), alive = X.fxEmberStep(FF, e2, 0.1);
eq('R40 B: it slows, rises and ages', [alive, e2.vx < em.vx, e2.vy < em.vy, r3(e2.age)], [true, true, true, 0.1]);
eq('R40 B: it goes at the end of its life', X.fxEmberStep(FF, { x: 0, y: 0, vx: 0, vy: 0, age: 0.54, life: 0.55, size: 10 }, 0.02), false);
eq('R40 B: colour - white-yellow new, orange mid-life, smoke at the end', [X.fxRamp(0), X.fxRamp(0.5), X.fxRamp(1)], [[255, 244, 200], [245, 110, 25], [70, 50, 45]]);
eq('R40 B: fades in, then out; 16 colour steps; shrinks to 40%', [X.fxEmberLook(0).a, X.fxEmberLook(0.5).a > 0.4, X.fxEmberLook(1).a, X.fxEmberLook(0).i, X.fxEmberLook(1).i, r3(X.fxEmberLook(1).s)], [0, true, 0, 0, 15, 0.4]);
eq('R40 C: the ribbon keeps 0.12 s of the swept path', X.fxRibbonKeep(FF, [{ t: 0 }, { t: 100 }, { t: 200 }], 300).map(p => p.t), [200]);
eq('R40 C: painted over the scene', src.includes("g.globalCompositeOperation='source-over';   /* C: painted, so it stays orange on a bright wall */"), true);
eq('R40 C: a piece whose tip jumped over 140 px is skipped', src.includes('if(b.t-a.t>60 || Math.hypot(b.x-a.x, b.y-a.y)>b.F.ribbon.gap) continue;'), true);   /* R45: the piece's own values */
eq('R40: fire swords only, while dragged', src.includes('fx:fxFor(w)') && /function swSwingFrame\(now\)\{[\s\S]{0,700}if\(s\.fx\) fxSwing\(s, dt\);/.test(src), true);
eq('R40 A: the glow is cut to the blade picture', /\.sw-ghost \.sw-glow \{[^}]*mask-size: contain;/.test(src) && src.includes("gl.style.maskImage=gl.style.webkitMaskImage='url('+blade+')';"), true);
eq('R40: the canvas lets taps through and sits over the dragged sword', src.includes('#swingFx { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 121; pointer-events: none; }'), true);   /* R41: frame-sized whatever the pixel ratio */

/* R42 (2026-10-30): the blade ends stored in the game, so a page opened as a file (no pixel reads) swings and burns right */
const bem = src.match(/\/\* BLADE-ENDS-BEGIN \*\/([\s\S]*?)\/\* BLADE-ENDS-END \*\//);
assert.ok(bem, 'BLADE-ENDS markers not found in ' + HTML);
const ART = new Function(bem[1] + '; return SM_ENDS_ART;')();
const bladeFiles = readdirSync('assets/sword-parts/blades').filter(f => f.endsWith('.webp')).map(f => f.replace(/\.webp$/, '')).sort();
eq('R42: a row for every blade picture, none for a missing one', Object.keys(ART).sort(), bladeFiles);
eq('R42: each tip lies up and right of its tang, about 45 deg (the art convention)', Object.keys(ART).filter(f => { const [ax, ay, bx, by] = ART[f], d = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
  return !(bx > ax && by < ay && d > -60 && d < -30); }), []);
eq('R42: the flame Longsword as measured (277 px at the swing size)', [ART.flame_longsword_blade, Math.round(Math.hypot(ART.flame_longsword_blade[2] - ART.flame_longsword_blade[0], ART.flame_longsword_blade[3] - ART.flame_longsword_blade[1]) * 317)], [[0.2919, 0.7059, 0.9064, 0.0833], 277]);
eq('R42: SM_ENDS starts filled from the table', src.includes('Object.keys(SM_ENDS_ART).forEach(f=>{ const a=SM_ENDS_ART[f]; SM_ENDS[f]={ tang:{ x:a[0], y:a[1] }, tip:{ x:a[2], y:a[3] }, art:Math.atan2(a[3]-a[1], a[2]-a[0])*180/Math.PI }; });'), true);

/* R43 (owner, 2026-10-30): the canvas cleared whole, whatever the pixel ratio */
eq('R43: each frame clears the whole canvas in its own pixels', src.includes("g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height); g.setTransform(FX.d, 0, 0, FX.d, 0, 0);"), true);
eq('R43: drawn at the pixel ratio held to 1-2', src.includes('d=Math.min(2, Math.max(1, window.devicePixelRatio||1));'), true);

/* R44 (owner, 2026-10-30): the forge's blade burns too, while held, when it carries fire */
eq('R44: the forge blade gets the effect when its metal carries fire', src.includes('fx:fxFor(melt)') && /function smBladeGrab\(e\)\{[\s\S]{0,900}smFxOn\(b\);/.test(src), true);
eq('R44: every held frame it burns', /function smBladeTick\(dt\)\{[\s\S]{0,900}smBladePaint\(\); if\(SM_BL\.fx\) fxSwing\(SM_BL, dt\);/.test(src) && /function tick\(now\)\{[\s\S]{0,4000}if\(SM_BL\) SM_BL\.t=now; smBladeTick\(dt\);/.test(src), true);
eq('R44: it stops when let go or quenched', /function smBladeUp\(e\)\{[^\n]*smFxOff\(\); smBladeDrop\(\);/.test(src) && /function smBladeQuench\(\)\{[\s\S]{0,300}tutDipDone\(\); smFxOff\(\);/.test(src), true);
eq('R44: one effect for both swings - the picture width and the place in the frame', /function fxSwing\(s, dt\)\{[\s\S]{0,400}o=s\.off\|\|\{ x:0, y:0 \};[\s\S]{0,200}\*\(s\.W\|\|SMELT\.swingW\), px=s\.px\+o\.x, py=s\.py\+o\.y,/.test(src), true);
eq('R44: the glow lies over the held blade', src.includes('#smBladeGlow { position: absolute; z-index: 41;') && /function smFxPaint\(b\)\{[^\n]*\['left','top','width','transform','transformOrigin'\]/.test(src), true);
eq('R44: the loop runs while the forge blade burns', src.includes('(SW_SWING && SW_SWING.fx) || (SM_BL && SM_BL.fx && SM_BL.live)'), true);

/* R45 (owner, 2026-10-30): the base swords (balanced, durable) slash white, no particles */
eq('R45: the base traits (R46: and swift)', X.FX_PLAIN_TRAITS, ['balanced', 'durable', 'swift']);
const fw = ids => ({ traits: ids.map(k => ({ tid: k })) }), fm = ids => ({ traits: ids.map(k => ({ t: { id: k } })) });
eq('R45: fire burns, even with a base trait', [X.fxFor(fw(['fire'])) === X.SWING_FX.fire, X.fxFor(fm(['durable', 'fire'])) === X.SWING_FX.fire], [true, true]);
eq('R45: balanced, durable or none slash white', [fw(['balanced']), fw(['durable']), fm(['balanced', 'durable']), fw([]), {}].map(w => X.fxFor(w) === X.SWING_FX.plain), [true, true, true, true, true]);
eq('R45: any other trait has no effect yet', [X.fxFor(fw(['gale'])), X.fxFor(fm(['balanced', 'gale'])), X.fxFor(fw(['water'])), X.fxFor(null)], [null, null, null, null]);
eq('R45: the white slash has no glow and no embers', [X.SWING_FX.plain.glow, X.SWING_FX.plain.embers], [undefined, undefined]);
eq('R45: embers and the glow only when the values have them', /function fxSwing\(s, dt\)\{[\s\S]{0,900}if\(s\.glow && F\.glow\)[\s\S]{0,200}if\(F\.embers\)\{/.test(src) && src.includes('if(SW_SWING.fx && SW_SWING.fx.glow){') && src.includes('if(!SM_BL.fx || !SM_BL.fx.glow) return;'), true);
eq('R45: each slash piece and ember keeps its own values', src.includes('fxEmberStep(p.F, p, dt)') && src.includes('b.F.ribbon.stops.forEach(') && src.includes(', t:s.t, F:F });'), true);

/* R46 (owner, 2026-10-30): the swift sword slashes white too */
eq('R46: swift slashes white, alone or with a base trait', [fw(['swift']), fm(['swift', 'balanced']), fw(['durable', 'swift'])].map(w => X.fxFor(w) === X.SWING_FX.plain), [true, true, true]);
eq('R46: fire with swift burns; gale with swift has none', [X.fxFor(fw(['swift', 'fire'])) === X.SWING_FX.fire, X.fxFor(fm(['swift', 'gale']))], [true, null]);

console.log('[smelter] GREEN / ' + n + ' checks');
