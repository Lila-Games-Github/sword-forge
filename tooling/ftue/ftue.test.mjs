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
eq('oreStart (v3 D22: 4 swords in part 1 leave 1 + 1 for TC2)', FTUE.oreStart, { iron: 9, manganese: 9 });
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
  swift:    ['Shortsword', 'Longsword', 'Dagger'],      /* r208: the swift Dagger replaces the swift Rapier */
  durable:  ['Shortsword', 'Longsword', 'Broadsword'] });   /* v3 D5: Durable joins the FTUE */
/* v3 part 1 (specs/2026-10-07-ftue-v3-rework.md D3/D10-D12, D17): three shaped orders; the dragon buys the first
   two blueprints, the player buys the Katana. No rewards in part 1 (the banner moved to Garric, the grindstone to part 2). */
eq('part 1 gpc', FTUE.parts[1].gpc, [
  { trait: 'balanced', shape: 'Longsword',  qty: 1, market: { by: 'dragon', ask: 'D28b', done: 'D28d' } },
  { trait: 'balanced', shape: 'Broadsword', qty: 1, market: { by: 'dragon', ask: 'D28e', done: 'D28f' } },
  { trait: 'balanced', shape: 'Katana',     qty: 1, market: { by: 'player', ask: 'D28g', done: 'D28i' } } ]);
eq('part 1 rewards', FTUE.parts[1].rewards, { tc: [], gpc1: [], gpc2: [], gpc3: [] });
eq('market lines: the dragon pays, the top-up', [FTUE.marketWatch, FTUE.marketShort], ['D28c', 'D28h']);
eq('part 1 after', FTUE.parts[1].after, 'bell');
/* part 2 (r201) */
eq('recipePages', FTUE.recipePages, 3);
eq('tc2Ore (v3 D22: exactly 1 + 1 when TC2 arrives)', FTUE.tc2Ore, { iron: 1, manganese: 1 });
eq('tc2Craft (the most the TC2 sword takes)', FTUE.tc2Craft, { iron: 1, manganese: 1 });
eq('part 2 gpc (v3 D18: none, no bulk order)', FTUE.parts[2].gpc, []);
eq('part 2 ensureOre gone with the bulk order', FTUE.parts[2].ensureOre, undefined);
eq('part 2 after', FTUE.parts[2].after, 'bell2');
eq('part 2 rewards (v3 D20: TC2 +5 pages; the design desk moved to part 6)', FTUE.parts[2].rewards, { tc: [ { kind: 'pages', n: 5 } ] });
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
eq('endLines', FTUE.endLines, ['D140']);   /* r213: the shared closing line after every ending */
/* r212 (owner, 2026-10-01): Garric's old rewards (r131/r132) come back through the reward window */
eq('garricRewards', FTUE.garricRewards, {
  1: [],
  2: [ { kind: 'gold', n: 10 } ],
  3: [ { kind: 'gold', n: 10 }, { kind: 'unlock', id: 'garricParts' } ] });
