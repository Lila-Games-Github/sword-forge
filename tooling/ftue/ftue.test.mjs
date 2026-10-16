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
/* owner, 2026-10-09: the new quest list - two pages of seven, each quest 20g and 20 xp */
eq('preQuests (page 1 a-b, already complete when the list arrives)', FTUE.preQuests, [
  { id: 'craftOne', label: 'Craft a sword', gold: 20, xp: 20 },
  { id: 'sellOne',  label: 'Sell a sword',  gold: 20, xp: 20 } ]);
eq('the other quests', FTUE.quests, [
  { id: 'buyBlueprint', label: 'Buy a blueprint for the sword shape.', gold: 20, xp: 20 },
  { id: 'updateRecipe', label: 'Update a recipe.',                     gold: 20, xp: 20 },
  { id: 'gatherOres',   label: 'Gather ores from cave',                gold: 20, xp: 20 },
  { id: 'craftFire',    label: 'Craft a fire sword',                   gold: 20, xp: 20 },
  { id: 'sleep',        label: 'Go to bed. Remember to pet the dragon!', gold: 20, xp: 20 },
  { id: 'craftDurable', label: 'Craft a durable sword',                gold: 20, xp: 20 },
  { id: 'buyFire',      label: 'Buy a blueprint for the fire sword.',  gold: 20, xp: 20 },
  { id: 'epicHelp',     label: "Get dragon's help for an epic tier sword.", gold: 20, xp: 20 },
  { id: 'sellWeak',     label: 'Sell a weak sword.',                   gold: 20, xp: 20 },
  { id: 'craftSwift',   label: 'Craft a swift sword',                  gold: 20, xp: 20 },
  { id: 'craftGale',    label: 'Craft a gale sword',                   gold: 20, xp: 20 },
  { id: 'sharpen',      label: 'Sharpen a sword',                      gold: 20, xp: 20 } ]);
eq('the list is the two in order, seven to a page, two pages', src.includes('...FTUE.preQuests.concat(FTUE.quests).map(') && src.includes('const QS_PAGES = 2, QS_PER = 7;'), true);
eq('each quest is counted where it happens', ["bumpQuest('buyBlueprint')", "if(k==='fire') bumpQuest('buyFire')", "bumpQuest('updateRecipe')",
  "bumpQuest('gatherOres')", "bumpQuest('sleep')", "bumpQuest('epicHelp')", "bumpQuest('sellWeak')", "bumpQuest('sharpen')",
  'function questSwordMade(w){'].every(t => src.includes(t)), true);
eq('a made sword counts its traits', src.includes("const QUEST_CRAFT={ fire:'craftFire', durable:'craftDurable', swift:'craftSwift', gale:'craftGale' };"), true);
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
/* v3 part 3 (D25-D32): GC4 Durable (the lesson), GC5-GC6 fire bought by the dragon, GC7 fire Katana bought by the player */
eq('part 3 gpc', FTUE.parts[3].gpc, [
  { trait: 'durable', shape: 'Shortsword', qty: 1, lesson: 'durable' },
  { trait: 'fire', shape: 'Longsword',  qty: 1, market: { by: 'dragon', ask: 'D92h', done: 'D92a' }, guide: 'map' },
  { trait: 'fire', shape: 'Broadsword', qty: 1, market: { by: 'dragon', ask: 'D92i', done: 'D28f' }, guide: 'book' },
  { trait: 'fire', shape: 'Katana',     qty: 1, market: { by: 'player', ask: 'D92j', done: null } } ]);
eq('part 3 after (v3: the bell brings TC4)', FTUE.parts[3].after, 'p4-tc4');
eq('part 3 rewards (D32: none)', FTUE.parts[3].rewards, { tc: [], gpc1: [], gpc2: [], gpc3: [], gpc4: [] });
/* owner, 2026-10-09: the Day 2 cave holds all of Day 2's ore (parts 3-6) plus 5 of each: nickel 2 (GC4) + 2 (TC4);
   iron and manganese 6 (GC5-GC7) + 1 (GC8) + 1 (Garric); copper 7 (TC5) + 5 (GC9) */
/* owner, 2026-10-10: "not enough ore for Garric" - the Day 2 cave holds his Epic Balanced (2 + 2) + 5 more of
   each on top; the dragon does not refill the bag */
eq('day2Cave (all of Day 2, +5 each, + Garric 7 each)', FTUE.day2Cave, { nickel: 9, iron: 20, manganese: 20, copper: 17 });
/* owner, 2026-10-10: Day 3's cave holds the same, + 15 aluminium (it was normal play) */
eq('day3Cave', FTUE.day3Cave, { nickel: 9, iron: 20, manganese: 20, copper: 17, aluminium: 15 });
eq('the second night stocks it', src.includes("if(TUT_STAGE==='bed') ftueStockCave(FTUE_ST.part===6 ? FTUE.day3Cave : FTUE.day2Cave);"), true);
eq('the PART 4-6 jumps carry those 7 + 7', src.includes('ORE_COUNT.nickel=7; ORE_COUNT.iron=14; ORE_COUNT.manganese=14;')
  && src.includes('ORE_COUNT.iron=7; ORE_COUNT.manganese=7; ORE_COUNT.copper=5;'), true);
eq('no refill at Garric\'s order', !src.includes('ftueGarricOre') && FTUE.garricOre === undefined, true);
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
/* part 4 (r204): superseded by the v3 part 4 checks below */
eq('swiftLine', FTUE.swiftLine, 'D99a');
eq('gale has its own part set', /const DD_SKIN_OF = {[^}]*gale:'gale'/.test(src), true);
/* part 5 (r205): gpc and rewards superseded by the v3 part 5 checks below */
eq('part 5 after', FTUE.parts[5].after, 'g-bell');
eq('bramLine', FTUE.bramLine, 'D111a');
/* part 6 (r206): Garric has three endings, and every one of them ends the FTUE */
eq('endLines', FTUE.endLines, ['D140']);   /* r213: the shared closing line after every ending */
/* r212 (owner, 2026-10-01): Garric's old rewards (r131/r132) come back through the reward window */
/* v3 D11: and the shop banner in all three outcomes */
eq('garricRewards', FTUE.garricRewards, {
  1: [ { kind: 'decor', id: 'banner' } ],
  2: [ { kind: 'gold', n: 10 }, { kind: 'decor', id: 'banner' } ],
  3: [ { kind: 'gold', n: 10 }, { kind: 'unlock', id: 'garricParts' }, { kind: 'decor', id: 'banner' } ] });
