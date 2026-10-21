/* The smelter version's crafting loop, guarded against drift.
 *
 * Record: specs/2026-10-21-smelter-version-loop.md. The smelter version keeps the values in SMELT and the rules between
 * the SMELT-PURE markers. This test reads both OUT OF Swordforge_looptest_landscape_smelterversion.html, checks the
 * wiring, and checks the main build carries none of it.
 * Run: node tooling/smelter/smelter.test.mjs
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const HTML = 'Swordforge_looptest_landscape_smelterversion.html';
const src = readFileSync(HTML, 'utf8');
const main = readFileSync('Swordforge_looptest_landscape.html', 'utf8');
const m = src.match(/\/\* SMELT-PURE-BEGIN \*\/([\s\S]*?)\/\* SMELT-PURE-END \*\//);
assert.ok(m, 'SMELT-PURE markers not found in ' + HTML);
const S = new Function(m[1] + '; return { SMELT, smHandle, smTravelDt, smEase };')();

let n = 0;
function eq(label, got, want) { assert.deepStrictEqual(got, want, label); n++; console.log('  ok   ' + label); }
const r2 = o => ({ pos: Math.round(o.pos * 1000) / 1000, moved: Math.round(o.moved * 1000) / 1000 });

/* the record */
eq('SMELT (s2: strokeSec 0.5 -> 0.2, springMs)', S.SMELT, { rangePx: 40, lift: 12, strokeSec: 0.2, springMs: 250, easeSec: 0.15, flush: 0.002, bladeW: 2, shapedHold: 700, freeOres: 20, freeGold: 500 });
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

/* 1. free play */
eq('free play instead of D1: on load, after the intro, on a new game', /function initMechanics\(\)\{[\s\S]{0,1800}wireIntro\(\); if\(!introOpen\(\)\) smFreePlay\(\);/.test(src)
  && /function introEnd\(\)\{[\s\S]{0,200}smFreePlay\(\);/.test(src) && /function newGame\(\)\{[\s\S]{0,700}setTimeout\(smFreePlay, 500\);/.test(src) && !/setTimeout\(sayStart/.test(src), true);
eq('free play: tutorial done, stations and market open, the ores and gold', /function smFreePlay\(\)\{[\s\S]{0,900}tutDone\(\);[\s\S]{0,300}TUT_SEEN_END=true;[\s\S]{0,300}FTUE_ST\.done=true;[\s\S]{0,400}SMELT\.freeOres[\s\S]{0,200}GOLD=SMELT\.freeGold;/.test(src), true);
eq('free play is past the tutorial\'s parts (part 1 caps the first sword at 2 iron + 2 manganese and greys the rest)', /function smFreePlay\(\)\{[\s\S]{0,600}FTUE_ST\.part=7; TUT_BRAM_SOLD=true;/.test(src), true);
eq('the PART buttons are hidden, SKIP HAMMER stays', src.includes('.cheatPart { display: none !important; }') && src.includes('id="cheatSkipHm"'), true);
/* 2. the gate */
eq('the gate glows on a trait, not on heat', /function tick\(now\)\{[\s\S]{0,4000}smGateSync\(\);/.test(src) && !src.includes('if(!gateReady && melt.heat>=HEAT_READY) markGateReady();'), true);
eq('the gate opens only on a trait, and acquires it', /function openGate\(\)\{ if\(!melt\|\|melt\.stage!=='smelting'\) return; if\(!melt\.reachedTrait\)\{[\s\S]{0,200}return; \}[\s\S]{0,200}tryAcquire\(\);/.test(src), true);
eq('acquiring releases the hot metal at the gate, with no water', /function tryAcquire\(\)\{[\s\S]{0,2200}melt\.stage='hot'; melt\.heat=100;[\s\S]{0,200}snapToGate\(\);/.test(src) && !/function tryAcquire\(\)\{[\s\S]{0,2600}quenchFx\(/.test(src), true);
/* 3. the bellows */
eq('the bellows handle stores the travel (s3), it does not move the sword itself', /function wireBellowGate\(\)\{[\s\S]{0,1600}smHandle\(SM_POS, [\s\S]{0,400}SM_OWED\+=smTravelDt\(h\.moved\);/.test(src)
  && !/function wireBellowGate\(\)\{[\s\S]{0,2400}advanceSword\(/.test(src), true);
eq('every frame the sword glides out part of the store', /function tick\(now\)\{[\s\S]{0,4000}smGlide\(dt\); smGateSync\(\);/.test(src)
  && /function smGlide\(dt\)\{[\s\S]{0,300}const d=smEase\(SM_OWED, dt\); SM_OWED=Math\.max\(0, SM_OWED-d\); advanceSword\(d\);/.test(src), true);
eq('the gate and a reset drop the rest of the store', /function openGate\(\)\{[\s\S]{0,300}SM_OWED=0;/.test(src) && /function resetRun\(\)\{[^\n]{0,120}SM_OWED=0;/.test(src), true);
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
  && /function smBladeDrop\(\)\{[\s\S]{0,400}smOverBucket\(\)[\s\S]{0,400}quenchFx\(\(\)=>\{ finishBlade\(\); \}/.test(src), true);
eq('the blade on the anvil is SMELT.bladeW anvils wide (s3)', /function smBladeHome\(\)\{[\s\S]{0,200}getBoundingClientRect\(\)\.width\*SMELT\.bladeW\)/.test(src), true);
eq('a reset clears the blade', /function resetRun\(\)\{[\s\S]{0,300}smBladeHide\(\);/.test(src), true);
eq('the minigame line no longer asks for the mug', !src.includes("'Blade shaped: <b>splash it with the mug</b> to finish'"), true);

/* the main build is untouched */
eq('the main build has none of it', ['SMELT-PURE', 'const SMELT=', 'smFreePlay', 'smShaped', 'smHandle'].some(k => main.includes(k)), false);

console.log('[smelter] GREEN / ' + n + ' checks');
