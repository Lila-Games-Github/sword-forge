/* FTUE (the tutorial in six parts) config, guarded against drift.
 *
 * The recorded values live in specs/2026-09-29-tutorial-parts-plan.md ("Part 1 build record").
 * The build keeps them in ONE object, FTUE, between the FTUE-CONFIG markers. This test reads that
 * object OUT OF THE SHIPPED HTML and asserts it equals the record, so a change to either side that
 * is not made to the other fails here.
 * Run: node tooling/ftue/ftue.test.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const HTML = 'Swordforge_looptest_landscape.html';
const src = readFileSync(HTML, 'utf8');

const m = src.match(/\/\* FTUE-CONFIG-BEGIN \*\/([\s\S]*?)\/\* FTUE-CONFIG-END \*\//);
assert.ok(m, 'FTUE-CONFIG markers not found in ' + HTML);
const FTUE = new Function(m[1] + '; return FTUE;')();

let n = 0;
function eq(label, got, want) { assert.deepStrictEqual(got, want, label); n++; console.log('  ok   ' + label); }

/* the record */
eq('oreStart',   FTUE.oreStart,   { iron: 12, manganese: 12 });
eq('firstCraft', FTUE.firstCraft, { iron: 2, manganese: 2 });
eq('gpcCraft',   FTUE.gpcCraft,   { iron: 2, manganese: 2 });
eq('preQuests',  FTUE.preQuests,  [
  { id: 'sellOne',  label: 'Sell a sword',  gold: 10, xp: 20 },
  { id: 'craftOne', label: 'Craft a sword', gold: 10, xp: 20 } ]);
eq('startShape', FTUE.startShape, 'Shortsword');
eq('shapes',     FTUE.shapes,     {
  balanced: ['Shortsword', 'Longsword', 'Broadsword'],
  fire:     ['Shortsword', 'Longsword', 'Broadsword'],
  gale:     ['Shortsword', 'Longsword', 'Rapier'],
  swift:    ['Shortsword', 'Longsword', 'Dagger'] });   /* r208: the swift Dagger replaces the swift Rapier */
eq('part 1 gpc', FTUE.parts[1].gpc, [ { trait: 'balanced', qty: 1 }, { trait: 'balanced', qty: 1 } ]);
eq('part 1 rewards', FTUE.parts[1].rewards, {
  tc:   [ { kind: 'decor', id: 'banner' } ],
  gpc1: [ { kind: 'blueprint', trait: 'balanced', shape: 'Longsword' } ],
  gpc2: [ { kind: 'blueprint', trait: 'balanced', shape: 'Broadsword' }, { kind: 'unlock', id: 'grindstone' } ] });
eq('part 1 after', FTUE.parts[1].after, 'bell');
/* part 2 (r201) */
eq('recipePages', FTUE.recipePages, 3);
eq('tc2Ore (safety net when TC2 arrives)', FTUE.tc2Ore, { iron: 6, manganese: 6 });
eq('tc2Craft (the most the TC2 sword takes)', FTUE.tc2Craft, { iron: 1, manganese: 1 });
eq('part 2 gpc', FTUE.parts[2].gpc, [ { trait: 'balanced', qty: 5 } ]);
eq('part 2 ensureOre (for the bulk craft)', FTUE.parts[2].ensureOre, { iron: 5, manganese: 5 });
eq('part 2 after', FTUE.parts[2].after, 'bell2');
eq('part 2 rewards', FTUE.parts[2].rewards, {
  tc:   [ { kind: 'pages', n: 5 } ],
  gpc1: [ { kind: 'unlock', id: 'designDesk' } ] });
/* part 3 (r203) */
eq('startParts (per trait, per kind)', FTUE.startParts, 3);
eq('part 3 gpc', FTUE.parts[3].gpc, [ { trait: 'fire', qty: 1 }, { trait: 'balanced', qty: 1 }, { trait: 'fire', qty: 1 } ]);
eq('part 3 after', FTUE.parts[3].after, 'd2-bell');
eq('part 3 rewards', FTUE.parts[3].rewards, {
  tc:   [ { kind: 'parts', trait: 'balanced' }, { kind: 'parts', trait: 'fire' }, { kind: 'blueprint', trait: 'fire', shape: 'Longsword' } ],
  gpc1: [ { kind: 'blueprint', trait: 'fire', shape: 'Broadsword' } ],
  gpc2: [],
  gpc3: [ { kind: 'parts', trait: 'fire' } ] });
eq('day2Cave', FTUE.day2Cave, { iron: 12, manganese: 12, copper: 24, aluminium: 7 });
eq('day2Swing', FTUE.day2Swing, [2, 3]);
/* placeholder parts carry the owner's art-list names and show an existing image until the art lands */
const alias = src.match(/const DD_ALIAS = (\{[^}]*\});/);
eq('DD_ALIAS present', !!alias, true);
/* r211 (owner art, 2026-10-01): every placeholder now has its real file, so the list is empty */
eq('DD_ALIAS names', Object.keys(new Function('return ' + alias[1])()).sort(), []);
/* r211: gale's own blades; Garric's gift carries the new balanced parts (pommel5 moves there too) */
const tbl = name => new Function('return ' + src.match(new RegExp('const ' + name + ' = (\\{[\\s\\S]*?\\});\\r?\\n'))[1])();
const BLADES = tbl('DD_BLADES'), SETS = tbl('DD_SETS'), BONUS = tbl('DD_BONUS'), EXTRA = tbl('DD_EXTRA');
eq('gale blades', BLADES.gale, ['longsword', 'rapier', 'shortsword']);
eq('Garric gift (DD_BONUS.balanced)', BONUS.balanced, { grip: ['grip5', 'grip6'], guard: ['guard5', 'guard6'], pommel: ['pommel5', 'pommel6'] });
eq('balanced pommels (pommel5 moved to the gift)', SETS.balanced.pommel, ['pommel1', 'pommel2', 'pommel3', 'pommel4']);
eq('decor.banner image', FTUE.decor.banner.img, 'assets/Decor/Banner.webp');
/* every part, blade and decor image the build names must be on disk */
const DIR = { grip: 'grips', guard: 'guards', pommel: 'pommels' }, missing = [];
for (const set of [SETS, BONUS, EXTRA]) for (const sk in set) for (const k in set[sk]) for (const id of set[sk][k]) {
  const f = 'assets/sword-parts/' + DIR[k] + '/' + id + '.webp'; if (!existsSync(f)) missing.push(f); }
