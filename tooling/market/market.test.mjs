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
  '; return { FTUE, MARKET, marketShapes, marketRow, orderMatches, orderLabel, ftueTraitKey, marketSteps, marketPrice };')();
const { FTUE, MARKET } = M;

let n = 0;
function eq(label, got, want) { assert.deepStrictEqual(got, want, label); n++; console.log('  ok   ' + label); }

/* D2, D5: the record */
/* owner, 2026-10-09: rising prices - 50 x (the trait's place + the shape's step) - and all 25 traits in the market */
eq('price step', MARKET.priceStep, 50);
eq('traits: the chart\'s five, then the map\'s other twenty in its own order', MARKET.traits, ['balanced', 'fire', 'swift', 'gale', 'durable',
  'flexible', 'heavy', 'celestial', 'cloud', 'rainbow', 'luck', 'lightning', 'noble', 'grace', 'floral', 'fury', 'ice',
  'water', 'magma', 'mist', 'poison', 'savage', 'blood', 'cursed', 'dark']);
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
eq('10 shapes per trait, 250 in all', MARKET.traits.map(t => M.marketShapes(t).length), MARKET.traits.map(() => 10));
eq('the other traits have Balanced\'s shapes', M.marketShapes('ice'), M.marketShapes('balanced'));
/* the price order: the trait's own base shapes, then the six new ones, then its last extra (owner, 2026-10-09) */
eq('balanced steps', M.marketSteps('balanced'), ['Longsword', 'Broadsword', ...NEW7, 'Dagger']);
eq('swift steps', M.marketSteps('swift'), ['Longsword', 'Dagger', ...NEW7, 'Rapier']);
eq('gale steps', M.marketSteps('gale'), ['Longsword', 'Rapier', ...NEW7, 'Dagger']);
const P = (t, s) => M.marketPrice(t, s);
eq('balanced: 50, 100, 150 ... Dagger 450', [P('balanced','Longsword'), P('balanced','Broadsword'), P('balanced','Katana'), P('balanced','Dagger')], [50, 100, 150, 450]);
eq('fire: 100, 150, 200', [P('fire','Longsword'), P('fire','Broadsword'), P('fire','Katana')], [100, 150, 200]);
eq('swift: Longsword 150, Dagger 200, Rapier 550', [P('swift','Longsword'), P('swift','Dagger'), P('swift','Rapier')], [150, 200, 550]);
eq('gale Rapier 250; durable Longsword 250', [P('gale','Rapier'), P('durable','Longsword')], [250, 250]);
eq('flexible Longsword 300; dark Claymore 1600', [P('flexible','Longsword'), P('dark','Claymore')], [300, 1600]);
eq('Shortsword is free', P('ice','Shortsword'), 0);

/* a row's state, in order of precedence */
const ctx = (o) => Object.assign({ open: true, known: true, owned: false, gold: 80 }, o);
eq('Shortsword is free', M.marketRow('fire', 'Shortsword', ctx({ open: false, known: false })), 'free');
eq('owned', M.marketRow('fire', 'Katana', ctx({ owned: true, open: false })), 'owned');
eq('market not open yet (D6)', M.marketRow('fire', 'Katana', ctx({ open: false })), 'closed');
eq('undiscovered trait is locked (D16)', M.marketRow('fire', 'Katana', ctx({ known: false })), 'unknown');
eq('not enough gold (fire Katana 200)', M.marketRow('fire', 'Katana', ctx({ gold: 199 })), 'poor');
eq('exactly the price buys', M.marketRow('fire', 'Katana', ctx({ gold: 200 })), 'buy');