eq('Garric leaves through the reward window', src.includes('ftueReward(FTUE.garricRewards[g]'), true);
eq('the sale no longer pays the tip itself', /function tutGarricSold\(\)\{[\s\S]{0,500}GOLD \+= GARRIC_TIP/.test(src), false);
/* v3 D44: the ending moved - after his answer the banner lesson, the night, Day 3 and the skill tree; D140 closes */
eq('garricLeaves: his answer, without the close', src.includes("sayQueue(g===1?'D132':g===2?'D135':'D138', g===1?'D133':g===2?'D136':'D139'));"), true);
eq('the close comes after the Day 3 skill tree', /function tutDay2SkillClosed\(\)\{[\s\S]{0,600}FTUE_ST\.part===6[\s\S]{0,200}sayQueue\('D140'\)/.test(src), true);
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
eq('Bram (part 5) wants swift (v3: a Dagger)', src.includes("CUSTOMER={ portrait:'assets/customer/BramD2.webp', tid:null, name:'Bram', want:'swift', shape:'Dagger' };"), true);
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
eq('short of the price: topped up to it (the order\'s own price)', /function ftueMarketTopUp\(\)\{[\s\S]{0,500}GOLD=Math\.max\(GOLD, marketPrice\(m\.o\.trait, m\.o\.shape\)\)/.test(src), true);
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
/* v3 part 3 lines (D27, D28, D52) */
const V3P3 = {
  D92b: 'The Durable trait is one of the basic traits. It should be in the visible part of the map.',
  D92c: 'The traits you discover in the hidden part of the map are elemental.',
  D92d: 'And I also remember we need nickel for the Durable trait.',
  D92e: "Let's see if we can find some in the cave.",
  D92f: 'We got some nickel! We can craft a Durable sword now.',
  D92g: 'If you explore further in the same direction, you will find elemental traits associated with light.',
  D92h: "A fire Longsword! I'll buy this blueprint for you too.",
  D92i: 'And a fire Broadsword. My treat, one more time!',
  D92j: 'Remember how to buy the blueprint? Go to the market and buy a fire katana blueprint!' };
for (const [k, v] of Object.entries(V3P3)) eq(k + ' text', line(k), v);
for (const [k, prev] of [['D92b','D92a'],['D92c','D92b'],['D92d','D92c'],['D92e','D92d'],['D92f','D92e'],['D92g','D92f'],['D92h','D92g'],['D92i','D92h'],['D92j','D92i']])
  eq(k + ' follows ' + prev, keyList[keyList.indexOf(k) - 1], prev);
eq('Durable moved (D25, measured: Fine to the end, Epic only with the pull)', /durable:\{x:1136,y:421\.667\}/.test(src), true);
eq('Day 2 morning: no skill tree (it moved to part 6)', src.includes("sayQueue('D89','D92');"), true);
eq('the Durable lesson: map window after D92c', src.includes('D92c:function(){ ftueDurableMap(); }')
  && /function ftueDurableMap\(\)\{[^}]*openIllus\('assets\/ui\/MAP_parts2\.webp'/.test(src), true);   /* r254: its own art */
eq('the Durable craft takes ground nickel only', src.includes("if(TUT_STAGE==='p3-dur-grind') return nickelIn()<2 ? 'nickel' : false;"), true);
eq('the Durable and Weak walks reach their screen handler', src.includes("String(TUT_STAGE).indexOf('p3-dur-')===0 || String(TUT_STAGE).indexOf('p4-weak-')===0){ tutDay2Screen(name); return; }"), true);
eq('a market step without a done line says nothing', src.includes('if(o.market.done) sayOver(o.market.done);'), true);
/* v3 part 4 (D33-D38): TC4 Epic Durable with the pull lesson, TC5 gale, GC8 Weak balanced Longsword */
/* owner, 2026-10-09: after GC8, the customer who is sent to the waiting list (two swords, two blueprints) */
eq('part 4 gpc', FTUE.parts[4].gpc, [ { trait: 'balanced', shape: 'Longsword', tier: 'Weak', qty: 1, lesson: 'weak' },
  { trait: 'gale', shape: 'Katana', qty: 1, items: [ { trait: 'gale', shape: 'Katana' }, { trait: 'fire', shape: 'Claymore' } ], lesson: 'later' } ]);
eq('part 4 after (Bram)', FTUE.parts[4].after, 'd2-praise');
eq('part 4 rewards (D35: none)', FTUE.parts[4].rewards, { tc: [], gpc1: [], gpc2: [] });
eq('no second trip at TC4 (the Day 2 cave has it all)', FTUE.p4Cave, undefined);
eq('TC4 goes to the forge, not the cave', /function tutTc4Arrive\(\)\{[\s\S]{0,800}TUT_STAGE='p3-dur-back'; sayQueue\('D92l'\)/.test(src) && !/function tutTc4Arrive\(\)\{[^}]*ftueStockCave/.test(src), true);
eq('no cave refill at Garric\'s order', /function tutGarricOrder\(\)\{[\s\S]{0,300}rollCaveNodes\(\)/.test(src), false);
eq('GC8 stops in the middle of the Weak band (20-34)', FTUE.weakStop, 27);
const V3P4 = {
  D92k: 'I want a durable sword. Make sure it is EPIC! I only want the best.',
  D92l: 'Okay, time to learn how to craft the best tier sword!',
  D97a: 'Remember? Drag me to the anvil and hold to pull the sword onto the trait.',
  D107a: "My master requests a balanced sword. He is going on a dangerous hunt. But I don't want him to come back. He tortures me every day. Can you give me a weak sword?",
  D107b: 'Stop now! This alignment will give us a weak trait tier.' };
for (const [k, v] of Object.entries(V3P4)) eq(k + ' text', line(k), v);
for (const [k, prev] of [['D92k','D92j'],['D92l','D92k'],['D97a','D97'],['D107a','D107'],['D107b','D107a']]) eq(k + ' follows ' + prev, keyList[keyList.indexOf(k) - 1], prev);
eq('the bell brings TC4', src.includes("else if(TUT_STAGE==='p4-tc4') tutTc4Arrive();"), true);
eq('TC4 pull parks on Durable', src.includes("if(TUT_STAGE==='p4-pull') return 'durable';"), true);
eq('TC5 swift step: the reminder, not the lesson', /function tutDay2Pull\(\)\{[\s\S]{0,300}sayQueue\('D97a'\)/.test(src), true);
eq('GC8: the sword parks in the Weak band', /function tutWeakStop\(\)\{[\s\S]{0,900}FTUE\.weakStop/.test(src), true);
eq('the sale checks the tier', src.includes("if(ftueC && !orderMatches(ftueC, COUNTER)){ toast('They asked for a <b>'+(ftueC.tier ? ftueC.tier+' ' : '')+orderLabel(ftueC.name, ftueC.shape)+'</b>'); return; }"), true);
eq('TC4 sold: the bell brings TC5', /function ftueTc4Sold\(\)\{[\s\S]{0,300}TUT_STAGE='d2-bell'/.test(src), true);
/* v3 part 5 (D39-D43): Bram's swift Dagger (the dragon buys it), the sharpening wheel, the diary; GC9 gale Longsword */
eq('part 5 gpc', FTUE.parts[5].gpc, [ { trait: 'gale', shape: 'Longsword', qty: 1, market: { by: 'dragon', ask: 'D113a', done: null } } ]);
eq('part 5 rewards (D42: the diary is Bram\'s own window; GC9 none)', FTUE.parts[5].rewards, { tc: [], gpc1: [] });
eq('Bram\'s Dagger blueprint (D39)', FTUE.bramBlueprint, { trait: 'swift', shape: 'Dagger', market: { by: 'dragon', ask: 'D111b', done: null } });
const V3P5 = {
  D48:  "I found this sharpening wheel. I'll show you how to use it.",
  D111: 'I have another request. My next mission requires me to cross enemy territory quickly. Can you make a swift dagger for me?',
  D111b: "A dagger? We don't have that blueprint. I'll get it, since he is an old friend.",
  D113a: "A gale Longsword? Fine, I'll buy this one too. Don't get used to it!" };
for (const [k, v] of Object.entries(V3P5)) eq(k + ' text', line(k), v);
for (const [k, prev] of [['D111b','D111a'],['D113a','D113']]) eq(k + ' follows ' + prev, keyList[keyList.indexOf(k) - 1], prev);
eq('the sharpening wheel is locked until given (D40)', src.includes("if(!FTUE_ST.sharp && !FTUE_ST.done){ toast('The sharpening wheel is locked'); return; }"), true);
eq('its reward applies the unlock', src.includes("else if(r.kind==='unlock' && r.id==='sharpen'){ FTUE_ST.sharp=true;"), true);
eq('after the Dagger, the wheel window, then the forge', /D48:function\(\)\{[^}]*ftueReward\(\[ ?\{ kind:'unlock', id:'sharpen' \} ?\]/.test(src), true);
eq('a closed market lesson can hand on (then)', src.includes('const f=m.then; FTUE_MK=null;'), true);
eq('Bram is sold a Dagger only', src.includes("if(TUT_STAGE==='bram2-sell2' && COUNTER && COUNTER.shape!=='Dagger'){"), true);
eq('the basement step no longer says D48 in part 5', /function tutBasementStep\(\)\{[\s\S]{0,200}if\(FTUE_ST\.part!==5\)/.test(src), true);
/* v3 part 6 (D44-D49) */
const V3P6 = {
  D79:  'Now let\'s make it look special. Do you want to customize it?',
  D87a: "What a day! Even that grumpy old man couldn't ruin it. Let's get some sleep.",
  D88a: 'Goodnight. Tomorrow - we craft - the best swords - in town - and meat. Lots of meat.',
  D89a: 'Good morning! You have grown so much in just two days. I think you are ready for this.',
  D130b: 'He wants a custom designed sword. Let me get a design desk for you.' };
for (const [k, v] of Object.entries(V3P6)) eq(k + ' text', line(k), v);
for (const [k, prev] of [['D87a','D87'],['D88a','D88'],['D89a','D89'],['D130b','D130a']]) eq(k + ' follows ' + prev, keyList[keyList.indexOf(k) - 1], prev);
/* r259 (owner, 2026-10-16): the mug quench - steam rises, a mist covers the screen and fades, then the trait window */
{ const m = src.match(/const QUENCH_FX=(\{[^}]*\});/); eq('QUENCH_FX is the recorded timing', m && new Function('return ' + m[1])(), { puffs: 4, steamLead: 250, fogIn: 350, hold: 350, fogOut: 600 }); }
eq('the trait is gained at once; the hooks, the window and the toast wait for the effect', /melt\.traits\.push[\s\S]{0,1500}quenchFx\(\(\)=>\{ updateSfTraits\(\); tutAcquired\(\);[\s\S]{0,900}showAcquire\(bt,tier,melt\.traits\.length,firstFind\);/.test(src), true);
/* r266 (owner, 2026-10-16): the owner's new map_base.png is what the game shows - its WebP regenerated (2048 wide, q 0.82)
   and the manifest entry describes the PNG on disk */
{ const png = readFileSync('assets/map/map_base.png'), webp = readFileSync('assets/map/map_base.webp');
  const man = JSON.parse(readFileSync('tooling/asset-diet/manifest.json', 'utf8')).find(e => e.src === 'assets/map/map_base.png');
  const i = webp.indexOf('VP8'), kind = webp.toString('ascii', i, i + 4);
  const ww = kind === 'VP8X' ? 1 + webp.readUIntLE(i + 12, 3) : kind === 'VP8L' ? (webp.readUInt32LE(i + 9) & 0x3fff) + 1 : webp.readUInt16LE(i + 14) & 0x3fff;
  eq('map_base: the manifest matches the PNG on disk', !!man && man.bytes === png.length && man.nat[0] === png.readUInt32BE(16) && man.nat[1] === png.readUInt32BE(20) && man.w === 2048 && man.q === 0.82, true);
  eq('map_base.webp is the 2048-wide copy', ww, 2048); }
/* r265 (owner, 2026-10-16): the white arrow images are deleted, and the asset tooling no longer lists them */
eq('the arrow images are gone', ['assets/ui/arrow.png', 'assets/ui/arrow.webp', 'assets/ui/arrow_point_down.png', 'assets/ui/arrow_point_down.webp'].every(f => !existsSync(f))
  && !/assets\/ui\/arrow(_point_down)?\.png/.test(readFileSync('tooling/asset-diet/manifest.json', 'utf8') + readFileSync('tooling/asset-diet/display.json', 'utf8')), true);
/* r264 (owner, 2026-10-16): the metal's glow is the strong one, like the dragon's */
eq('#orb glows strongly: a white ring and a gold halo (a gold drop-shadow alone vanished on the gold parchment)', src.includes('#orb.tut-glow { border-radius: 50%; animation: tutGlowOrb 1.15s ease-in-out infinite; }') && src.includes('@keyframes tutGlowOrb {'), true);
/* r263 (owner, 2026-10-16): no white arrows - the idle nudges use the guide's own pointers: the dashed arrow for the drag
   (metal to the furnace), the metal's glow for the tap (pick a shape) */
eq('the white arrow art is gone', !src.includes('id="hintArrow"') && !src.includes('id="hintDown"') && !src.includes('arrow.webp') && !src.includes('arrow_point_down') && !src.includes('#hintArrow') && !src.includes('#hintDown'), true);
eq('the drag nudge is the guide arrow, owned and cleared by the nudge only', src.includes("TUT_ARROW={ from:'#orb', to:'#stSmelt .furnace', opt:{ tfx:0.51, tfy:0.25, bow:0.18, back:24 } }; HINT_ARROW_REF=TUT_ARROW; tutDrawArrow();")
  && src.includes('if(TUT_ARROW && TUT_ARROW!==HINT_ARROW_REF) return false;') && src.includes('else if(!want && TUT_ARROW && TUT_ARROW===HINT_ARROW_REF){ TUT_ARROW=null; HINT_ARROW_REF=null; tutDrawArrow(); }'), true);
eq('the tap nudge is the metal\'s glow', src.includes("if(wantD && !HINT_GLOW){ tutGlow('#orb', true); HINT_GLOW=true; } else if(!wantD && HINT_GLOW){ tutGlow('#orb', false); HINT_GLOW=false; }"), true);
/* r262 (owner, 2026-10-16): the hammer minigame's mug plays the same steam and mist, then finishes the blade */
eq('quenchFx takes a spot (host layer, position, above)', src.includes('function quenchFx(done, spot){')
  && src.includes("fog.classList.toggle('above', !!s.above);") && src.includes("#quenchFog.above { z-index: 1065; }"), true);
eq('the minigame quench: its own steam, then quenchFx in its scene, then finishBlade', src.includes("hmHeat=0; hmRender(); hmQuenchFx(); hmSay();\n    quenchFx(()=>{ hmQuenching=false;\n        if(document.getElementById('sfHammerModal').classList.contains('show')) finishBlade(); }, { host:document.getElementById('hmFx'), x:HM_RIG.anvil.x, y:HM_RIG.anvil.y-2, unit:'%', step:2.2, above:true });")
  || src.includes("hmHeat=0; hmRender(); hmQuenchFx(); hmSay();\r\n    quenchFx(()=>{ hmQuenching=false;\r\n        if(document.getElementById('sfHammerModal').classList.contains('show')) finishBlade(); }, { host:document.getElementById('hmFx'), x:HM_RIG.anvil.x, y:HM_RIG.anvil.y-2, unit:'%', step:2.2, above:true });"), true);
/* r261 (owner, 2026-10-16): quenched metal is cool - grey, not orange. On the anvil it is hot only while it has heat */
eq('hot in the furnace, or on the anvil with heat', src.includes("else if(melt&&(melt.stage==='hot'||(melt.stage==='onAnvil' && melt.heat>0))){ orbEl.classList.add('hot');")
  && src.includes("else if(melt&&melt.stage==='onAnvil'){ orbEl.classList.remove('hot'); oreImgEl.style.opacity=0; sphereEl.style.opacity=1; }"), true);
eq('the frame loop flips it when the anvil metal cools to 0 (or is heated)', src.includes("if(melt && melt.stage==='onAnvil' && orbEl.classList.contains('hot')!==(melt.heat>0)) updateOrbLook();   /* r261 */"), true);
/* r260 (owner, 2026-10-16): the mist is a soft plain white - no smoke art in it */
eq('the mist is a soft plain white gradient', src.includes('#quenchFog { position: absolute; inset: 0; z-index: 58; display: none; pointer-events: none; opacity: 0; transition: opacity .6s ease-out;\n    background: radial-gradient(ellipse at 50% 50%, rgba(255,255,255,.97) 0%, rgba(250,250,248,.9) 45%, rgba(242,242,240,.72) 100%); }')
  || src.includes('#quenchFog { position: absolute; inset: 0; z-index: 58; display: none; pointer-events: none; opacity: 0; transition: opacity .6s ease-out;\r\n    background: radial-gradient(ellipse at 50% 50%, rgba(255,255,255,.97) 0%, rgba(250,250,248,.9) 45%, rgba(242,242,240,.72) 100%); }'), true);
eq('the mist layer covers the frame and catches taps while it plays', src.includes('<div id="quenchFog"></div>') && src.includes('#quenchFog.catch { display: block; pointer-events: auto; }'), true);
eq('timers, not animation events, end it (a hidden pane freezes animations)', src.includes('setTimeout(()=>{ if(fog) fog.classList.remove(\'catch\'); if(done) done(); }, F.steamLead+F.fogIn+F.hold+F.fogOut);'), true);
/* r258 (owner, 2026-10-16): the map books and the EXP lesson (D9) move from the first sword (Bram's) to the second (GC1) */
eq('the first craft places no books', (b => !!b && !b[0].includes('tutPlaceBooks()'))(src.replace(/\r\n/g, '\n').match(/function tutBellowsStep\(\)\{[\s\S]*?\n\}/)), true);
eq('GC1: the books go on its route once its ores are in', src.includes("if(n('iron')>=FTUE.gpcCraft.iron && n('manganese')>=FTUE.gpcCraft.manganese){ TUT_STAGE='p1-craft-heat'; tutPlaceBooks(); }"), true);
eq('D9 fires on a tutorial book during the GC craft stages', src.includes("const BOOK_LESSON_STAGES=['p1-craft-ore','p1-craft-heat','p1-craft-shape','p1-craft-hammer'];")
  && src.includes('if(b.tut && BOOK_LESSON_STAGES.indexOf(TUT_STAGE)>=0) tutBookStep(b);') && !src.includes('FIRST_CRAFT_STAGES'), true);
/* r255 (owner, 2026-10-16): after the quest list, the dragon teaches "tap me for help": D119a (close it), then tap the
   glowing dragon, D119b, then the bell (D27, D28) as before */
eq('D119a and D119b, the owner\'s words, beside D119', src.includes(`D119a: "If you are not sure what to do, at any point, you can tap on me. I'll help you.",`)
  && src.includes('D119b: "Good. Now let\'s continue.",') && (k => k[k.indexOf('D119a') - 1] === 'D119' && k[k.indexOf('D119b') - 1] === 'D119a')([...src.matchAll(/\n\s*(D\d+[a-z]?): "/g)].map(x => x[1])), true);
eq('closing the quests: D119, D119a (the bell waits)', src.includes("if(TUT_STAGE==='p1-quest2'){ tutExit(null); TUT_STAGE='p1-dragon'; sayQueue('D119','D119a'); } }"), true);
eq('D119a: a lit close, and closing it lights both dragons', /const SAY_GO_GLOW=\{[\s\S]*?D119a:1[\s\S]*?\};/.test(src)
  && src.includes("D119a:function(){ if(TUT_STAGE==='p1-dragon'){ TUT_STAGE='p1-dragon-tap'; tutGlow('#screenDragon .crop', true); tutGlow('#dragon .crop', true); } },"), true);
eq('the dragon\'s glow is the strong one (the plain tutGlow was faint on the counter wood)', src.includes('.crop.dragoncrop.tut-glow { animation: tutGlowBig 1.15s ease-in-out infinite; }') && src.includes('@keyframes tutGlowBig {'), true);
eq('the tap: unglow, D119b, then D27/D28 (D27 starts the bell)', src.includes("function dragonTap(e, layer){ if(TUT_STAGE==='p1-dragon-tap'){ tutUnglow(); TUT_STAGE='p1-bell0'; sayQueue('D119b','D27','D28'); return true; }"), true);
/* r254 (owner, 2026-10-16): the second map window (GC4, basic vs elemental) shows MAP_parts2; the first (D67a, five parts) keeps MAP_parts */
eq('second map window art', src.includes("openIllus('assets/ui/MAP_parts2.webp', 'The map: basic traits in the visible part, elemental ones in the hidden part'")
  && src.includes("openIllus('assets/ui/MAP_parts.webp', 'The map, divided into five parts'") && existsSync('assets/ui/MAP_parts2.webp'), true);
/* r253 (owner, 2026-10-16): the come-later customer - MARKET first, see both blueprints and their prices, CLOSE, then D107d
   and COME LATER */
eq('the request lights MARKET (D107d waits)', src.includes("if(o.lesson==='later'){ FTUE_ST.laterOn=true; counterBoxes(); FTUE_LATER='mk';   /* r253: the market first */\n        typeAfter(()=>tutExit('#marketBtn')); }")
  || src.includes("if(o.lesson==='later'){ FTUE_ST.laterOn=true; counterBoxes(); FTUE_LATER='mk';   /* r253: the market first */\r\n        typeAfter(()=>tutExit('#marketBtn')); }"), true);
eq('in the market: both blueprints shown and lit, then Close', src.includes("if(FTUE_LATER==='mk'){ FTUE_LATER='close'; tutExit(null); ftueLaterCells(true); setTimeout(()=>tutExit('#sfMarketModal .mk-foot .paperBtn'), 0); return; }")
  && src.includes("const FTUE_LATER_KEYS=['gale:Katana','fire:Claymore'];"), true);
eq('closing it: D107d and COME LATER', src.includes("if(FTUE_LATER==='close'){ FTUE_LATER=null; ftueLaterCells(false); tutExit(null); sayQueue('D107d'); setTimeout(()=>tutExit('#csPanel .cs-later'), 0); }"), true);
eq('COME LATER first ends the guide', src.includes("const lesson = (c.lesson==='later' && !c.waiting); FTUE_LATER=null; ftueLaterCells(false);"), true);
/* r252 (owner, 2026-10-15): gameplay customers thank you after a sale - a random line by the sword's best tier */
{ const m = src.match(/const CUST_THANKS=(\{[\s\S]*?\});/);
  eq('CUST_THANKS is the recorded set (5 a tier)', m && new Function('return ' + m[1])(), {
    Epic: [ 'Thank you so much, this is the best sword I have ever seen. You are too good!',
            'Incredible work! I will tell everyone in town about your shop.',
            'This blade is a masterpiece. Worth every coin, and more!',
            "I can't believe how good this is. Thank you, thank you!",
            'Look at that edge! You have made my whole year.' ],
    Fine: [ 'Wow! Looks good. Good job.', 'Good enough.', 'Not too bad, usable. Thanks.',
            'Nice work. This will serve me well.', 'Fair price, fair sword. Thanks.' ],
    Weak: [ 'Are you sure this sword is strong enough? I hope it is.', 'Looks...okay...I guess?',
            'I have seen better. Humph, what was I even expecting?', 'Hmm. I hope this holds together long enough.',
            'Well, it is a sword. Mostly.' ] }); }
eq('a Weak sword the customer asked for gets a Fine line; any other tier its own', src.includes("function custThanksLine(tier, asked){ const k = (tier==='Weak' && asked==='Weak') ? 'Fine' : (CUST_THANKS[tier] ? tier : 'Fine'); const a=CUST_THANKS[k]; return a[Math.floor(Math.random()*a.length)]; }"), true);
eq('only gameplay customers (no scripted one, no TC4, not mid-order, not refused)', src.includes("const byeC = (!scriptedBye && !bram && CUSTOMER && !(ftueC && ftueC.tc4) && !refused) ? CUSTOMER : null;")
  && /if\(byeC && !CUSTOMER\) custBye\(byeC\.portrait, custThanksLine\(tier, byeC\.tier\)\);[^\n]*\r?\n    gainExp\(XP_SELL,'sell'\);/.test(src), true);
eq('the leaving customer is drawn, never counted as present', src.includes("else if(name==='customer' && CUST_BYE) list.unshift({ src:CUST_BYE.portrait, l:7.97, w:20.99, b:86.16 });   /* r252 */")
  && src.includes("const here=!!CUSTOMER, bye=!here && !!CUST_BYE;") && src.includes("if(dlg) dlg.style.display = ((here || bye) && !introOn) ? '' : 'none';"), true);
eq('the goodbye ends after CUST_BYE_MS or when the next customer comes', src.includes('const CUST_BYE_MS=3200;')
  && /if\(CUSTOMER\) \{ toast\('Someone is already at the counter'\); return false; \}\r?\n    custByeEnd\(\);/.test(src), true);
/* r251 (owner, 2026-10-15): a very long route (5+ fully ground irons of drawn length) runs the sword twice as fast;
   the hazard damage is scaled with it, so a zone costs the same per distance */
{ const m = src.match(/const ROUTE_FAST=(\{[^}]*\});/); eq('ROUTE_FAST is the recorded threshold and multiplier', m && new Function('return ' + m[1])(), { irons: 5, mul: 2 }); }
eq('the route length is what is drawn (len x ground fraction), the yardstick a fully ground iron',
  src.includes('function routeLen(){ return segs.reduce((n,s)=>n+(s.len||0)*(s.tPct==null?1:s.tPct), 0); }')
  && src.includes("function ironLen(){ if(!IRON_LEN){ measure.setAttribute('d', ORE_BY.iron.d); IRON_LEN=measure.getTotalLength(); } return IRON_LEN; }")
  && src.includes('function routeSpeedMul(){ return routeLen() >= ROUTE_FAST.irons*ironLen() ? ROUTE_FAST.mul : 1; }'), true);
eq('advanceSword uses it, and so does the hazard damage', src.includes('const mul=routeSpeedMul(); let step=SWORD_SPEED*mul*Math.max(CRAWL_MIN, melt.heat/100)*dt')
  && src.includes('checkHazard(p,dt*mul);'), true);
/* r249 (owner, 2026-10-15): no sword is left lying in the basement - leaving it (or loading a save made elsewhere) puts the
   table sword back in the bag; the take-it-back tutorial steps move on to their way-back stage */
eq('leaving the basement returns the table sword', src.includes("if(SF_SCREEN==='basement' && name!=='basement' && WORK) workAutoReturn();   /* r249 */"), true);
/* r250 (owner, 2026-10-15): no message when the sword goes back - it is simply in the bag */
eq('workAutoReturn: bag, no toast, and the take steps move on quietly', /function workAutoReturn\(\)\{ INV\.swords\.push\(WORK\); WORK=null; refreshWork\(\); invTab\(2\);\r?\n/.test(src) && !src.includes('The sword went back to your inventory')
  && src.includes("if(TUT_STAGE==='dec-take' || TUT_STAGE==='base-take'){ TUT_STAGE = TUT_STAGE==='dec-take' ? 'dec-back' : 'base-back'; tutArrow(null,null); if(SAY_ON==='D54') sayHide(); } }"), true);
eq('a save made off the basement loads with the sword in the bag', src.includes("WORK=o.work||null; if(WORK && o.screen && o.screen!=='basement'){ INV.swords.push(WORK); WORK=null; }   /* r249 */"), true);
/* r248 (owner, 2026-10-15): the customer's trait glows on the map only until a sword with that trait is crafted
   (bag or counter), whatever its shape or tier - not until the order itself is met */
eq('custSpot stops once the trait is crafted', src.includes("const tid0 = (!tutOver() && CUSTOMER) ? (CUSTOMER.tid || CUSTOMER.want || null) : null, tid = (tid0 && !custTraitMade(tid0)) ? tid0 : null;")
  && src.includes("function custTraitMade(tid){ return INV.swords.concat(COUNTER ? [COUNTER] : []).some(w=>(w.traits||[]).some(a=>(a.tid || (a.t && a.t.id))===tid)); }"), true);
/* r247 (owner, 2026-10-15): no "Let me try to do it on my own." answer - closing D130 (a lit OK) goes on to D130b */
eq('D130 has no answer button any more', !src.includes('Let me try to do it on my own.') && !src.includes("fn:tutGarricDesk }]"), true);
eq('closing D130 goes on (lit OK, not a closing X)', src.includes("D130:function(){ if(TUT_STAGE==='g-talk') tutGarricDesk(); },") && /const SAY_GO_MORE=\{[^}]*D130:1/.test(src) && /const SAY_GO_GLOW=\{[\s\S]*?D130:1[\s\S]*?\};/.test(src), true);
eq('after D130, D130b and the design desk window',/D130b:function\(\)\{[^}]*ftueReward\(\[ ?\{ kind:'unlock', id:'designDesk' \} ?\], ?tutGarricHandsOff\)/.test(src), true);
eq('Garric\'s crafted sword: the design desk lesson (D46)', src.includes('else if(garricSword){ TUT_FIRE_RUN=true; tutFireCustomise(); }'), true);
eq('its screen steps pass the run gate, and it ends at the counter',
  src.includes('TUT_STAGE=null; TUT_FIRE_RUN=false; tutArrow(null,null); tutExit(null); sayHide(); return; }   /* v3: Garric, still solo */'), true);
eq('the banner lesson after his answer (D15)', /function ftueGarricBanner\(\)\{[\s\S]{0,200}TUT_STAGE='p1-decor-tab'; ftueDecorStep\(\);/.test(src), true);
eq('then the night (D87a), not the quest list', src.includes("if(FTUE_ST.part===6){ TUT_STAGE='to-bed'; tutArrow(null,null); tutExit(null); tutNeedTab(null); setTimeout(()=>{ sayQueue('D87a'); tutExit('#panRight'); }, 0); return; }"), true);
/* D48 (Day 3 normal play) superseded by the owner, 2026-10-10: see day3Cave */
/* owner, 2026-10-10: Day 3 goes to the cave first; the pickaxe is the reason to open the tree */
eq('D89b text', line('D89b'), "Let's gather more ores for the day.");
eq('D89c text', line('D89c'), 'Ahh! So many ores to collect. This is going to take way too long!');
eq('D89d text', line('D89d'), "Why don't you upgrade your pickaxe skill from the skill tree?");
eq('Day 3 morning: D89a, D89b, then the way to the cave', src.includes("if(FTUE_ST.part===6){ TUT_STAGE='d2-d3cave'; TUT_D2_SPENT=false; tutExit(null); sayQueue('D89a','D89b'); setTimeout(()=>tutExitTo('cave'), 0); return; }"), true);
eq('in the cave: D89c, D89d', src.includes("if(TUT_STAGE==='d2-d3cave'){ if(name!=='cave'){ tutExitTo('cave'); return; } TUT_STAGE='d2-morning'; tutExit(null); sayQueue('D89c','D89d'); return; }"), true);
eq('D89d lights the skill button', src.includes("if(id==='D89d') setTimeout(tutDay2Skill, 0);"), true);
eq('the tree lights the pickaxe node', src.includes("if(sk.id==='pick' && TUT_STAGE==='d2-skill' && FTUE_ST.part===6 && r<1) d.classList.add('tut-lit-ctl');")
  && /function tutDay2SkillOpen\(\)\{ if\(TUT_STAGE==='d2-morning'\)\{ TUT_STAGE='d2-skill'; tutExit\(null\); buildSkillNodes\(\); \} \}/.test(src), true);
eq('the lit node keeps a steady ring', src.includes('#sfSkillModal .st-node.tut-lit-ctl {'), true);
eq('only a pickaxe point counts on Day 3', src.includes("function tutDay2Spent(id){ if(TUT_STAGE==='d2-skill' && (FTUE_ST.part!==6 || id==='pick')) TUT_D2_SPENT=true; }")
  && src.includes('tutDay2Spent(id);'), true);
eq('closing without it asks for the pickaxe', src.includes("if(!TUT_D2_SPENT && TALENT>0){ tutDay2Skill(); if(FTUE_ST.part===6) toast('Put a point on the <b>Pickaxe Upgrade</b>'); return; }"), true);
for (const [k, prev] of [['D89b', 'D89a'], ['D89c', 'D89b'], ['D89d', 'D89c']]) eq(k + ' follows ' + prev, (() => { const ks = [...src.matchAll(/\n\s*(D\d+[a-z]?): "/g)].map(x => x[1]); return ks[ks.indexOf(k) - 1]; })(), prev);
/* v3 (owner, 2026-10-08): GC1-GC3 are guided through the whole craft, by pointers - market closed, forge, ores, heat,
   anvil, hammer, mug, the ordered shape, the hammer minigame, the counter */
eq('closing the market starts the craft guide in part 1', src.includes("if(FTUE_ST.part===1 && m.o && !m.then) ftueGcCraftGo();"), true);
eq('the craft guide stages tick', /const TUT_TICK_STAGES=\[[^\]]*'p1-craft-ore','p1-craft-heat'/.test(src), true);
eq('ores: 2 iron, then 2 manganese, raw, to the smelter', /if\(TUT_STAGE==='p1-craft-ore'\)\{[\s\S]{0,300}tutFirstOreSlot/.test(src), true);
eq('at the route end: the mug', /if\(TUT_STAGE==='p1-craft-heat'\)\{[\s\S]{0,900}swordAtRouteEnd\(\)\) tutMugPointer\(\)/.test(src), true);
eq('after the quench: the metal glows', src.includes("if(TUT_STAGE==='p1-craft-heat') ftueGcQuenched();"), true);
/* owner, 2026-10-08: in the whole game, the shape the customer asked for is highlighted in the shape window */
eq('the requested shape is highlighted, any customer', /function shapeGrid\(\)\{[\s\S]{0,1600}const req=custShapeFor\(k\)===sh;[\s\S]{0,200}if\(req\) b\.classList\.add\('sf-req'\)/.test(src), true);
eq('custShapeFor: the waiting customer\'s shape, for their trait', src.includes("function custShapeFor(k){ return (CUSTOMER && CUSTOMER.shape && (CUSTOMER.tid||CUSTOMER.want)===k) ? CUSTOMER.shape : null; }"), true);
eq('the scripted customers name their shape', src.includes("tid:'fire', shape:'Shortsword', name:null") && src.includes("tid:'gale', shape:'Shortsword', name:'Gale'") && src.includes("name:'Bram', want:'swift', shape:'Dagger'"), true);
eq('the requested-shape style', src.includes('.sf-shape.sf-req {'), true);
/* owner, 2026-10-08 (part 1): the customer's trait ring goes once their sword is made */
eq('the ring goes once a sword with the trait is crafted (r248; it was: once a sword fills the order)', /function custSpotSync\(\)\{[\s\S]{0,300}custTraitMade\(tid0\)/.test(src)
  && src.includes('function custOrderReady(){'), true);
eq('the minigame takes over', src.includes("if(TUT_STAGE==='p1-craft-shape'){ TUT_STAGE='p1-craft-hammer'; tutUnglow(); tutExit(null); return; }"), true);
/* owner play-test, 2026-10-08: the mug arrow never came - the guide redraws only when its signature changes, and
   reaching the route's end changed nothing in it. The signature now carries it (also starts TC4's pull lesson). */
eq('the guide notices the route end', /function tutNudgeSig\(\)\{[\s\S]{0,500}\(melt && segs\.length && swordAtRouteEnd\(\)\)\?1:0/.test(src), true);
eq('the craft window closes: to the counter', src.includes('else if(gcSword) ftueDurableSell();'), true);
/* owner, 2026-10-09: the trait ring (#tutSpot) merged with the yellow map - a white core with a dark edge, a strong glow,
   and two rings rippling outward */
eq('the ring has a core, an edge and two ripples', src.includes('<g id="tutSpot" style="display:none;"><circle class="sp-rip" r="26"/><circle class="sp-rip sp-rip2" r="26"/><circle class="sp-edge" r="26"/><circle class="sp-core" r="26"/></g>'), true);
eq('the ripples grow and fade', src.includes('@keyframes spRipple { 0% { transform: scale(1); opacity: .95; } 100% { transform: scale(2.6); opacity: 0; } }'), true);
eq('the core glows', src.includes('#tutSpot .sp-core { stroke: #ffffff;'), true);
/* owner, 2026-10-09: the exits - the map is shop | counter | forge | cave, so the counter's way to the forge
   and the cave is RIGHT. New walks ask the screen map instead of assuming. */
const SP = src.match(/\/\* SCREEN-PURE-BEGIN \*\/([\s\S]*?)\/\* SCREEN-PURE-END \*\//);
const S = new Function(SP[1] + '; return { screenExit };')();
eq('counter to cave: right', S.screenExit('customer', 'cave'), '#panRight');
eq('counter to forge: right', S.screenExit('customer', 'forge'), '#panRight');
eq('cave to counter: left', S.screenExit('cave', 'customer'), '#panLeft');
eq('basement to counter: up', S.screenExit('basement', 'customer'), '#panUp');
eq('shop to forge: right', S.screenExit('shop', 'forge'), '#panRight');
eq('already there: none', S.screenExit('forge', 'forge'), null);
eq('no new walk assumes the counter is right of the forge', src.includes("SF_SCREEN==='customer' ? '#panLeft'") || src.includes("name==='customer' ? '#panLeft'"), false);
/* owner, 2026-10-09: the dragon showed only as a bubble - he now shows whenever his line is up on that screen */
/* owner, 2026-10-09: off the forge, a line not in TUT_SCREEN_STAGES went to the forge dragon's bubble while he was
   hidden under the screen - a bubble with no dragon. During the FTUE he now comes along to every screen. */
eq('the dragon comes along during the FTUE', /function onScreenDragon\(\)\{[\s\S]{0,700}if\(!FTUE_ST\.done && SF_SCREEN!=='forge' && \(SF_SCREEN!=='customer' \|\| TUT_COUNTER_VISITED \|\| !!TUT_BRAM_STATE\)\) return true;/.test(src), true);
/* sayWhere() calls onScreenDragon(), so onScreenDragon() must never call sayWhere() (it looped, 2026-10-09) */
eq('onScreenDragon does not call sayWhere', /function onScreenDragon\(\)\{[\s\S]*?\n\}/.exec(src)[0].includes('sayWhere('), false);
eq('a line on the screen box refreshes him', src.includes("if(where==='screen') updateTutorialCounterUi();"), true);
/* owner, 2026-10-09: GC5's fire Longsword through the map icon, GC6's fire Broadsword through the craft book */
eq('GC5 and GC6 craft guides', [FTUE.parts[3].gpc[1].guide, FTUE.parts[3].gpc[2].guide], ['map', 'book']);
eq('the guide starts when the market lesson closes', src.includes("if(m.o && m.o.guide) ftueBookGo(m.o);"), true);
eq('map: the fire icon is ringed until the book opens', /function ftueBookStep\(\)\{[\s\S]{0,1500}tutSpotOn\(/.test(src), true);
eq('book: the button, the fire page, CRAFT 1', /function ftueBookStep\(\)\{[\s\S]{0,2000}cb-mark\.rec\[data-key=[\s\S]{0,300}#cbCraft1/.test(src), true);
/* owner, 2026-10-09: the customer waiting system */
const VW = {
  D107c: "Do you know gale makes fire stronger? I want a gale katana so I can make my partner's flame grow more fierce. I would also want a fire claymore for my partner.",
  D107d: 'I am not buying the blueprint for those! Ask the customer to come back later when you are richer. Humph!',
  D107e: "Why are you asking them to come later when you can craft for them? Don't be lazy! I need my meat!" };
for (const [k, v] of Object.entries(VW)) eq(k + ' text', line(k), v);
for (const [k, prev] of [['D107c','D107b'],['D107d','D107c'],['D107e','D107d']]) eq(k + ' follows ' + prev, keyList[keyList.indexOf(k) - 1], prev);
eq('COME LATER on the counter', src.includes('<button class="cs-btn cs-later ftue-off" type="button" title="Ask them to come back later" onclick="comeLater()">COME LATER</button>'), true);
eq('COME LATER shows from the waiting customer on, or after the FTUE', src.includes("le.classList.toggle('ftue-off', !(FTUE_ST.laterOn || FTUE_ST.done));"), true);
eq('in the tutorial, after the lesson, the dragon refuses', /function comeLater\(\)\{[\s\S]{0,700}sayQueue\('D107e'\)/.test(src), true);
eq('the waiting list lives in the save (FTUE_ST.waiting)', src.includes('waiting:[], laterOn:false'), true);
eq('the ledger\'s right page: details on top, the waiting list below', src.includes('<div class="lb-wait"><h4>Waiting list</h4><div id="lbWait"></div></div>'), true);
eq('a request reads "1X Fire Claymore"', src.includes("function waitLabel(it){ return '1X '+TRAIT_BY[it.trait].name+' '+it.shape; }"), true);
eq('the call-back question', src.includes('Call this customer back?') && src.includes('>WAIT LONGER<'), true);
eq('someone already at the counter', src.includes('There is already a customer at the counter.'), true);
eq('two swords or none', src.includes('My request was for two swords. You only have one?'), true);
/* owner, 2026-10-09: the crafted window at the wireframe's size - the card fills ~88% of the height (470 px wide in the 1080x600 frame) */
eq('the crafted card is wireframe-sized', src.includes('.cw-stage { position: relative; width: 470px;') && src.includes('.cw-main .cr-art { height: 200px;'), true);
/* owner, 2026-10-09: the QUEST button glows green while a finished quest waits to be claimed */
eq('the glow follows "something to claim"', src.includes("function questBtnUi(){ const b=document.getElementById('questBtn'); if(b) b.classList.toggle('qs-ready', QUESTS.some(q=>q.done && !q.claimed)); }"), true);
eq('it is refreshed when a quest finishes, is claimed, and on load', /function bumpQuest\(id,n\)\{[\s\S]{0,600}questBtnUi\(\)/.test(src)
  && /function claimQuest\(id, btn\)\{[\s\S]{0,200}questBtnUi\(\)/.test(src) && /function applyState\(o\)\{[\s\S]*?questBtnUi\(\)/.test(src), true);
eq('the green glow', src.includes('#questBtn.qs-ready {'), true);
/* owner, 2026-10-09: the new "Sword crafted!" window (wireframes in assets/Anchor-images/Sword_crafted_*.png) */
eq('the main card: title, art, name line, heart + hammer, ores, gold, CLOSE', ['<h3 class="cw-title">Sword crafted!</h3>', 'id="cwName"',
  'class="cw-fill cw-hp"', 'class="cw-fill cw-hm"', 'id="cwOreN"', 'id="cwGold"', '<button class="cw-close" type="button" onclick="closeCraft()">Close</button>']
  .every(t => src.includes(t)), true);
eq('the paper behind it, and the arrow that slides it out', src.includes('<div class="cw-paper" id="cwPaper">') && src.includes('onclick="craftDetails()"')
  && src.includes('.cw-stage.open .cw-main {'), true);
eq('one line: tier, trait, shape (several traits: "Epic Fire, Fine Swift Longsword")', src.includes("function craftName(w){"), true);
eq('the icons fill to the percentage', src.includes("function cwFill(el, f){"), true);
eq('the Health line over the window points at the heart now', src.includes("document.querySelector('#sfCraftModal .cw-hp')"), true);
/* the hammering goes into the recipe, and the craft book uses it */
eq('a run remembers the pages it wrote', src.includes('if(melt){ melt.recipeKeys=melt.recipeKeys||[]; if(melt.recipeKeys.indexOf(k)<0) melt.recipeKeys.push(k); }'), true);
eq('the finished sword writes its forging onto them', src.includes('(melt && melt.recipeKeys || []).forEach(k=>{ if(RECIPES[k]) RECIPES[k].forge={ quality:fq.name, acc:fq.acc }; });'), true);
eq('a page saved from the last craft carries it too', src.includes('forge:sub.forge||null') && src.includes('forge:s.forge||null'), true);
eq('the craft book uses the page\'s forging', src.includes("quality:(r.forge ? r.forge.quality : HM_HITS.unforged), forge:(r.forge ? r.forge.acc : null),"), true);
/* owner, 2026-10-10: the first crafted window teaches itself - arrow, hammer row, ore row, then CLOSE */
eq('D17a text', line('D17a'), 'Tap the arrow to see more details.');
eq('D17b text', line('D17b'), 'The hammer icon shows how well you hammered your blade. Higher percentage means more money.');
eq('D17c text', line('D17c'), 'This shows how much ore you used for the sword.');
eq('once per game, saved with the FTUE state', /function ftueFresh\(\)\{ return \{[^\n]{0,300}cwSeen:false/.test(src), true);
eq('the PART jumps skip it', src.includes('FTUE_ST.market=true; FTUE_ST.cwSeen=true;'), true);
eq('the window starts it', /function showCraft\(w, n, after\)\{[\s\S]*?cwLessonStart\(\);\r?\n\}/.test(src), true);
eq('the arrow opens the rows lesson', /function craftDetails\(\)\{[\s\S]{0,800}CW_LESSON==='arrow'[\s\S]{0,200}sayQueue\('D17b','D17c'\)/.test(src), true);
eq('each line lights its own part', src.includes("if(id==='D17b' && CW_LESSON) cwLit('#cwFgRow');") && src.includes("if(id==='D17c' && CW_LESSON) cwLit('#cwOres');")
  && src.includes('id="cwFgRow"'), true);
eq('after D17c the CLOSE button lights', /D17c:function\(\)\{ if\(CW_LESSON==='rows'\)\{ CW_LESSON='close'; cwLit\('#sfCraftModal \.cw-close'\);/.test(src), true);
eq('D17c keeps a continue button', /const SAY_GO_MORE=\{[^}]*D17c:1/.test(src), true);
eq('the lines sit over the window', /function cwLessonSay\(\)\{[^\n]*say-over-modal/.test(src), true);
eq('closing ends the lesson', /function closeCraft\(\)\{\r?\n\s*cwLessonEnd\(\);/.test(src), true);
/* owner, 2026-10-10: the hurt fire sword's window - D69d lights the arrow, the paper's Health row, then CLOSE */
eq('the hurt fire sword starts the Health lesson', src.includes("if(fireHurt) setTimeout(()=>cwHurtStart(), 350);"), true);
eq('D69d waits on the arrow', src.includes("function cwHurtStart(){ if(CW_LESSON) return; CW_LESSON='hp-arrow'; cwLit('#cwTab'); sayQueue('D69d'); cwLessonSay(); }"), true);
eq('opening the paper lights the Health row', src.includes("CW_LESSON==='hp-arrow'){ CW_LESSON='hp-row'; cwLit('#cwHpRow');") && src.includes('id="cwHpRow"'), true);
eq('D69d has no continue until the paper is out', src.includes("if(id==='D69d' && CW_LESSON==='hp-arrow') sayGoIcon(go,'none');"), true);
eq('closing D69d lights CLOSE', src.includes("D69d:function(){ if(CW_LESSON==='hp-row'){ CW_LESSON='close'; cwLit('#sfCraftModal .cw-close');"), true);
eq('CLOSE ends it too', src.includes("if(['D17a','D17b','D17c','D69d'].indexOf(SAY_ON)>=0) sayHide();"), true);
/* owner, 2026-10-13: the pickaxe never goes in the bag - it lies in the cave at one spot, and every arrival puts it back there */
eq('one home spot, clear of every seam spot (measured: 1.9 x the reach)', src.includes('const PICK_HOME={ x:28, y:78 };') && src.includes('function pickHome(){ PICK_OUT={ x:PICK_HOME.x, y:PICK_HOME.y }; }')
  && src.includes('let PICK_OUT={ x:PICK_HOME.x, y:PICK_HOME.y };'), true);
eq('every arrival at the cave resets it', /function goScreen\(name\)\{[\s\S]*?if\(name==='cave'\)\{ pickHome\(\); PICK_HINT=true; \}[\s\S]*?buildCave\(\);/.test(src), true);
eq('never null: new game, load, the PART jumps and the tutorial cave all put it home', !/PICK_OUT=null/.test(src) && !src.includes('PICK_OUT=o.cave.pick') && (src.match(/pickHome\(\);/g) || []).length >= 5, true);
eq('no pickaxe slot in ITEMS & DECOR, no stowing', !src.includes("slot.className='ore-slot inv-pick'") && !src.includes('function stowPick(') && !src.includes('function startPickDrag(') && !src.includes('function dropPick(')
  && !src.includes('function tutStowed(') && !src.includes("TUT_STAGE='cave-stow'"), true);
eq('the fire run leaves the cave straight after mining', src.includes("TUT_STAGE='to-forge2'; tutArrow(null,null); tutUnglow(); sayQueue('D66','D67'); setTimeout(()=>tutExit('#panLeft'), 0);"), true);
eq('D66 no longer puts it in the bag', !/D66: "[^"]*inventory/.test(src), true);
eq('D66 text (owner approved 2026-10-14)', line('D66'), "Let's leave the pickaxe here for next time. We found it. We are not stealing. Not stealing at all.");
eq('D66 no longer marked as a proposal', !/D66: "[^"]*",[^\n]*PROPOSED/.test(src), true);
eq('D67 counts the 3 iron the cave now gives', line('D67'), "3 iron and 2 manganese. Not bad. Let's go back to the forge.");
/* owner, 2026-10-13: the fire run's last ore - full iron (crosses a zone) or full manganese (goes round it), both Fine */
eq('fireAt', FTUE.fireAt, { x: 824, y: 1016 });
eq('fire moves after hazards and books are placed', /addBook\(K,bx,by\); got\+\+; \} \}\);[\s\S]{0,900}const ft=traits\.find\(t=>t\.trait && t\.trait\.id==='fire'\); if\(ft\)\{ ft\.x=FTUE\.fireAt\.x; ft\.y=FTUE\.fireAt\.y;/.test(src), true);
eq('D72 text', line('D72'), 'If we use iron, we will cross another hazard zone.');
eq('D72a text', line('D72a'), 'But the manganese can avoid it.');
eq('D72a follows D72', (() => { const ks = [...src.matchAll(/\n\s*(D\d+[a-z]?): "/g)].map(x => x[1]); return ks[ks.indexOf('D72a') - 1]; })(), 'D72');
eq('no grind cap any more', !src.includes('GRIND_FIRE_CAP'), true);
eq('either ore, fully ground', src.includes("if(TUT_STAGE==='fire-mang') return 'iron/manganese';") && src.includes("if(want && want.split('/').indexOf(oreId)<0)")
  && /function fullGrindOnly\(\)\{[\s\S]{0,300}TUT_STAGE==='fire-mang'; \}/.test(src), true);
eq('after the reheat: both lines, and each draws its path', src.includes("sayQueue('D72','D72a'); tutForkPath('iron');") && src.includes("if(id==='D72a' && TUT_STAGE==='fire-mang') tutForkPath('manganese');"), true);
eq('the choice paths are dashed, apart from the red route (found in the browser: iron blended into it)',
  src.includes("el.setAttribute('stroke', id==='iron' ? '#8e1a10' : '#2f9e4f'); el.setAttribute('stroke-dasharray','14 9'); el.setAttribute('stroke-width','5');"), true);
eq('the fog opens over the choice, so the hazard is seen (found in the browser: both paths ran into the fog)',
  src.includes("if(id==='iron'){ const m=HAZ.move[0]; reveal(m.to.x, m.to.y, 'fork'); tutForkHaz(true); }"), true);
eq('the hazard on the iron path shows red while it is talked about (found in the browser: faint under the fog texture)',
  src.includes("function tutForkHaz(on){ const m=HAZ.move[0], z=hazards.find(z=>Math.hypot(z.x-m.to.x, z.y-m.to.y)<1); if(z && z.el) z.el.classList.toggle('fork-hot', !!on); }") && src.includes(".haz.fork-hot .hazHot {")
  && src.includes("tutForkHaz(true);") && /function tutForkHide\(\)\{[^\n]*tutForkHaz\(false\);/.test(src), true);
eq('then the grindstone, either ore', /D72a:function\(\)\{ if\(TUT_STAGE==='fire-mang'\) tutForkDone\(\); \}/.test(src), true);
eq('a full grind says D73', src.includes("function tutFireGround(){") && src.includes("if(TUT_STAGE==='fire-mang') tutFireGround();"), true);
eq('the PART jumps\' fire recipe is the full route', src.includes("RECIPES.fire={ key:'fire', traits:[{ tid:'fire', tier:'Fine' }], ores:['iron','iron','manganese','manganese'], grinds:[1,1,1,1], at:Date.now() };"), true);
/* owner, 2026-10-14: the craft book - a heading on each box, and the page's own sword (fire, swift, gale) */
eq('three headings', src.includes("cbHead(ob, 'Ores used');") && src.includes("cbHead(fb, 'Crafting process');") && src.includes("cbHead(sb, 'Shapes unlocked');")
  && src.includes("function cbHead(el, t){ const h=document.createElement('span'); h.className='cb-h'; h.textContent=t; el.appendChild(h); }") && src.includes('.cb-slot span.cb-h {') && src.includes('border: 0; background: none; padding: 0; border-radius: 0;'), true);   /* found in the browser: .cb-shapes span gave it the pill look */
eq('the picture wears the page\'s trait', src.includes("const skin=r ? skinOf({ traits:list }) : 'balanced', dz=ddCoerce(DD_SEL, skin);")
  && src.includes("[bladeFor(skin, 'Longsword'), ddSrc('guard', dz.guard), ddSrc('grip', dz.grip), ddSrc('pommel', dz.pommel)]"), true);
eq('"Shapes unlocked" lists what the shape picker allows for the trait', src.includes("if(r){ const k=ftueTraitKey(list.map(a=>a.tid)); marketShapes(k).filter(sh=>ftueShapeOpen(k, sh)).forEach(sh=>{")
  && !src.includes('CB_SHAPES'), true);
/* owner, 2026-10-14: the waiting customer's guide - can afford both blueprints -> see the request in the ledger -> craft
   both -> call them back. Its own saved state (FTUE_ST.wq), so the tutorial's stages are untouched; it speaks only at a free moment */
eq('D107f text', line('D107f'), 'You can now buy both the blueprints that other guy requested. See the request in the ledger.');
eq('D107g text', line('D107g'), 'Craft both the swords.');
eq('D107h text', line('D107h'), 'Now tap on the waiting list in the ledger to call them back.');
for (const [k, prev] of [['D107f', 'D107e'], ['D107g', 'D107f'], ['D107h', 'D107g']]) eq(k + ' follows ' + prev, (() => { const ks = [...src.matchAll(/\n\s*(D\d+[a-z]?): "/g)].map(x => x[1]); return ks[ks.indexOf(k) - 1]; })(), prev);
eq('its state is saved with the FTUE', /function ftueFresh\(\)\{ return \{[^\n]{0,400}wq:''/.test(src), true);
eq('a free moment: no line, no window, the tutorial waiting on play', src.includes("function wqFree(){ if(SAY_ON || document.querySelector('.sf-modal.show')) return false; const P=FTUE.parts[FTUE_ST.part];")
  && src.includes("return !!(FTUE_ST.done || TUT_STAGE==null || /^p\\d-(gpc|bell)$/.test(TUT_STAGE) || (P && TUT_STAGE===P.after)); }"), true);
eq('see: gold covers the blueprints still to buy', src.includes("if(FTUE_ST.wq===''){ const need=wqNeed(); if(!need){ FTUE_ST.wq='craft'; return; } if(GOLD>=need && wqFree()) wqStep('see', 'D107f'); return; }"), true);
eq('craft: closing the ledger', src.includes("if(FTUE_ST.wq==='see'){ FTUE_ST.wq='craft'; wqLit(); sayQueue('D107g'); }"), true);
eq('call: both swords in the bag', src.includes("if(FTUE_ST.wq==='craft'){ if(wqHave() && wqFree()) wqStep('call', 'D107h'); return; }"), true);
eq('the lights: ledger, then the request, then YES (call only)', src.includes("function wqLit(){") && src.includes("'#sfWaitModal .wt-yes'") && src.includes("'#lbWait .lb-wreq'"), true);
eq('served: the guide ends (only once it has started - before part 4 nobody waits)', src.includes("if(!e){ if(FTUE_ST.wq && FTUE_ST.wq!=='done' && !wqAtCounter()) FTUE_ST.wq='done'; wqLit(); return; }"), true);
eq('it runs every frame', /function updateHintArrow\(\)\{[\s\S]{0,1200}wqTick\(\);/.test(src), true);
/* owner, 2026-10-14: the Durable craft's mug pointer stayed after the trait was in (also TC4's, GC8's) */
eq('after the pour, the guide moves to the metal', src.includes("function ftueDurQuenched(){ tutArrow(null,null); tutUnglow(); setTimeout(()=>tutGlow('#orb', true), 0); }")
  && src.includes("if(TUT_STAGE==='p3-dur-heat' || TUT_STAGE==='p4-quench' || TUT_STAGE==='p4-weak-quench') ftueDurQuenched();"), true);
eq('the Durable guide no longer re-points at the mug once Durable is on', src.includes("if(melt.traits.some(a=>a.t && a.t.id==='durable')) return;   /* 2026-10-14: quenched - the metal is next */"), true);
/* owner, 2026-10-14: an arrow from the rail while the ore's tab is closed - not needed, the tab's glow is enough */
eq('no arrow while its inventory tab is closed', src.includes("if(o.tab!=null){ const need=(typeof o.tab==='function') ? o.tab() : o.tab; if(need!=null && INV_TAB!==need){ svg.classList.remove('on'); return; } }")
  && /function tutDrawArrow\(\)\{[\s\S]{0,900}if\(o\.tab!=null\)/.test(src), true);
eq('a tab switch redraws it', /function invTab\(i\)\{[\s\S]{0,200}setTimeout\(tutDrawArrow, 0\);/.test(src), true);
/* owner, 2026-10-14: "why 0g bonus from sharpening?" - DONE took any edge, and D57 quoted the 0 */
eq('in the lesson, DONE waits for the green band', src.includes("if(!revert && TUT_STAGE==='base-sharp' && SH_VAL < SH_ZONE_LO){ toast('Sharpen it into the <b>green zone</b> first'); return; }")
  && /function closeSharpen\(revert\)\{\s*if\(!revert && TUT_STAGE==='base-sharp'/.test(src), true);
eq('no sharpening bonus at the sale, no D57', src.includes("if(FTUE_ST.part===5 && SAY_VARS.b>0){"), true);
/* owner, 2026-10-14: the crafting process starts with just "Ores" - the ores themselves are in "Ores used" */
eq('process: Ores, heat, hammer, quench, hammer', src.includes("const steps=['Ores','heat','hammer','quench','hammer'];") && !src.includes("const steps=[names.join(' + '),"), true);
/* owner, 2026-10-14: the book's middle column (Composition_book_wireframe.png, updated): one Trait Tier box, then a description */
eq('one tier box, labelled, in place of the five', !src.includes('id="cbPip') && src.includes('<div class="cb-label" style="left:25.10%; top:13.40%; width:18.20%;">Trait Tier</div>')
  && src.includes('<div class="cb-slot cb-tier" id="cbTier" style="left:25.10%; top:17.90%; width:18.20%; height:10.20%;"></div>'), true);
eq('the description box under it', src.includes('<div class="cb-slot cb-desc" id="cbDesc" style="left:25.10%; top:31.30%; width:18.20%; height:31.30%;"></div>'), true);
{ const m = src.match(/const SWORD_DESC = \{([\s\S]*?)\n\};/); const keys = m ? [...m[1].matchAll(/\n\s*([a-z]+):\s*"/g)].map(x => x[1]) : [];
  const traitIds = [...(src.match(/const TRAITS = \[([\s\S]*?)\n\];/) || [, ''])[1].matchAll(/id:'([a-z]+)'/g)].map(x => x[1]);
  eq('a description for every one of the 25 traits', keys.length === 25 && traitIds.length === 25 && traitIds.every(t => keys.includes(t)), true);
  eq('balanced: the owner\'s words', /balanced:\s*"A basic balanced sword\. Good choice for those who don't like the fancy elements and rely on pure skills\."/.test(m ? m[1] : ''), true); }
eq('a page of several traits says it is a blend, then the first trait\'s words', src.includes("function swordDesc(list){") && src.includes("'A blend of '+names.join(' and ')+'. '"), true);
/* owner, 2026-10-14: the grindstone was still faintly visible before it is given - fully hidden now */
eq('locked grindstone: invisible and untouchable', src.includes('#stMortar.ftue-lock { visibility: hidden; pointer-events: none; }') && !src.includes('#stMortar.ftue-lock { filter: grayscale(1) brightness(0.55); opacity: 0.45; }'), true);
eq('an ore dropped where it is hidden does nothing (no toast about a stone nobody sees)', src.includes("if(!FTUE_ST.grind) return true;   /* 2026-10-14: hidden, so silent */"), true);
/* owner, 2026-10-14: the customer's "tap to continue" is the dragon's OK button too */
eq('the customer bubble shows OK', src.includes('<p id="bramLine"></p><span class="go"><span class="go-ok">OK</span></span>') && !src.includes('<span class="go">tap to continue</span>'), true);
eq('in the dragon button\'s look', src.includes('.cs-bram-dlg .go { position:absolute; right:26px; bottom:-14px; display:none; align-items:center; justify-content:center; width:44px; height:26px;')
  && src.includes('.cs-bram-dlg.more .go { display:flex; }'), true);
/* owner, 2026-10-13: the dragon's continue button says OK instead of the double arrow; the close X stays */
eq('continue reads OK', src.includes("const SAY_GO_NEXT='<span class=\"go-ok\">OK</span>';") && !src.includes('<path d="M3 5l8 7-8 7z"'), true);
eq('close is unchanged', src.includes('const SAY_GO_CLOSE=\'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"'), true);
eq('the button widens for the word', src.includes("go.classList.toggle('ok', kind==='next');") && src.includes(".say-go.ok, #dragonSay .go.ok, #screenDragonSay .go.ok, .tut-iconsay .go.ok { width: 44px; }")
  && src.includes("go.title = kind==='close' ? 'Close' : 'OK';"), true);
/* owner, 2026-10-13: the mug went behind the bucket (z 9) - put back at z 3 after every pour and reset */
eq('one mug layer, above the bucket', src.includes('const MUG_Z=10;') && src.includes('<div id="mug" style="z-index:10;">') && src.includes('id="bucketBack" class="bucket-layer" src="assets/forge/anchor_bucket.webp" alt="Water bucket" style="z-index:9;"'), true);
eq('no mug sent below the bucket', !/mug\w*\.style\.zIndex=3\b/.test(src) && (src.match(/\.style\.zIndex=MUG_Z/g) || []).length >= 2, true);
/* owner, 2026-10-13: the sword rests on a trait -> the mug glows (the next step), in and out of the tutorial */
/* owner, 2026-10-14: it glowed again after the trait was acquired - the sword stays on the trait and the reach is set
   again - so it glows only when a pour would ADD something: a new trait, or a better tier of one the sword has */
eq('the glow wants a pour that adds something', src.includes("function mugWanted(){ if(!canPourQuench()) return false; const rt=melt.reachedTrait, had=melt.traits.find(a=>a.t && a.t.id===rt.trait.id);")
  && src.includes("return !had || TIER_RANK.indexOf(tierFromDist(melt.alignDist!=null ? melt.alignDist : ALIGN_MAX)) > TIER_RANK.indexOf(had.tier); }"), true);
eq('the mug glows while a pour would quench', src.includes("if(mugEl) mugEl.classList.toggle('mug-ready', mugWanted());")
  && /function updateHintArrow\(\)\{[\s\S]{0,900}mugEl\.classList\.toggle\('mug-ready'/.test(src) && src.includes('#mug.mug-ready img {'), true);
/* owner, 2026-10-13: the crafted sword flies into its inventory slot like the coins; the slot shows only when it lands */
eq('the swords in flight (not saved)', src.includes('let CRAFT_FLY=[], CRAFT_FLYING=false;'), true);
eq('the window marks the craft\'s swords', /function showCraft\(w, n, after\)\{[\s\S]{0,200}CRAFT_FLY=INV\.swords\.slice\(-n\)\.map\(s=>s\.id\); CRAFT_FLYING=false;/.test(src), true);
eq('the shelf is redrawn once the window is up (found in the browser: before it, the slot still showed)',
  src.includes("document.getElementById('sfCraftModal').classList.add('show'); if(INV_TAB===2) buildShelf();"), true);
eq('an arriving slot keeps its place, unseen and undraggable', src.includes("const arriving=craftArriving(w.id); if(arriving) slot.classList.add('inv-arriving'); slot.dataset.sid=w.id;")
  && src.includes("slot.addEventListener('pointerdown', e=>{ if(craftArriving(w.id)) return; startSwordDrag(w,e); });")
  && src.includes('#oreShelf .ore-slot.inv-arriving > * { visibility: hidden; }'), true);
eq('arriving only while the window is up or the flight runs', src.includes("function craftArriving(id){ return CRAFT_FLY.indexOf(id)>=0 && (CRAFT_FLYING || document.getElementById('sfCraftModal').classList.contains('show')); }"), true);
eq('each sword flies to its own slot, in an arc like the coins', src.includes('const slot=document.querySelector(\'#oreShelf .inv-sword[data-sid="\'+id+\'"]\')')
  && /function flyCraft\(from, w, n\)\{[\s\S]*?scale\(1\.15\)[\s\S]*?craftLanded\(id\)/.test(src), true);
eq('it leaves at the window\'s size, no jump', src.includes("s0=Math.max(1, Math.min(2.4, from.height/CRAFT_FLY_SIDE))") && src.includes("{ transform:'translate(-50%,-50%) scale('+s0.toFixed(2)+')', opacity:1 }"), true);
eq('landing: shown, a pop and sparkles', src.includes("function craftLanded(id){ CRAFT_FLY=CRAFT_FLY.filter(x=>x!==id); if(!CRAFT_FLY.length) CRAFT_FLYING=false;")
  && src.includes('.ore-slot.inv-landed') && src.includes('.inv-spark'), true);
eq('a new game or a load drops any flight', /function newGame\(\)\{[\s\S]{0,400}CRAFT_FLY=\[\]; CRAFT_FLYING=false;/.test(src) && /function applyState\(o\)\{[\s\S]{0,300}CRAFT_FLY=\[\]; CRAFT_FLYING=false;/.test(src), true);
/* owner, 2026-10-13: a step the player already finished is skipped - one table, checked every frame */
eq('the per-frame check', src.includes('function updateHintArrow(){') && /function updateHintArrow\(\)\{[\s\S]{0,600}tutSkipDone\(\);/.test(src), true);
eq('it tries a stage once, then waits for the stage to change', src.includes("function tutSkipDone(){ const st=TUT_STAGE, e=st && TUT_SKIP[st]; if(!e || TUT_SKIP_TRIED===st || (e.quiet && SAY_ON)) return; if(!e.done()) return; TUT_SKIP_TRIED=st; e.next(); }")
  && src.includes("if(TUT_SKIP_TRIED && TUT_SKIP_TRIED!==TUT_STAGE) TUT_SKIP_TRIED=null;"), true);
{
  const blk = (src.match(/const TUT_SKIP=\{([\s\S]*?)\n\};/) || [])[1] || '';
  const scr = (src.match(/const TUT_SKIP_SCREEN=\{([^}]*)\}/) || [])[1] || '';
  const keys = [...blk.matchAll(/\n\s*'([a-z0-9-]+)':/g)].map(x => x[1]);
  const skeys = [...scr.matchAll(/'([a-z0-9-]+)':'([a-z]+)'/g)].map(x => x[1]);
  const all = keys.concat(skeys);
  eq('every skip entry is a real stage', all.length > 20 && all.every(k => src.includes("TUT_STAGE='" + k + "'")), true);
  eq('no stage listed twice', new Set(all).size, all.length);
  const E = {   /* stage: [done, next] - the record of what "already done" means */
    'ore':            ["ftueOreIn('iron')>=2 && ftueOreIn('manganese')>=2", 'tutCheckOre()'],
    'bellows':        ["!!melt && (melt.stage!=='smelting' || gateReady)", 'tutGateStep()'],
    'gate':           ["!!melt && (melt.stage==='hot' || melt.stage==='onAnvil')", 'tutAnvilStep()'],
    'anvil':          ["!!melt && melt.stage==='onAnvil'", 'tutHammerStep()'],
    'tc2-raw':        ["segs.some(g=>g.ore==='iron') && segs.some(g=>g.ore==='manganese')", 'tutTc2RawCheck()'],
    'regrind-iron':   ["tutGroundIn('iron')", "tutSmeltCheck('iron', 1)"],
    'regrind-mang':   ["tutGroundIn('manganese')", "tutSmeltCheck('manganese', 1)"],
    'p1-craft-heat':  ['!!melt && melt.traits.length>0', 'ftueGcQuenched()'],
    'p1-craft-shape': ['tutHmOpen()', 'tutHmStep()'],
    'p3-dur-mine':    ['!CAVE_NODES.some(n=>n.left>0)', 'tutDay2Mined()'],
    'p3-dur-grind':   ['nickelIn()>=2', 'ftueDurableSmelted()'],
    'p4-weak-grind':  ['fireOreWanted()===false', 'ftueWeakSmelted()'],
    'd2-copper':      ['fireOreWanted()===false', 'tutDay2Smelted()'],
    'fire-heat1':     ['tutAtRouteEnd()', 'tutFireSpot()'],
    'd2-hammer':      ['tutAtRouteEnd()', 'tutDay2Pull()'],
    'd2-gale-hammer': ['tutAtRouteEnd()', 'tutGaleEnd()'] };
  for (const k in E) eq('skip ' + k, blk.includes("'" + k + "':") && blk.includes('done:()=>' + E[k][0] + ', next:()=>' + E[k][1]), true);
  eq('the second craft keeps its heat lesson (D38-D40): it waits for the line to close', /'regrind-heat':\s*\{ quiet:true, done:\(\)=>!!melt && \(melt\.stage!=='smelting' \|\| gateReady\), next:\(\)=>tutGateStep\(\) \}/.test(blk), true);
  eq('grinding early: ground on the wheel, or already in the smelter', blk.includes("'regrind-grind':") && blk.includes("done:()=>(!!prep && prep.grind>=0.999) || tutGroundIn('iron')"), true);
  eq('the hammer opened early, for every shape step', ['fire-shape', 'd2-gale-shape', 'bram2-shape'].every(k => blk.includes("'" + k + "':   { done:()=>tutHmOpen(), next:()=>tutHmStep() }")), true);
  eq('a pickaxe point spent before the tree lesson counts', blk.includes("'d2-skill':") && blk.includes("done:()=>FTUE_ST.part===6 && rank('pick')>=1 && !TUT_D2_SPENT, next:()=>{ TUT_D2_SPENT=true; }"), true);
  eq('"go to X" while already on X: the arrival runs again', ['to-bed:bedroom', 'g-forge:forge', 'p3-dur-cave:cave', 'd2-d3cave:cave', 'to-basement:basement', 'dec-back:customer', 'counter-guide:customer', 'to-forge:forge']
    .every(p => { const [k, v] = p.split(':'); return scr.includes("'" + k + "':'" + v + "'"); }), true);
  eq('screen entries wait for the line and replay goScreen\'s arrival', src.includes("function tutArriveHere(){ const name=SF_SCREEN; if(name==='forge' && TUT_STAGE==='to-forge'){ tutDone(); setTimeout(tutForgeAgain, 450); return; } if(name==='customer') tutCounterArrival(); tutScreenArrived(name); }")
    && src.includes("Object.keys(TUT_SKIP_SCREEN).forEach(k=>{ TUT_SKIP[k]={ quiet:true, done:()=>SF_SCREEN===TUT_SKIP_SCREEN[k], next:tutArriveHere }; });"), true);
  eq('a quiet entry waits while a line is up', src.includes("if(!e || TUT_SKIP_TRIED===st || (e.quiet && SAY_ON)) return;"), true);
  /* the market: a blueprint the player already owns is not bought again (it looped: buy -> close -> ask) */
  eq('owned blueprint: the market trip is skipped', src.includes("function ftueMarketOwned(){ const m=FTUE_MK; return !!(m && m.step==='ask' && FTUE_ST.shapes[m.o.trait+':'+m.o.shape]); }")
    && src.includes("if(nudge) typeAfter(()=>{ if(ftueMarketOwned()){ ftueMarketDone(FTUE_MK); return; }"), true);
  eq('closeMarket and the skip share one ending', /function closeMarket\(\)\{[\s\S]{0,300}if\(m && m\.step==='done'\) ftueMarketDone\(m\);/.test(src), true);
}
/* D28a must sit beside D28, never at the end: lastLine() is the map's final key */
const keys = [...src.matchAll(/\n\s*(D\d+[a-z]?): "/g)].map(x => x[1]);
eq('D28a follows D28', keys[keys.indexOf('D28a') - 1], 'D28');
eq('D111a follows D111', keys[keys.indexOf('D111a') - 1], 'D111');
eq('last key is D140 (r213: the closing line is the final line)', keys[keys.length - 1], 'D140');
for (const [k, prev] of [['D17a', 'D17'], ['D17b', 'D17a'], ['D17c', 'D17b'], ['D28b', 'D28a'], ['D58a', 'D58'], ['D92a', 'D92'], ['D93a', 'D93']]) eq(k + ' follows ' + prev, keys[keys.indexOf(k) - 1], prev);

/* r231 (owner, 2026-10-14): the customer's dialogue text is 50% bigger, 17px -> 25.5px, in both customer boxes.
   r234 (owner, same day): 25% smaller than that, 25.5px x 0.75 = 19.125px */
eq('customer line 19.125px (.cs-dlg p)', /\.cs-dlg p \{[^}]*font-size: 19\.125px;/.test(src), true);
eq('customer line 19.125px (.cs-bram-dlg p)', /\.cs-bram-dlg p \{[^}]*font-size:19\.125px;/.test(src), true);
/* r245 (owner, 2026-10-15): GC5's map route - "Let's go to the forge.", then on the forge the frame darkens except the
   fire trait, and the dragon says "Click on the trait to open the craft book directly." */
/* r246 (owner): the game is for mobile - the owner's "click" is written "tap" */
eq('D92m and D92n, the owner\'s words (click -> tap)', src.includes(`D92m: "Let's go to the forge.",`) && src.includes('D92n: "Tap on the trait to open the craft book directly.",'), true);
eq('D92m follows D92l (the end of the D92 group), D92n follows D92m', keys[keys.indexOf('D92m') - 1] === 'D92l' && keys[keys.indexOf('D92n') - 1] === 'D92m', true);
eq('off the forge: D92m once, the exit lit, no dim', src.includes("if(SF_SCREEN!=='forge'){ tutHole(null); tutSpotOn(null); if(!g.saidGo){ g.saidGo=true; sayQueue('D92m'); } tutExitTo('forge'); return; }"), true);
eq('on the forge: the map brings the trait into view, D92n once, the dim with a hole over it', src.includes("const f=traits.find(t=>t.trait && t.trait.id===g.trait); tutExit(null); if(!g.saidTap) tutMapShow(f); tutSpotOn(f); tutHole(f); if(!g.saidTap){ g.saidTap=true; sayQueue('D92n'); } return; }")
  && src.includes('function tutMapShow(t){ if(!t) return; const h=view.w*aspect, m=0.15;'), true);
eq('the dim lifts when the book opens or the order is made', (src.match(/tutHole\(null\);/g) || []).length >= 3
  && /if\(custOrderReady\(\)\)\{   \/\* made: shut the book, then the counter \*\/\r?\n        tutSpotOn\(null\); tutHole\(null\);/.test(src)
  && /tutSpotOn\(null\); tutHole\(null\); tutArrow\(null,null\);\r?\n    if\(CB_SEL!==key\)/.test(src), true);
eq('the hole is a separate dim over everything (rail z45, exits z50), the bubble lifted over it', src.includes('<div id="tutHole"></div>') && src.includes('#tutHole { position: absolute; inset: 0; z-index: 60; background: rgba(6,4,2,.74); display: none; }')
  && src.includes('#dragonSay.hole-say { z-index: 61; }') && src.includes("const sb=document.getElementById('dragonSay'); if(sb) sb.classList.toggle('hole-say', !!TUT_HOLE);"), true);
eq('the frame loop keeps the hole on the icon and drops it off the stage', src.includes("if(TUT_HOLE){ if(TUT_STAGE!=='p3-book') tutHole(null); else tutHoleLayout(); }"), true);
eq('no player-facing line says click', !/D\d+[a-z]?: "[^"]*\b[Cc]lick/.test(src), true);
/* r244 (owner, 2026-10-15): the customer's line types left to right: left-aligned, across the box's full width */
eq('.cs-dlg p types from the left (a row flexbox: full width, still centred vertically)', /\.cs-dlg p \{[^}]*text-align: left; width: 100%; \}/.test(src), true);
eq('.cs-bram-dlg p types from the left', /\.cs-bram-dlg p \{[^}]*text-align:left;[^}]*align-self:stretch; width:100%;/.test(src), true);
/* r243 (owner, 2026-10-15): the sword's health is a ring around its map marker, not a bar at the top right */
/* r256 (owner, 2026-10-16): the ring covered the tier alignment ring, so the health is now a fill INSIDE the sword disc -
   a level from the top (100%) down to the bottom (0%), clipped to the disc, semi-transparent over the icon */
eq('the fill lives in the sword marker, over the icon, clipped to the disc', src.includes('<g id="swordHpFill"><clipPath id="swordHpClip"><circle r="17.25"/></clipPath><rect id="swordHp" x="-17.25" y="-17.25" width="34.5" height="34.5" clip-path="url(#swordHpClip)" fill="#5fd35f" fill-opacity="0.6"/></g>')
  && src.indexOf('<g id="swordHpFill"') > src.indexOf('<text text-anchor="middle" dominant-baseline="central" font-size="21">') && !src.includes('swordHpRing'), true);
/* r257 (owner, 2026-10-16): the fill shows at the start point too - always, full while there is no run */
eq('no swordOut gate; full health without a run', src.includes("const pct=Math.max(0, Math.min(100, ((melt ? melt.hp : BLADE_HP_MAX)/BLADE_HP_MAX)*100));")
  && !/function updateHpPill\(\)\{[^}]*swordOut\(\)/.test(src), true);
eq('the level is the health percentage, top down', src.includes("const D=34.5, h=D*pct/100; a.setAttribute('y', (17.25-h).toFixed(2)); a.setAttribute('height', h.toFixed(2));")
  && src.includes("a.style.display = pct>0 ? '' : 'none';"), true);
eq('no top-right bar left', !src.includes('id="sfHp"') && !src.includes('#sfHp'), true);
/* r242 (owner, 2026-10-15): every pointer glow is one the owner can see - the OK button's (tutLitCtl) for buttons and
   hotspots, the inventory tabs' face swap (tutBlinkTab) for every rail button, the skill tree's included */
eq('.tut-blink is the OK glow', src.includes('.tut-blink { animation: tutLitCtl 1.15s ease-in-out infinite; }') && !src.includes('.tut-blink { animation: tutBlinkHalo'), true);
eq('rail buttons blink like the tabs', src.includes('#settingsBtn.tut-blink, #marketBtn.tut-blink, #diaryBtn.tut-blink, #questBtn.tut-blink { animation: tutBlinkTab 1.1s ease-in-out infinite; }'), true);
eq('the skill button blinks like the tabs (still before .levelled)', src.includes('#skillBtn.tut-blink { animation: tutBlinkTab 1.1s ease-in-out infinite; }')
  && src.includes('#skillBtn.tut-blink .sk-lv { animation: tutBlinkSkillTxt 1.1s ease-in-out infinite; }')
  && src.indexOf('#skillBtn.tut-blink {') < src.indexOf('#skillBtn.levelled {'), true);
/* r241 (owner, 2026-10-15): the cancel-craft button asks first */
eq('the cancel confirmation window, in the owner\'s words', src.includes('<div id="sfCancelAsk" class="sf-modal">')
  && src.includes('<p class="sf-modal-sub">Are you sure you want to cancel the crafting? Ores will not be refunded.</p>')
  && src.includes('onclick="cancelCraftAnswer(true)">Yes, cancel</button>') && src.includes('onclick="cancelCraftAnswer(false)">No, keep crafting</button>'), true);
eq('the X opens it instead of cancelling', src.includes("if(c) c.addEventListener('click', cancelCraftAsk);")
  && !src.includes("if(c) c.addEventListener('click', ()=>{ refundOre(); resetRun();"), true);
eq('only Yes cancels', src.includes("function cancelCraftAnswer(yes){ const box=document.getElementById('sfCancelAsk'); if(box) box.classList.remove('show'); if(!yes) return;\n    refundOre(); resetRun();")
  || src.includes("function cancelCraftAnswer(yes){ const box=document.getElementById('sfCancelAsk'); if(box) box.classList.remove('show'); if(!yes) return;\r\n    refundOre(); resetRun();"), true);
/* r240 (owner, 2026-10-15): every arrival in the cave lights the pickaxe until the player touches it */
eq('the cave arrival sets the pickaxe hint', src.includes("if(name==='cave'){ pickHome(); PICK_HINT=true; }") && src.includes('let PICK_HINT=false;'), true);
eq('the rebuilt pickaxe keeps the hint', src.includes("if(PICK_HINT) p.classList.add('cv-hint');"), true);
eq('a touch on the pickaxe ends it', src.includes("el.addEventListener('pointerdown', e=>{ PICK_HINT=false; el.classList.remove('cv-hint'); e.preventDefault();"), true);
eq('the hint glows the art (not the swinging box)', src.includes('.cv-pick.cv-hint img { animation: tutGlow 1.15s ease-in-out infinite; }'), true);
/* r239 (owner, 2026-10-15): CRAFT 1 stops glowing once the order is made, and cannot be spammed in the FTUE.
   The book guide skipped its step while the crafted window was open and its signature did not change on close */
eq('the book guide re-runs when a window closes', src.includes("return [SF_SCREEN, bk && bk.classList.contains('show') ? 1:0, CB_SEL, custOrderReady()?1:0, COUNTER?1:0, ftueBookModal()?1:0].join(','); }")
  && src.includes("function ftueBookModal(){ return ['sfShapeModal','sfCraftModal','sfMarketModal'].some(id=>{ const m=document.getElementById(id); return m && m.classList.contains('show'); }); }")
  && src.includes('if(ftueBookModal()) return;'), true);
eq('FTUE: CRAFT 1 is locked while the customer\'s order is already made', src.includes('function ftueCraftLocked(){ if(FTUE_ST.done || !CUSTOMER) return false;')
  && src.includes("if(ftueCraftLocked()){ toast('This order is already made. Serve the customer first.'); return; }")
  && src.includes("if(b) b.disabled=!r || (id==='cbCraft1' && ftueCraftLocked());"), true);
/* r238 (owner, 2026-10-14): a counter sword goes back to the bag after Bram's opener. TUT_BRAM_STATE stays 'done' for
   the rest of the game, and takeCounter() refused on any value; only Bram's live scene may hold the sword */
eq('takeCounter refuses only during Bram\'s scene', src.includes("function takeCounter(){ if(!COUNTER || (TUT_BRAM_STATE && TUT_BRAM_STATE!=='done')) return;"), true);
/* r237 (owner, 2026-10-14): the sword on a table is grabbed only by its strip (.cs-swordbox). Its art box (.cs-sword, a
   large mostly transparent square) covered the lower sharpening wheel, so a tap there took the sword back */
eq('the table sword art takes no taps', /\.cs-sword \{[^}]*pointer-events: none;/.test(src), true);
/* r236 (owner, 2026-10-14): back on the forge screen, the dragon is back at his LAYOUT spot (top left). homeDragon()
   cleared his inline left/top, which dropped him to the bench's bottom left, not where applyLayout() puts him */
eq('applyLayout can place one prop', src.includes('function applyLayout(orient, only){') && src.includes('for(const name in L){ if(only && name!==only) continue;'), true);
eq('homeDragon puts him at his LAYOUT spot', src.includes("d.classList.remove('dragging');\n    applyLayout(SF_ORIENT, 'dragon');") || src.includes("d.classList.remove('dragging');\r\n    applyLayout(SF_ORIENT, 'dragon');"), true);
eq('every arrival on the forge screen homes him', src.includes("if(name==='forge'){ layer.classList.remove('on'); homeDragon(); }"), true);
/* r235 (owner, 2026-10-14): the main crafted card shows the health and forging percentages under the heart and the hammer */
eq('a percentage under the heart and under the hammer', src.includes('<span class="cw-stat"><span class="cw-fill cw-hp" title="Health">')
  && src.includes('<span class="cw-pct" id="cwHpPct"></span></span>') && src.includes('<span class="cw-stat"><span class="cw-fill cw-hm" title="Forging">')
  && src.includes('<span class="cw-pct" id="cwHmPct"></span></span>'), true);
eq('they read the same values as the paper (no forging % when the hammer was skipped: "-")',
  src.includes("document.getElementById('cwHpPct').textContent=Math.round(hp*100)+'%'; document.getElementById('cwHmPct').textContent=acc!=null ? Math.round(acc*100)+'%' : '-';"), true);
/* r232 (owner, 2026-10-14): the inventory tabs are icons, and the fourth tab is "Decor" (no more "Items & Decor") */
{ const tabs = (src.match(/<div id="matTabs">([\s\S]*?)<\/div>\s*<div id="oreShelf">/) || [])[1] || '';
  const btn = [...tabs.matchAll(/<button class="matTab[^"]*"[^>]*>[\s\S]*?<\/button>/g)].map(x => x[0]);
  eq('four tabs', btn.length, 4);
  eq('tab names (title + aria-label)', btn.map(b => [(b.match(/title="([^"]*)"/) || [])[1], (b.match(/aria-label="([^"]*)"/) || [])[1]]),
    [['Ingredients', 'Ingredients'], ['Ingots', 'Ingots'], ['Swords', 'Swords'], ['Decor', 'Decor']]);
  eq('tab icons', btn.map(b => [...b.matchAll(/src="([^"]*)"/g)].map(x => x[1])), [
    ['assets/forge/iron_ore.webp'], [],
    ['assets/sword-parts/blades/balanced_longsword_blade.webp', 'assets/sword-parts/guards/guard1.webp', 'assets/sword-parts/grips/grip1.webp', 'assets/sword-parts/pommels/pommel1.webp'],
    ['assets/Decor/Banner.webp']]);
  /* r233 (owner): the Ingots tab shows the shelf's own metal orb, since that is what the tab holds */
  eq('Ingots tab icon is the shelf orb', btn[1].includes('<span class="mt-ic mt-orb"><span class="inv-orb"></span></span>'), true);
  eq('no text label left on a tab', btn.every(b => b.replace(/<[^>]*>/g, '').trim() === ''), true);
  eq('no "Items" left in the decor reward line', !src.includes('BUILD in ITEMS & DECOR') && src.includes("return 'Decor. Place it with BUILD in the Decor tab.';"), true); }

console.log('[ftue] GREEN / ' + n + ' checks');
