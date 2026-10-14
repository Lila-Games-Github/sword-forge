/* Hazard integrity (r215), guarded against drift.
 *
 * The recorded values live in specs/2026-10-01-hazard-integrity.md. The build keeps them in ONE
 * object, HAZ, between the HAZARD-CONFIG markers, and the pure rules between the HAZARD-PURE markers.
 * This test reads both OUT OF THE SHIPPED HTML.
 * Run: node tooling/hazard/hazard.test.mjs
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const HTML = 'Swordforge_looptest_landscape.html';
const src = readFileSync(HTML, 'utf8');

const cfg = src.match(/\/\* HAZARD-CONFIG-BEGIN \*\/([\s\S]*?)\/\* HAZARD-CONFIG-END \*\//);
assert.ok(cfg, 'HAZARD-CONFIG markers not found in ' + HTML);
const pure = src.match(/\/\* HAZARD-PURE-BEGIN \*\/([\s\S]*?)\/\* HAZARD-PURE-END \*\//);
assert.ok(pure, 'HAZARD-PURE markers not found in ' + HTML);
const M = new Function(cfg[1] + pure[1] + '; return { HAZ, hazPriceMul, hazTierDrop, dropTier };')();
const { HAZ } = M;

let n = 0;
function eq(label, got, want) { assert.deepStrictEqual(got, want, label); n++; console.log('  ok   ' + label); }

/* the record */
eq('floor', HAZ.floor, 0.5);
eq('free zones', HAZ.free, 2);
eq('steps', HAZ.steps, [3, 5]);
eq('tutorial clearing', HAZ.clear, [{ x: 1154, y: 748, kind: 'island' }]);
/* owner, 2026-10-13: the fire run's last ore is a choice - full iron crosses a zone, full manganese goes round it.
   The speck both full paths crossed (#59) moves, its own shape at 75%, onto the stretch only iron takes. */
eq('tutorial move', HAZ.move, [{ kind: 'speck', x: 917.83, y: 1003.27, to: { x: 866, y: 1001 }, scale: 0.75 }]);
eq('the move is applied after the map is built (no reshuffle)', /HAZ\.move\.forEach\(c=>\{ const z=hazards\.find\(z=>z\.kind===c\.kind && Math\.hypot\(z\.x-c\.x, z\.y-c\.y\)<=2\);/.test(src), true);

/* price: full health keeps the price, 0 health halves it, unknown health is full */
eq('price at 100', M.hazPriceMul(100), 1);
eq('price at 60', M.hazPriceMul(60), 0.8);
eq('price at 0', M.hazPriceMul(0), 0.5);
eq('price with no record', M.hazPriceMul(undefined), 1);
eq('price clamps above 100', M.hazPriceMul(140), 1);

/* tier steps by zones crossed */
eq('0 zones', M.hazTierDrop(0), 0);
eq('2 zones (free)', M.hazTierDrop(2), 0);
eq('3 zones', M.hazTierDrop(3), 1);
eq('4 zones', M.hazTierDrop(4), 1);
eq('5 zones', M.hazTierDrop(5), 2);
eq('9 zones', M.hazTierDrop(9), 2);
eq('no record', M.hazTierDrop(undefined), 0);

/* tiers drop and stop at Weak */
eq('Epic -1', M.dropTier('Epic', 1), 'Fine');
eq('Epic -2', M.dropTier('Epic', 2), 'Weak');
eq('Fine -1', M.dropTier('Fine', 1), 'Weak');
eq('Weak -2', M.dropTier('Weak', 2), 'Weak');
eq('Fine -0', M.dropTier('Fine', 0), 'Fine');

/* wiring in the build */
eq('swordBase uses the health factor', /function swordBase\(w\)\{[^}]*hazPriceMul\(w && w\.hp\)/.test(src), true);
eq('finishBlade keeps hp and haz on the sword', src.includes('hp:Math.round(melt?melt.hp:BLADE_HP_MAX), haz:hz'), true);
eq('cbCraft applies the recipe route', src.includes('hp:(r.hp!=null?r.hp:100), haz:(r.haz||0)'), true);
eq('ingots keep the zones crossed', src.includes('hazSeen:(melt.hazSeen||[]).slice()'), true);
const line = id => { const r = src.match(new RegExp('\\n\\s*' + id + ': "([^"]*)"')); return r ? r[1] : null; };
eq('D69b text', line('D69b'), 'The sword will take damage if we force it through the hazards, and a damaged sword sells for less.');
eq('D69d text', line('D69d'), 'The sword was damaged because of the Hazard zones. It will sell for a little less.');   /* owner, 2026-10-10 */
const keys = [...src.matchAll(/\n\s*(D\d+[a-z]?): "/g)].map(x => x[1]);
eq('D69d follows D69c', keys[keys.indexOf('D69d') - 1], 'D69c');

/* r216 (owner, 2026-10-01): the hazard lines play the first time the sword crosses a hazard WHILE
   BUILDING THE FIRE SWORD, not on the first crossing ever; the PART 2-3 jumps leave them unsaid */
eq('fire-run stages', (src.match(/const TUT_FIRE_BUILD = (\[[^\]]*\]);/) || [])[1],
  "['fire-grind','fire-heat1','fire-spot','fire-reheat','fire-mang','fire-heat2']");
eq('tutHazardStep waits for the fire run', src.includes('if(TUT_SAIDHAZ || TUT_FIRE_BUILD.indexOf(TUT_STAGE)<0) return; TUT_SAIDHAZ=true;'), true);
eq('PART 2-3 jumps leave the hazard lines unsaid', src.includes('TUT_SAIDBOOK=true; TUT_SAIDMUG=true;') && src.includes('if(n>=4) TUT_SAIDHAZ=true;'), true);
/* r217 (owner, 2026-10-01): "Integrity" is "Health" to the player, and the row shows the gold lost, in red */
/* 2026-10-09: the new craft window - Health and the gold lost (in red) on its details paper */
eq('craft window row is Health, gold lost in red', src.includes("'Health '+Math.round(hp*100)+'%'+(w.hp!=null ? '<br><small>'+hazLostHtml(w)+'</small>' : '')"), true);
eq('the row names the gold lost', src.includes("'Gold lost: <span class=\"cr-lost\">-'+lost+'g</span>'"), true);
eq('gold lost = full-health base minus base', src.includes('const lost=swordBase(Object.assign({}, w, { hp:100 })) - swordBase(w);'), true);
eq('no "integrity" left in what the player reads', ['title="Blade integrity', 'it is losing integrity', "row('Integrity'"].every(t => !src.includes(t)), true);
console.log('[hazard] GREEN / ' + n + ' checks');