for (const sk in BLADES) for (const sh of BLADES[sk]) { const f = 'assets/sword-parts/blades/' + sk + '_' + sh + '_blade.webp'; if (!existsSync(f)) missing.push(f); }
for (const id in FTUE.decor) if (FTUE.decor[id].img && !existsSync(FTUE.decor[id].img)) missing.push(FTUE.decor[id].img);
eq('every named part, blade and decor image exists', missing, []);
/* part 4 (r204) */
eq('part 4 gpc', FTUE.parts[4].gpc, [ { trait: 'gale', qty: 1 }, { trait: 'fire', qty: 1 } ]);
eq('part 4 after', FTUE.parts[4].after, 'd2-praise');
eq('part 4 rewards', FTUE.parts[4].rewards, {
  tc:   [ { kind: 'blueprint', trait: 'gale', shape: 'Longsword' }, { kind: 'parts', trait: 'gale' } ],
  gpc1: [ { kind: 'blueprint', trait: 'gale', shape: 'Rapier' }, { kind: 'parts', trait: 'gale' } ],
  gpc2: [] });
eq('swiftLine', FTUE.swiftLine, 'D99a');
eq('gale has its own part set', /const DD_SKIN_OF = {[^}]*gale:'gale'/.test(src), true);
/* part 5 (r205) */
eq('part 5 gpc', FTUE.parts[5].gpc, [ { trait: 'gale', qty: 1 }, { trait: 'swift', qty: 1 } ]);
eq('part 5 after', FTUE.parts[5].after, 'g-bell');
eq('part 5 rewards', FTUE.parts[5].rewards, {
  tc:   [],
  gpc1: [ { kind: 'blueprint', trait: 'swift', shape: 'Dagger' } ],
  gpc2: [ { kind: 'parts', trait: 'swift' } ] });
eq('bramLine', FTUE.bramLine, 'D111a');
/* part 6 (r206): Garric has three endings, and every one of them ends the FTUE */
eq('endLines', FTUE.endLines, ['D133', 'D136', 'D139']);
eq('garricLeaves ends on the endLines', src.includes("sayQueue(g===1?'D132':g===2?'D135':'D138', g===1?'D133':g===2?'D136':'D139')"), true);
eq('say() ends the FTUE on any end line', src.includes('FTUE.endLines.indexOf(id)>=0'), true);
eq('swift Dagger blade is swift_dagger_blade', /swift:['dagger','longsword','shortsword']/.test(src), true);
eq('decor.banner size', { w: FTUE.decor.banner.w, h: FTUE.decor.banner.h }, { w: 10, h: 24 });
eq('retryLine',  FTUE.retryLine,  'D28a');

/* the shipped dialogue and ore start must agree with it */
const line = id => { const r = src.match(new RegExp('\\n\\s*' + id + ': "([^"]*)"')); return r ? r[1] : null; };
eq('D28a text', line('D28a'), 'Use 2 iron and 2 manganese for the balanced sword.');
eq('D99a text', line('D99a'), "Use it later. We don't need that now.");
eq('D111a text', line('D111a'), "The previous sword was good, but it wasn't very sharp. Can you make it sharper?");
eq('D29 text',  line('D29'),  "I saw a man walk out of this place. He couldn't stop beaming at his sword. I want to see what kind of swords you are crafting here. Give me a good one.");
eq('D31 text',  line('D31'),  'So many customers. No tea break for us. Back to the forge we go.');
eq('D32 text',  line('D32'),  "Hmm, we are low on ores. Why don't we use the grindstone to make our ores go further?");
eq('D33 text',  line('D33'),  'We can travel further on the map if we grind the ores before we put them in the smelter.');
eq('D34 text',  line('D34'),  'If we do it properly, we can craft 6 more swords instead of just 3!');
/* r210 (owner, 2026-10-01): D57 names the sharpening, so {b} is the sharpening bonus alone */
eq('D57 text', line('D57'), "We got a {b}g bonus this time from sharpening the sword! Let's make a lot of money, then we can buy whatever we want! Muwahaha!");
eq('{b} is the sharpening bonus only', src.includes('SAY_VARS.b=P.sharp;'), true);
eq('ORE_START reads FTUE', /const ORE_START=\{[^}]*iron:FTUE\.oreStart\.iron, manganese:FTUE\.oreStart\.manganese/.test(src), true);

/* D28a must sit beside D28, never at the end: lastLine() is the map's final key */
const keys = [...src.matchAll(/\n\s*(D\d+[a-z]?): "/g)].map(x => x[1]);
eq('D28a follows D28', keys[keys.indexOf('D28a') - 1], 'D28');
eq('D111a follows D111', keys[keys.indexOf('D111a') - 1], 'D111');
eq('last key still D139', keys[keys.length - 1], 'D139');

console.log('[ftue] GREEN / ' + n + ' checks');
