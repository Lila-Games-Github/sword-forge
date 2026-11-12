/* FTUE v3 shared systems (the market, shaped orders, Durable), guarded against drift.
 *
 * Record: specs/2026-10-07-ftue-v3-rework.md (D2 price, D5 trait and shape table, D6 market closed,
 * D7 every order names a shape, D14/D16 undiscovered traits, D50 no bulk craft; "Build record: shared
 * systems"). The build keeps the values in MARKET between the MARKET-CONFIG markers and the rules
 * between the MARKET-PURE markers. This test reads both OUT OF THE SHIPPED HTML.
 * Run: node tooling/market/market.test.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const HTML = 'Swordforge_looptest_landscape.html';
const src = readFileSync(HTML, 'utf8');
const pick = (tag) => { const m = src.match(new RegExp('/\\* ' + tag + '-BEGIN \\*/([\\s\\S]*?)/\\* ' + tag + '-END \\*/'));
  assert.ok(m, tag + ' markers not found in ' + HTML); return m[1]; };
const M = new Function(pick('FTUE-CONFIG') + pick('MARKET-CONFIG') + pick('MARKET-DESC') + pick('MARKET-PURE') +
  '; return { FTUE, MARKET, marketShapes, marketRow, orderMatches, orderLabel, ftueTraitKey, marketSteps, marketPrice,' +
  ' MK_ROT, MARKET_DESC, mkPages, mkWrap, mkPageOf, mkFirstPage, mkFling, mkTurn, mkStamp, mkRingDelta, mkTagPos, mkBuyFace };')();
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
eq('R38: the grid is gone (no sliding strip of trait columns)', src.includes('id="mkScroll"') || src.includes('marketSlide('), false);
/* R26 (owner, 2026-10-28): "market is no longer there (will add a separate image icon on customer counter later)" - a temporary button on the counter */
/* R30 (owner, 2026-10-29): "the market is now the rotary which can slide right to go behind the inventory panel" */
eq('MARKET on the customer counter: the rotary (R30)', /r\.id='marketBtn';[^\n]*r\.title='Market';/.test(src), true);
eq('SKILL TREE shows a tree (D9; R26: the owner\'s tree art)', src.includes('<img class="sk-art" src="assets/ui/icon_skilltree.webp" alt="">'), true);
eq('closed market toast (D6)', src.includes("toast('Play more to unlock')"), true);
eq('the sale checks the order', src.includes('if(ftueC && !orderMatches(ftueC, COUNTER)){'), true);
eq('the dragon pays with coins (D10; R96: they fly to the gold counter and the player buys)', src.includes('function ftueDeposit(m, toEl, then){') && !src.includes('function marketGift('), true);
eq('no CRAFT 5 (D50)', src.includes('id="cbCraft5"'), false);
eq('the shape picker lists the market column', /function shapeGrid\(\)\{[\s\S]{0,300}marketShapes\(k\)/.test(src), true);

/* r299 (owner, 2026-10-21): a locked shape in the shape window shows its price and a BUY that buys as the market does */
eq('a locked shape shows BUY and its price (r301: greyed when the gold cannot cover it; R112: or the tutorial refuses it)', /function shapeGrid\(\)\{[\s\S]{0,1400}'<b class="sf-buy'\+\(GOLD<marketPrice\(k, sh\) \|\| !ftueBlueprintOk\(k, sh\) \? ' poor' : ''\)\+'">BUY '\+marketPrice\(k, sh\)\+'g<\/b>'/.test(src), true);
eq('tapping a locked shape buys it (not the old "buy it in the market" toast)', /function shapeGrid\(\)\{[\s\S]{0,1400}if\(!ftueShapeOpen\(k, sh\)\)\{ shapeBuy\(k, sh\); return; \}/.test(src) && !src.includes("blueprint in the market'); return; } selectShape(sh); });"), true);
eq('shapeBuy: the market\'s checks, price, gold and quests', /function shapeBuy\(k, sh\)\{ const st=marketRow\(k, sh, marketCtx\(k, sh\)\)[\s\S]{0,700}GOLD-=marketPrice\(k, sh\); FTUE_ST\.shapes\[k\+':'\+sh\]=true;[\s\S]{0,300}bumpQuest\('buyBlueprint'\); if\(k==='fire'\) bumpQuest\('buyFire'\);/.test(src), true);
eq('the BUY stays bright on a locked shape', src.includes('.sf-shape.locked > .ic, .sf-shape.locked > span { opacity: .55; filter: grayscale(1); }') && src.includes('.sf-shape.locked { cursor: pointer; }') && src.includes('.sf-shape .sf-buy {'), true);

/* R38 (owner, 2026-10-29): the rotary market. Record: specs/2026-10-29-rotary-market.md */
const REC = readFileSync('specs/2026-10-29-rotary-market.md', 'utf8');
const recRows = REC.split('\n').filter(l => /^\| [a-z]+ \| /.test(l)).map(l => l.replace(/^\| | \|\s*$/g, '').split(' | '));
const { MK_ROT, MARKET_DESC } = M;
eq('rotary values (record: Values)', { visible: MK_ROT.visible, sel: MK_ROT.sel, fling: MK_ROT.fling, turn: MK_ROT.turn, flick: MK_ROT.flick, laterMs: MK_ROT.laterMs, stamp: MK_ROT.stamp },
  { visible: 4, sel: 1, fling: 0.35, turn: 0.12, flick: 0.5, laterMs: 1600, stamp: { free: 'OWNED', owned: 'PURCHASED' } });
eq('rotary geometry (record: Values, geo)', MK_ROT.geo, { stepDeg: 27, selDeg: -14, cy: 900, r: 230, x: 1258, dx: 18, fadeDeg: -48, goneDeg: -62, botDeg: 58 });
eq('the art', MK_ROT.art, 'assets/ui/market_rotary.webp');
const tagRec = {}; recRows.filter(r => r.length === 3 && MARKET.traits.includes(r[0])).forEach(r => { tagRec[r[0]] = [r[1], r[2]]; });
eq('a tag colour for every trait, as recorded', MK_ROT.tags, tagRec);
eq('the undiscovered tag, as recorded', MK_ROT.unknown, (REC.match(/\| \? \(undiscovered\) \| (#\w+) \| (#\w+) \|/) || []).slice(1));
const descRec = {}; recRows.filter(r => r.length === 4 && MARKET.traits.includes(r[0])).forEach(r => { (descRec[r[0]] = descRec[r[0]] || {})[r[1]] = r[3]; });
eq('MARKET_DESC is the record\'s table, line for line', MARKET_DESC, descRec);
eq('the record\'s prices are the market\'s', recRows.filter(r => r.length === 4 && MARKET.traits.includes(r[0])).every(r => M.marketPrice(r[0], r[1]) === +r[2]), true);
eq('one line for every shape of every trait', MARKET.traits.map(t => Object.keys(MARKET_DESC[t] || {}).sort().join()), MARKET.traits.map(t => M.marketShapes(t).slice().sort().join()));
const lines = Object.values(MARKET_DESC).flatMap(o => Object.values(o));
eq('250 lines, no two alike', [lines.length, new Set(lines).size], [250, 250]);
eq('each line at most 64 characters, straight quotes, no dashes', lines.filter(l => l.length > 64 || /[\u2018\u2019\u201c\u201d\u2013\u2014]/.test(l)), []);
eq('the owner\'s two lines', [MARKET_DESC.balanced.Shortsword, MARKET_DESC.fire.Shortsword],
  ['Compact, clean and simple. The most basic sword.', 'Small, but fiery. Do not underestimate. It will get angry.']);
const pages = M.mkPages();
eq('a page per blueprint, 250', pages.length, 250);
eq('Balanced first, Shortsword then the price order', pages.slice(0, 10).map(p => p.trait + ':' + p.shape), ['Shortsword', ...M.marketSteps('balanced')].map(s => 'balanced:' + s));
eq('then Fire\'s Shortsword', [M.mkFirstPage('fire'), pages[10].trait + ':' + pages[10].shape], [10, 'fire:Shortsword']);
eq('the last page is Dark\'s dearest', pages[249].trait + ':' + pages[249].shape, 'dark:' + M.marketSteps('dark').slice(-1)[0]);
eq('a page found by its blueprint', M.mkPageOf('fire', 'Claymore'), 10 + 1 + M.marketSteps('fire').indexOf('Claymore'));
eq('pages wrap: before the first is the last, after the last the first', [M.mkWrap(-1, 250), M.mkWrap(250, 250), M.mkWrap(9 + 1, 250)], [249, 0, 10]);
eq('the wheel turns the short way round the ring', [M.mkRingDelta(24, 0, 25), M.mkRingDelta(0, 24, 25), M.mkRingDelta(3, 10, 25), M.mkRingDelta(0, 13, 25)], [1, -1, 7, -12]);
eq('the swipe sets the turn: none, slow, fast', [M.mkFling(3, 0), M.mkFling(3, 10), M.mkFling(3.4, -1), M.mkFling(0, 40)], [3, 7, 3, 14]);
eq('a page turns on a long drag or a flick; up is next', [M.mkTurn(-13, 100, 0), M.mkTurn(-11, 100, 0), M.mkTurn(13, 100, 0), M.mkTurn(-2, 100, -0.6), M.mkTurn(2, 100, 0.6), M.mkTurn(-2, 100, -0.3)], [1, 0, -1, 1, -1, 0]);
eq('stamps: the Shortsword OWNED, a bought one PURCHASED, none to buy', [M.mkStamp('free'), M.mkStamp('owned'), M.mkStamp('buy'), M.mkStamp('poor')], ['OWNED', 'PURCHASED', '', '']);
const offs = []; for (let o = -12; o <= 12; o++) offs.push(o);
const vis = offs.filter(o => M.mkTagPos(o).op > 0);
eq('four tags visible', vis, [-1, 0, 1, 2]);
eq('the selected tag is the second from the top', vis.slice().sort((a, b) => M.mkTagPos(a).y - M.mkTagPos(b).y).indexOf(0), MK_ROT.sel);
eq('the selected tag sits on the drum (art y 844)', Math.round(M.mkTagPos(0).y), 844);
eq('a tag fades over the top of the drum', M.mkTagPos(-1.5).op > 0 && M.mkTagPos(-1.5).op < 1, true);
eq('the buy button: Buy for and the price; padlock and price when locked; padlock only when the dragon pays',
  [M.mkBuyFace('buy', 450).includes('Buy for') && M.mkBuyFace('buy', 450).includes('450'), M.mkBuyFace('unknown', 300).includes('\u{1F512}') && M.mkBuyFace('unknown', 300).includes('300'),
   M.mkBuyFace('gift', 450).includes('\u{1F512}') && !M.mkBuyFace('gift', 450).includes('450')], [true, true, true]);
eq('the window: art, wheel, page, buy button, stamp, close', ['<img class="mk-art" src="assets/ui/market_rotary.webp"', 'id="mkWheel"', 'id="mkPage"', 'id="mkBuy"', 'id="mkClose"', 'id="mkStamp"'].filter(x => !src.includes(x)), []);
const webp = existsSync('assets/ui/market_rotary.webp') ? readFileSync('assets/ui/market_rotary.webp') : Buffer.alloc(12);
eq('the art is a webp', webp.slice(0, 4).toString() + webp.slice(8, 12).toString(), 'RIFFWEBP');
eq('the black overlay stays (the modal\'s own)', src.includes('.sf-modal { position: absolute; inset: 0; z-index: 1000; display: none; align-items: center; justify-content: center; background: rgba(0,0,0,0.55); }'), true);
eq('swiping is locked while the tutorial shows a blueprint', /function mkLocked\(\)\{[^\n]*FTUE_MK[^\n]*'gift'[^\n]*'buy'[^\n]*MK_LOCK/.test(src), true);

console.log('[market] GREEN / ' + n + ' checks');
