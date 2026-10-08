/* FTUE v3 shared systems (the market, shaped orders, Durable), guarded against drift.
 *
 * Record: specs/2026-10-07-ftue-v3-rework.md (D2 price, D5 trait and shape table, D6 market closed,
 * D7 every order names a shape, D14/D16 undiscovered traits, D50 no bulk craft; "Build record: shared
 * systems"). The build keeps the values in MARKET between the MARKET-CONFIG markers and the rules
 * between the MARKET-PURE markers. This test reads both OUT OF THE SHIPPED HTML.
 * Run: node tooling/market/market.test.mjs
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const HTML = 'Swordforge_looptest_landscape.html';
const src = readFileSync(HTML, 'utf8');
const pick = (tag) => { const m = src.match(new RegExp('/\\* ' + tag + '-BEGIN \\*/([\\s\\S]*?)/\\* ' + tag + '-END \\*/'));
  assert.ok(m, tag + ' markers not found in ' + HTML); return m[1]; };
const M = new Function(pick('FTUE-CONFIG') + pick('MARKET-CONFIG') + pick('MARKET-PURE') +
  '; return { FTUE, MARKET, marketShapes, marketRow, orderMatches, orderLabel, ftueTraitKey };')();
const { FTUE, MARKET } = M;

let n = 0;
function eq(label, got, want) { assert.deepStrictEqual(got, want, label); n++; console.log('  ok   ' + label); }

/* D2, D5: the record */
eq('price (D2)', MARKET.price, 50);
eq('traits, chart order (D5)', MARKET.traits, ['balanced', 'fire', 'swift', 'gale', 'durable']);
eq('shapes, chart order (D5)', MARKET.order, ['Shortsword', 'Longsword', 'Broadsword', 'Rapier', 'Dagger',
  'Katana', 'Cutlass', 'Machete', 'Saber', 'Scimitar', 'Claymore']);
eq('Durable base shapes (purple, D5)', FTUE.shapes.durable, ['Shortsword', 'Longsword', 'Broadsword']);
const NEW7 = ['Katana', 'Cutlass', 'Machete', 'Saber', 'Scimitar', 'Claymore'];
eq('market-only shapes (pink, D5)', MARKET.extra, {
  balanced: ['Dagger', ...NEW7], fire: ['Dagger', ...NEW7], swift: ['Rapier', ...NEW7],
  gale: ['Dagger', ...NEW7], durable: ['Dagger', ...NEW7] });
eq('balanced column', M.marketShapes('balanced'), ['Shortsword', 'Longsword', 'Broadsword', 'Dagger', ...NEW7]);
eq('swift column', M.marketShapes('swift'), ['Shortsword', 'Longsword', 'Rapier', 'Dagger', ...NEW7]);
eq('gale column', M.marketShapes('gale'), ['Shortsword', 'Longsword', 'Rapier', 'Dagger', ...NEW7]);
eq('durable column', M.marketShapes('durable'), ['Shortsword', 'Longsword', 'Broadsword', 'Dagger', ...NEW7]);
eq('10 shapes per trait, 50 in all', MARKET.traits.map(t => M.marketShapes(t).length), [10, 10, 10, 10, 10]);

/* a row's state, in order of precedence */
const ctx = (o) => Object.assign({ open: true, known: true, owned: false, gold: 80 }, o);
eq('Shortsword is free', M.marketRow('fire', 'Shortsword', ctx({ open: false, known: false })), 'free');
eq('owned', M.marketRow('fire', 'Katana', ctx({ owned: true, open: false })), 'owned');
eq('market not open yet (D6)', M.marketRow('fire', 'Katana', ctx({ open: false })), 'closed');
eq('undiscovered trait is locked (D16)', M.marketRow('fire', 'Katana', ctx({ known: false })), 'unknown');
eq('not enough gold', M.marketRow('fire', 'Katana', ctx({ gold: 49 })), 'poor');
eq('exactly the price buys', M.marketRow('fire', 'Katana', ctx({ gold: 50 })), 'buy');

/* D7: an order names a shape; an order with none takes any shape (TC2, TC4, Garric) */
const w = (tid, shape) => ({ shape, traits: [{ tid, tier: 'Fine' }] });
eq('shaped order, right sword', M.orderMatches({ trait: 'balanced', shape: 'Katana' }, w('balanced', 'Katana')), true);
eq('shaped order, wrong shape', M.orderMatches({ trait: 'balanced', shape: 'Katana' }, w('balanced', 'Longsword')), false);
eq('wrong trait', M.orderMatches({ trait: 'fire', shape: 'Katana' }, w('balanced', 'Katana')), false);
eq('no shape: any shape', M.orderMatches({ trait: 'durable' }, w('durable', 'Claymore')), true);
eq('old-save trait form (t.id)', M.orderMatches({ trait: 'fire' }, { shape: 'Longsword', traits: [{ t: { id: 'fire' } }] }), true);
eq('label with a shape', M.orderLabel('Balanced', 'Katana'), 'Balanced Katana');
eq('label without one', M.orderLabel('Balanced', null), 'Balanced sword');

/* Durable is a trait key now (I9) */
eq('durable key', M.ftueTraitKey(['durable']), 'durable');
eq('fire wins over durable', M.ftueTraitKey(['durable', 'fire']), 'fire');
eq('plain balanced', M.ftueTraitKey(['balanced']), 'balanced');

/* wiring in the build */
eq('MARKET button beside SKILL TREE', /id="skillBtn"[\s\S]{0,400}<\/button>\s*<button id="marketBtn"/.test(src), true);
eq('SKILL TREE shows a tree icon (D9)', src.includes('<span class="sk-t sk-ic">\u{1F333}</span>'), true);
eq('closed market toast (D6)', src.includes("toast('Play more to unlock')"), true);
eq('the sale checks the order', src.includes('if(ftueC && !orderMatches(ftueC, COUNTER)){'), true);
eq('the dragon buys with coins (D10)', src.includes('function marketGift(trait, shape, done){'), true);
eq('no CRAFT 5 (D50)', src.includes('id="cbCraft5"'), false);
eq('the shape picker lists the market column', /function shapeGrid\(\)\{[\s\S]{0,300}marketShapes\(k\)/.test(src), true);

console.log('[market] GREEN / ' + n + ' checks');
