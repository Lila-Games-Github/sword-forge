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

/* r278 (owner, 2026-10-20): a tap opens a small trait card, not the book */
eq('a tap on a trait with a page opens the trait card on it', /function mapTraitTap\(ev\)\{[\s\S]{0,600}CB_SEL=k; openTraitCard\(\); \}/.test(src), true);
{ const i = src.indexOf('<div id="sfTraitModal"'), card = i >= 0 ? src.slice(i, src.indexOf('<!-- /sfTraitModal -->', i)) : '';
  eq('the card: icon, name, description', ['id="tcIcon"', 'id="tcName"', 'id="tcDesc"'].every(s => card.includes(s)), true);
  eq('the card: CRAFT 1, CONTINUE FROM HERE, CRAFT BOOK and a close',
    [/id="tcCraft1"[^>]*onclick="tcCraft1\(\)">CRAFT 1</, /id="tcCont"[^>]*onclick="tcContinue\(\)">CONTINUE FROM HERE</, /id="tcBook"[^>]*onclick="tcBook\(\)">CRAFT BOOK</, /class="tc-x"[^>]*onclick="closeTraitCard\(\)"/].every(r => r.test(card)), true);
  eq('no other buttons on the card', (card.match(/<button/g) || []).length, 4); }
eq('the card fills from the page: symbol, name, description', /function openTraitCard\(\)\{[\s\S]{0,900}\.symbol[\s\S]{0,300}recipeName\(CB_SEL\)\+' Sword'[\s\S]{0,300}swordDesc\(list\)/.test(src), true);
eq('CRAFT 1 is the book\'s, and locks like it', /function tcCraft1\(\)\{ closeTraitCard\(\); cbCraft\(1\); \}/.test(src) && /function openTraitCard\(\)\{[\s\S]{0,900}c1\.disabled=ftueCraftLocked\(\);/.test(src), true);
eq('CONTINUE FROM HERE is the book\'s', /function tcContinue\(\)\{ closeTraitCard\(\); cbContinue\(\); \}/.test(src), true);
eq('CRAFT BOOK opens the book on that page', /function tcBook\(\)\{ closeTraitCard\(\); openBook\(\); \}/.test(src), true);
console.log('[map] GREEN / ' + n + ' checks');