/* D7: an order names a shape; an order with none takes any shape (TC2, TC4, Garric) */
const w = (tid, shape) => ({ shape, traits: [{ tid, tier: 'Fine' }] });
eq('shaped order, right sword', M.orderMatches({ trait: 'balanced', shape: 'Katana' }, w('balanced', 'Katana')), true);
eq('shaped order, wrong shape', M.orderMatches({ trait: 'balanced', shape: 'Katana' }, w('balanced', 'Longsword')), false);
eq('wrong trait', M.orderMatches({ trait: 'fire', shape: 'Katana' }, w('balanced', 'Katana')), false);
eq('no shape: any shape', M.orderMatches({ trait: 'durable' }, w('durable', 'Claymore')), true);
eq('old-save trait form (t.id)', M.orderMatches({ trait: 'fire' }, { shape: 'Longsword', traits: [{ t: { id: 'fire' } }] }), true);
/* v3 part 4: an order may name a tier too (TC4 Epic, GC8 Weak); the sword's best tier must equal it */
eq('tier: Epic asked, Epic given', M.orderMatches({ trait: 'durable', tier: 'Epic' }, { shape: 'Katana', traits: [{ tid: 'durable', tier: 'Epic' }] }), true);
eq('tier: Epic asked, Fine given', M.orderMatches({ trait: 'durable', tier: 'Epic' }, w('durable', 'Katana')), false);
eq('tier: Weak asked, Weak given', M.orderMatches({ trait: 'balanced', shape: 'Longsword', tier: 'Weak' }, { shape: 'Longsword', traits: [{ tid: 'balanced', tier: 'Weak' }] }), true);
eq('tier: Weak asked, Fine given', M.orderMatches({ trait: 'balanced', shape: 'Longsword', tier: 'Weak' }, w('balanced', 'Longsword')), false);
eq('label with a shape', M.orderLabel('Balanced', 'Katana'), 'Balanced Katana');
eq('label without one', M.orderLabel('Balanced', null), 'Balanced sword');

/* Durable is a trait key now (I9) */
eq('durable key', M.ftueTraitKey(['durable']), 'durable');
eq('fire wins over durable', M.ftueTraitKey(['durable', 'fire']), 'fire');
eq('plain balanced', M.ftueTraitKey(['balanced']), 'balanced');
eq('any market trait is a key (an ice blade offers ice shapes)', M.ftueTraitKey(['balanced', 'ice']), 'ice');
eq('fire still wins over another elemental', M.ftueTraitKey(['ice', 'fire']), 'fire');

/* wiring in the build */
eq('the market slides: a fixed shape column and a scrolling strip of trait columns', src.includes('<div class="mk-scroll" id="mkScroll">') && src.includes("onclick=\"marketSlide(-1)\"") && src.includes("onclick=\"marketSlide(1)\""), true);
eq('MARKET button beside SKILL TREE', /id="skillBtn"[\s\S]{0,400}<\/button>\s*<button id="marketBtn"/.test(src), true);
eq('SKILL TREE shows a tree icon (D9)', src.includes('<span class="sk-t sk-ic">\u{1F333}</span>'), true);
eq('closed market toast (D6)', src.includes("toast('Play more to unlock')"), true);
eq('the sale checks the order', src.includes('if(ftueC && !orderMatches(ftueC, COUNTER)){'), true);
eq('the dragon buys with coins (D10)', src.includes('function marketGift(trait, shape, done){'), true);
eq('no CRAFT 5 (D50)', src.includes('id="cbCraft5"'), false);
eq('the shape picker lists the market column', /function shapeGrid\(\)\{[\s\S]{0,300}marketShapes\(k\)/.test(src), true);

/* r299 (owner, 2026-10-21): a locked shape in the shape window shows its price and a BUY that buys as the market does */
eq('a locked shape shows BUY and its price (r301: greyed when the gold cannot cover it)', /function shapeGrid\(\)\{[\s\S]{0,1400}'<b class="sf-buy'\+\(GOLD<marketPrice\(k, sh\) \? ' poor' : ''\)\+'">BUY '\+marketPrice\(k, sh\)\+'g<\/b>'/.test(src), true);
eq('tapping a locked shape buys it (not the old "buy it in the market" toast)', /function shapeGrid\(\)\{[\s\S]{0,1400}if\(!ftueShapeOpen\(k, sh\)\)\{ shapeBuy\(k, sh\); return; \}/.test(src) && !src.includes("blueprint in the market'); return; } selectShape(sh); });"), true);
eq('shapeBuy: the market\'s checks, price, gold and quests', /function shapeBuy\(k, sh\)\{ const st=marketRow\(k, sh, marketCtx\(k, sh\)\)[\s\S]{0,700}GOLD-=marketPrice\(k, sh\); FTUE_ST\.shapes\[k\+':'\+sh\]=true;[\s\S]{0,300}bumpQuest\('buyBlueprint'\); if\(k==='fire'\) bumpQuest\('buyFire'\);/.test(src), true);
eq('the BUY stays bright on a locked shape', src.includes('.sf-shape.locked > .ic, .sf-shape.locked > span { opacity: .55; filter: grayscale(1); }') && src.includes('.sf-shape.locked { cursor: pointer; }') && src.includes('.sf-shape .sf-buy {'), true);

console.log('[market] GREEN / ' + n + ' checks');
