/* Map trait icons open the craft book (r220), guarded against drift.
 * Record: specs/2026-10-06-map-trait-links.md. Reads the MAP-PURE block OUT OF THE SHIPPED HTML.
 * Run: node tooling/map/map.test.mjs
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const HTML = 'Swordforge_looptest_landscape.html';
const src = readFileSync(HTML, 'utf8');
const blk = src.match(/\/\* MAP-PURE-BEGIN \*\/([\s\S]*?)\/\* MAP-PURE-END \*\//);
assert.ok(blk, 'MAP-PURE markers not found in ' + HTML);
const M = new Function(blk[1] + '; return { latestPageFor, TRAIT_TAP };')();

let n = 0;
function eq(label, got, want) { assert.deepStrictEqual(got, want, label); n++; console.log('  ok   ' + label); }

const R = {
  'fire':         { traits: [{ tid: 'fire' }], at: 100 },
  'fire#2':       { traits: [{ tid: 'fire' }], at: 300 },
  'balanced':     { traits: [{ tid: 'balanced' }], at: 500 },
  'fire+swift':   { traits: [{ tid: 'fire' }, { tid: 'swift' }], at: 200 },
  'old':          { tid: 'gale', at: 50 } };   /* an old save: one trait, no traits list */
eq('the newest page with that trait', M.latestPageFor(R, 'fire'), 'fire#2');
eq('a combination counts for each trait', M.latestPageFor(R, 'swift'), 'fire+swift');
eq('an old one-trait save still counts', M.latestPageFor(R, 'gale'), 'old');
eq('no page: null', M.latestPageFor(R, 'ice'), null);
eq('empty book: null', M.latestPageFor({}, 'fire'), null);
eq('tap limits', M.TRAIT_TAP, { movePx: 6, radius: 21 });

eq('the map reads the tap on pointerup', src.includes('if(tap) mapTraitTap(ev);'), true);
eq('fogged traits do nothing', /function mapTraitTap\(ev\)\{[\s\S]{0,600}inFog\(t\.x, ?t\.y\)/.test(src), true);
eq('toasts', src.includes("'Discover this trait first'") && src.includes("'No saved page for <b>'"), true);

console.log('[map] GREEN / ' + n + ' checks');
