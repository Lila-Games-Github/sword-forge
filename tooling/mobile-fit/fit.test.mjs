/* Mobile fit math, guarded against drift.
 *
 * The landscape build is a fixed 1080x600 box. The viewport meta controls WIDTH only, so on a
 * short landscape phone the bottom of the frame falls off the screen (owner's device, 2026-09-21:
 * 1356x610 physical, Chrome Android, bottom ~215 px cut).
 *
 * sfFitWidth() picks the viewport width that makes 600 CSS px exactly fill the visible height.
 * The browser then zooms the whole page out and the spare room lands in side bars.
 *
 * The test reads the function OUT OF THE SHIPPED HTML, so it guards the real code, not a copy.
 * Run: node tooling/mobile-fit/fit.test.mjs
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const HTML = 'Swordforge_looptest_landscape.html';
const src = readFileSync(HTML, 'utf8');

function lift(name) {
  const m = src.match(new RegExp('function ' + name + '\\s*\\([\\s\\S]*?\\n\\s*\\}'));
  assert.ok(m, name + '() not found in ' + HTML);
  return new Function(m[0] + '; return ' + name + ';')();
}
const sfFitWidth = lift('sfFitWidth');
const sfWantsFullscreen = lift('sfWantsFullscreen');
const sfWantsRotate = lift('sfWantsRotate');

const FRAME_W = 1080, FRAME_H = 600;

/* innerWidth/innerHeight are the layout viewport in CSS px. Their RATIO equals the ratio of the
 * visible device area whatever width the meta currently asks for, so the math needs no device px. */
const CASES = [
  // label                                  innerW  innerH   want   why
  ['owner phone, toolbar shown',              1080,    378,  1715, 'the reported bug: 600 px did not fit'],
  ['owner phone, toolbar hidden',             1080,    486,  1334, 'same phone once Chrome collapses the URL bar'],
  ['owner phone, after the fit applied',      1715,    600,  1715, 'fixed point: re-running must not creep'],
  ['21:9 phone landscape',                    1080,    463,  1400, 'taller zoom-out, wider side bars'],
  ['phone portrait 360x800',                  1080,   2400,  1080, 'plenty of height already, so leave the width alone'],
  ['tablet landscape 1024x768',               1080,    810,  1080, 'frame already fits, no zoom-out'],
  ['desktop 1920x1080',                       1080,    608,  1080, 'fits by 8 px, must not zoom out'],
  ['degenerate height 0',                     1080,      0,  1080, 'never divide by zero'],
  ['degenerate width 0',                         0,    600,  1080, 'never return a nonsense width'],
];

let fails = 0;
for (const [label, w, h, want, why] of CASES) {
  const got = sfFitWidth(w, h, FRAME_W, FRAME_H);
  const ok = got === want;
  if (!ok) fails++;
  console.log((ok ? '  ok   ' : '  FAIL ') + label.padEnd(34) + ' inner ' + (w + 'x' + h).padEnd(10) + ' want ' + String(want).padEnd(6) + ' got ' + String(got).padEnd(6) + ' // ' + why);
}

/* The fit must always leave the frame fully visible: 600 CSS px at the chosen width must be no
 * taller than the visible height. Checked as a property, over the same table. */
for (const [label, w, h] of CASES) {
  if (!(w > 0 && h > 0)) continue;
  const W = sfFitWidth(w, h, FRAME_W, FRAME_H);
  const visibleCssHeight = h * (W / w);   // the same screen, re-measured in the new CSS space
  if (visibleCssHeight < FRAME_H - 1) { fails++; console.log('  FAIL ' + label + ': frame still clipped, visible height ' + visibleCssHeight.toFixed(1) + ' css px'); }
  if (W < FRAME_W) { fails++; console.log('  FAIL ' + label + ': width ' + W + ' would squeeze the 1080 px frame'); }
}

/* ---- fullscreen on first tap ----
 * Chrome Android keeps its URL bar on a page that cannot scroll, so the fit measures a short
 * screen and the game ends up smaller than the phone can show. One fullscreen request on the
 * player's first tap gives that height back. It must stay OFF where it would be a surprise:
 * a desktop mouse, a screen the frame already fits, an iPhone (no element fullscreen), or a
 * page that is in fullscreen already.
 * Signature: sfWantsFullscreen(vpW, frameW, coarsePointer, hasApi, alreadyFullscreen)
 */
const FS_CASES = [
  // label                                   vpW  frameW coarse  api  already  want
  ['phone that needed a zoom-out',          1715,  1080,  true,  true,  false,  true],
  ['same phone, second tap',                1715,  1080,  true,  true,  true,   false],
  ['iPhone: no element fullscreen',         1715,  1080,  true,  false, false,  false],
  ['desktop mouse on a short window',       1715,  1080,  false, true,  false,  false],
  ['tablet the frame already fits',         1080,  1080,  true,  true,  false,  false],
  ['portrait phone, fit left it at 1080',   1080,  1080,  true,  true,  false,  false],
];
for (const [label, vpW, frameW, coarse, api, already, want] of FS_CASES) {
  const got = sfWantsFullscreen(vpW, frameW, coarse, api, already);
  const ok = got === want;
  if (!ok) fails++;
  console.log((ok ? '  ok   ' : '  FAIL ') + label.padEnd(34) + ' vp ' + String(vpW).padEnd(6) + ' want ' + String(want).padEnd(6) + ' got ' + String(got));
}


/* ---- r135: the portrait rotate gate ----
 * The game is a 1080x600 landscape box; on a portrait phone the fit clamps to 1080 and the frame
 * is a small centred strip. The gate asks for a rotate rather than forcing one: orientation lock
 * works only inside fullscreen, only on Android, and would spin the game under a player holding
 * the phone upright. A desktop window is the user own shape, so it is never nagged.
 * Signature: sfWantsRotate(innerW, innerH, coarsePointer)
 */
const ROT_CASES = [
  ['portrait phone',                  375,  812,  true,  true],
  ['landscape phone',                 812,  375,  true,  false],
  ['owner phone landscape',           740,  333,  true,  false],
  ['tall desktop window, mouse',      900, 1200,  false, false],
  ['square-ish phone, wider by 1px',  401,  400,  true,  false],
  ['square-ish phone, taller by 1px', 400,  401,  true,  true],
];
for (const [label, w, h, coarse, want] of ROT_CASES) {
  const got = sfWantsRotate(w, h, coarse);
  const ok = got === want;
  if (!ok) fails++;
  console.log((ok ? '  ok   ' : '  FAIL ') + label.padEnd(34) + ' ' + (w + 'x' + h).padEnd(10) + ' want ' + String(want).padEnd(6) + ' got ' + String(got));
}
console.log(fails ? '[mobile fit] RED x (' + fails + ')' : '[mobile fit] GREEN /');
process.exit(fails ? 1 : 0);