eq('Garric leaves through the reward window', src.includes('ftueReward(FTUE.garricRewards[g]'), true);
eq('the sale no longer pays the tip itself', /function tutGarricSold\(\)\{[\s\S]{0,500}GOLD \+= GARRIC_TIP/.test(src), false);
eq('garricLeaves ends on the endLines', src.includes("sayQueue(g===1?'D132':g===2?'D135':'D138', g===1?'D133':g===2?'D136':'D139', 'D140')"), true);
eq('say() ends the FTUE on any end line', src.includes('FTUE.endLines.indexOf(id)>=0'), true);
eq('swift Dagger blade is swift_dagger_blade', /swift:['dagger','longsword','shortsword']/.test(src), true);
eq('decor.banner size', { w: FTUE.decor.banner.w, h: FTUE.decor.banner.h }, { w: 10, h: 24 });
eq('retryLine',  FTUE.retryLine,  'D28a');

/* the shipped dialogue and ore start must agree with it */
const line = id => { const r = src.match(new RegExp('\\n\\s*' + id + ': "([^"]*)"')); return r ? r[1] : null; };
eq('D28a text', line('D28a'), 'Use 2 iron and 2 manganese for the balanced sword.');
eq('D99a text', line('D99a'), "Use it later. We don't need that now.");
/* D111a: see r213 below */
eq('D29 text',  line('D29'),  "I saw a man walk out of this place. He couldn't stop beaming at his sword. I want to see what kind of swords you are crafting here. Give me a good one.");
eq('D31 text',  line('D31'),  'So many customers. No tea break for us. Back to the forge we go.');
/* D32 changed in v3 part 2 (see V3P2 below) */
eq('D33 text',  line('D33'),  'We can travel further on the map if we grind the ores before we put them in the smelter.');
/* D34 removed in v3 part 2 (see below) */
/* r210 (owner, 2026-10-01): D57 names the sharpening, so {b} is the sharpening bonus alone */
eq('D57 text', line('D57'), "We got a {b}g bonus this time from sharpening the sword! Let's make a lot of money, then we can buy whatever we want! Muwahaha!");
eq('{b} is the sharpening bonus only', src.includes('SAY_VARS.b=P.sharp;'), true);
/* r213 (owner, 2026-10-01): the dialogue review - fixes A1-A8, B10, C11-C19, new lines D20-D24 */
const R213 = {
  D8:   "Look, the sword icon moves on the trait map with each strike. Keep hammering till we reach the '?'.",
  D10:  "Now that we have reached a '?' trait on the map, we can splash water on the metal to lock it in.",
  D14:  'Press and hold the metal, and I will heat it for you to hammer.',
  D15:  'It is hot enough. Now strike the hot metal!',
  D22:  "You don't need to know who I am! Assassins are after me. I lost my sword too!",
  D26:  'Phew! That was a lot of hard work.',
  D58a: "Five swords! Let's use the craft book. It can make them all at once.",
  D67a: 'The map is divided into 5 parts. This picture gives you a hint about where each trait might be.',
  D76:  'Yes! We got it! It is not perfect, but it is okay for now.',
  D82:  'Tap the design desk and pick your favorite designs.',
  D90:  'Oh, one more thing. Remember the experience points you collected on the map? Each level up gave you a skill point.',
  D92a: 'Remember the fire route? The craft book can help.',
  D93a: "Gale? We have never made that. Let's try copper and see where the path goes.",
  D99:  "We got metal with the swift trait. Very cool, but it is not what the customer asked for. Don't worry, you can store it for later.",
  D110: "Hello, how are you and your dragon? I came to thank you for helping me yesterday. I was able to defend myself against all the assassins. You make reliable swords! I'm Bram, by the way.",
  D111a: 'The last one was good, but not very sharp. Can you make this one sharper?',
  D114: 'Exactly what I needed. Thanks. I have a small gift for you. It is not much, but I thought it would be of more use to you.',
  D118: 'I made something for you. To keep you motivated, I put together a small quest list.',
  D128: 'Craft a Balanced sword and show me! Extra gold if it is good, and a reward if it is Epic tier, customized and sharpened!',
  D130: 'Make the best sword you can and show him what we are made of! That will shut him up! Muwahaha!',
  D132: "Huh... it wasn't good enough.",
  D140: "From now on, ring the bell when you are ready for customers. I'll be here if you need me." };
for (const id in R213) eq(id + ' text (r213)', line(id), R213[id]);
eq('no curly quotes left in any line', [...src.matchAll(/\n\s*D\d+[a-z]?: "([^"]*)"/g)].filter(x => /[‘’“”]/.test(x[1])).length, 0);
eq('grindstone reward sub-line (v3: used straight away)', src.includes(`return "It is on the forge bench. Let's use it now.";`), true);
eq('Bram is unnamed on Day 1 (r213)', src.includes("if(w) w.textContent='???'; })();   /* r213"), true);
eq('Bram is named as he says it (r213)', src.includes("typeAfter(()=>{ const w=document.getElementById('custWho'); if(w) w.textContent='BRAM'; });"), true);
eq('D57 before D114 (r213)', src.includes("TUT_STAGE='bram2-bonus'; sayQueue('D57');"), true);
/* r214 (owner, 2026-10-01): selling Garric anything short of grade 3 asks first (Garric only) */
eq('Garric sell confirmation: gate', src.includes("if(TUT_GARRIC_STATE==='asked' && !GARRIC_SELL_OK && garricGrade(COUNTER)!==3){ garricSellAsk(COUNTER); return; }"), true);
eq('Garric sell confirmation: words', [
  '<h3 class="sf-modal-h">Sell this sword?</h3>',
  'Garric gives his best reward only for an <b>Epic, customized and sharpened</b> sword.',
  'Sell it anyway?',
  'onclick="garricSellAnswer(true)">Yes, sell it</button>',
  'onclick="garricSellAnswer(false)">No, keep it</button>' ].every(t => src.includes(t)), true);
eq('Garric sell confirmation: names what is missing', src.includes("This one is '+t+'."), true);
/* r221 (owner, 2026-10-06): during the tutorial, the waiting customer's trait is ringed on the map, if discovered */
eq('TC2 wants balanced', src.includes("CUSTOMER={ portrait:'assets/customer/man1.webp', tid:null, name:null, want:'balanced' };"), true);
eq('Bram (part 5) wants swift', src.includes("CUSTOMER={ portrait:'assets/customer/BramD2.webp', tid:null, name:'Bram', want:'swift' };"), true);
eq('the ring follows the customer, discovered traits only, tutorial only',
  /function custSpotSync\(\)\{[\s\S]{0,500}tutOver\(\)[\s\S]{0,500}\.discovered/.test(src) && src.includes('custSpotSync();   /* r221 */'), true);
eq('its own ring on the map', src.includes('<g id="custSpot"'), true);
/* r222 (owner, 2026-10-06): before the grinder can be used, the path preview shows only its first (solid) part */
eq('dotted grind tail hidden until the grinder is usable',
  src.includes('function ftueGrindHidden(){ return !FTUE_ST.grindUse && !tutOver(); }') && src.includes('if(solidPct<0.998 && !ftueGrindHidden()){'), true);
/* r223 (owner, 2026-10-06): the tutorial arrow starts at the metal the line is about, and moves on once enough of it is in */
eq('part 1: iron until 2 are in, then manganese', src.includes("function tutFirstOreSlot(){ return (segs.filter(g=>g.ore==='iron').length<2 ? tutIronSlot : tutOreSlot('Manganese'))(); }")
  && src.includes("tutArrow(tutFirstOreSlot, '#stSmelt .furnace'") && src.includes('tutDrawArrow();   /* r223 */'), true);
eq('fire sword: an ore arrow for each ore D68 asks for', src.includes("if(TUT_STAGE==='fire-grind'){") && src.includes("tutWheelArrow(want==='iron' ? 'Iron' : 'Manganese')")
  && /const TUT_TICK_STAGES=\[[^\]]*'fire-grind'/.test(src), true);
eq('the pointer revises when an ore lands', src.includes("segs.length, /* r223 */"), true);
eq('the fire ore arrow goes up with D68', src.includes('setTimeout(()=>tutNudge(true), 0);   /* r223: the ore arrow goes up with D68'), true);
/* r224 (owner, 2026-10-06): the first book's "+N" stays on screen, lit above the dim, while the game is paused for D9 */
eq('the first book holds its +xp over the dim', src.includes('tutBookStep(b);') && src.includes('tutXpHold(b);   /* r224 */')
  && src.includes('.xp-hold {') && /function tutPause\(on\)\{[^\n]*\n[\s\S]{0,400}if\(!on\) tutXpHoldOff\(\);/.test(src), true);
/* r225 (owner, 2026-10-06): tier colours that read on the beige windows - purple Epic, blue Fine, dark grey Weak */
eq('tierColor', src.includes("function tierColor(t){ return t==='Epic'?'#8e44d9':(t==='Fine'?'#2b7fd8':'#4d4d4d'); }"), true);
eq('tier legend matches', ['.tier-weak span { color: #4d4d4d; }', '.tier-fine span { color: #2b7fd8; }', '.tier-epic span { color: #8e44d9; }'].every(t => src.includes(t)), true);
/* r227 (owner, 2026-10-06): after D22 the player answers "I can give you a sword." before D23; the counter dragon is 25% smaller */
eq('D22 waits for the reply', src.includes("typeAfter(()=>{ if(choice==='who'){ bramGiveAsk(); return; } bramGiveStep(); });")
  && src.includes("b.textContent='I can give you a sword.';"), true);
eq("Bram's two replies are rebuilt at his intro", src.includes('if(r){ r.innerHTML=BRAM_REPLIES; r.style.display=\'flex\';'), true);
eq('counter dragon 25% smaller (23% -> 17.25%)', src.includes('#screenLayer.sc-customer > #screenDragon { width: 17.25%; }'), true);
/* r228 (owner, 2026-10-06): no DENY button during the FTUE (it is a placeholder with no action) */
eq('DENY starts hidden', src.includes('class="cs-btn cs-deny ftue-off"') && src.includes('.cs-deny.ftue-off { display: none !important; }'), true);
eq('DENY stays hidden until the FTUE is done', src.includes("de.classList.toggle('ftue-off', !FTUE_ST.done);"), true);
/* r229 (owner, 2026-10-06): the turn arrow shows whenever ore is on the grinder and can still be ground, every time, any stage */
eq('turn arrow follows the ore on the wheel', src.includes("function grindSpinWanted(){ return SF_SCREEN==='forge' && !!prep && prep.grind < grindCap()-0.001; }")
  && src.includes("if(!sel && grindSpinWanted()) sel='#grindHot';") && src.includes('tutSpinOn(null);   /* r229: every frame'), true);
/* r230 (owner, 2026-10-06): the fog's edge is a soft gradient, not a hard line - the holes are blurred inside the mask */
eq('fog edge blur (stdDeviation 24 world units)', src.includes('<filter id="fogSoft" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="24"/></filter>')
  && src.includes('<g id="fogHoles" fill="#000" filter="url(#fogSoft)"></g>'), true);
eq('ORE_START reads FTUE', /const ORE_START=\{[^}]*iron:FTUE\.oreStart\.iron, manganese:FTUE\.oreStart\.manganese/.test(src), true);

/* v3 part 1 lines (D8, D17) */
const V3P1 = {
  D28b: "A balanced Longsword? We need its blueprint first. Open the market, I'll buy it for you.",
  D28c: 'Here it is. Watch this!',
  D28d: 'There, my treat! Now make a balanced sword and pick the Longsword shape.',
  D28e: "A Broadsword this time. To the market! I'll pay again.",
  D28f: 'Done! Pick the Broadsword when you shape the blade.',
  D28g: "I helped you a bit. Now you buy your own stuff. I'll buy for you when I feel like it. Humph!",
  D28h: "Oh, you don't have enough. Don't worry, I'll help.",
  D28i: 'Your first blueprint! Now make the Katana.' };
for (const [k, v] of Object.entries(V3P1)) eq(k + ' text', line(k), v);
/* every script block must parse: a text check cannot see a broken quote (v3 part 2 shipped one, caught here) */
[...src.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((m, i) => { let ok = true; try { new Function(m[1]); } catch (e) { ok = e.message; } eq('script block ' + i + ' parses', ok, true); });
const keyList = [...src.matchAll(/\n\s*(D\d+[a-z]?): "/g)].map(x => x[1]);
for (const [k, prev] of [['D28c','D28b'],['D28d','D28c'],['D28e','D28d'],['D28f','D28e'],['D28g','D28f'],['D28h','D28g'],['D28i','D28h']])
  eq(k + ' follows ' + prev, keyList[keyList.indexOf(k) - 1], prev);
eq('Bram: no reward window, straight to the quest list',
  /function ftueAfterBram\(\)\{[\s\S]{0,300}TUT_STAGE='p1-quest'/.test(src) && !/function ftueAfterBram\(\)\{[^}]*ftueReward\(/.test(src), true);
eq('a market order opens the market', src.includes("if(o.market){ FTUE_ST.market=true; marketBtnUi(); FTUE_MK={ o:o, step:'ask' }; }"), true);
eq('the dragon speaks inside the market window (his counter bubble cannot rise above a modal)', src.includes("box.querySelector('p').textContent=DIALOGUE[id]; box.hidden=false;") && src.includes('id="mkSay"'), true);
eq('short of the price: topped up to it', /function ftueMarketTopUp\(\)\{[\s\S]{0,500}GOLD=Math.max\(GOLD, MARKET.price\)/.test(src), true);
/* v3 part 2 (D13, D18-D24, D31) */
const V3P2 = {
  D32:  "We can't get the balanced trait with only 1 iron and 1 manganese, unless-",
  D32a: 'We grind them!',
  D32b: 'Here, I found this grindstone lying around. It should help.',
  D32c: "I put your ores back. Let's try again." };
for (const [k, v] of Object.entries(V3P2)) eq(k + ' text', line(k), v);
for (const [k, prev] of [['D32a','D32'],['D32b','D32a'],['D32c','D32b']]) eq(k + ' follows ' + prev, keyList[keyList.indexOf(k) - 1], prev);
eq('D34 removed ("6 more swords" is not true any more)', line('D34'), null);
eq('TC2 arrives: ore set to exactly FTUE.tc2Ore', /function tutBellRung\(\)\{[\s\S]{0,700}ORE_COUNT\.iron=FTUE\.tc2Ore\.iron; ORE_COUNT\.manganese=FTUE\.tc2Ore\.manganese;/.test(src), true);
eq('the grindstone is no longer on the bench when part 1 ends', src.includes('if(FTUE_ST.part===1 && !more){ FTUE_ST.grind=true;'), false);
eq('raw ores first: both in, the path misses Balanced', /function tutTc2RawCheck\(\)\{[\s\S]{0,600}Math\.hypot\([^)]*\)>ALIGN_MAX/.test(src), true);
eq('then the grindstone in the reward window, and the ores back', /function tutTc2Grindstone\(\)\{[\s\S]{0,600}ftueReward\(\[ ?\{ kind:'unlock', id:'grindstone' \} ?\][\s\S]{0,400}gainOre\(/.test(src), true);
eq('the grindstone may be used once it is given', /function tutTc2Grindstone\(\)\{[\s\S]{0,800}FTUE_ST\.grindUse=true/.test(src), true);
eq('TC3: no design desk, straight to the counter', src.includes('else if(fireSword) tutFireToCounter();'), true);
eq('TC3: no reward window (D31)', /function tutThankYou3\(\)\{[\s\S]{0,700}ftueReward\(\[\], ?\(\)=>\{/.test(src), true);
/* D28a must sit beside D28, never at the end: lastLine() is the map's final key */
const keys = [...src.matchAll(/\n\s*(D\d+[a-z]?): "/g)].map(x => x[1]);
eq('D28a follows D28', keys[keys.indexOf('D28a') - 1], 'D28');
eq('D111a follows D111', keys[keys.indexOf('D111a') - 1], 'D111');
eq('last key is D140 (r213: the closing line is the final line)', keys[keys.length - 1], 'D140');
for (const [k, prev] of [['D28b', 'D28a'], ['D58a', 'D58'], ['D92a', 'D92'], ['D93a', 'D93']]) eq(k + ' follows ' + prev, keys[keys.indexOf(k) - 1], prev);

console.log('[ftue] GREEN / ' + n + ' checks');
