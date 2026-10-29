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
eq('oreStart (r291, the ore chain: the first sword\'s ores only)', FTUE.oreStart, { iron: 2, manganese: 2 });
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
  { id: 'epicHelp',     label: 'Use the ladle for an epic tier sword.', gold: 20, xp: 20 },   /* R5: the ladle aligns the tier */
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
  { trait: 'fire', shape: 'Longsword',  qty: 1, market: { by: 'dragon', ask: 'D92h', more: 'D92a', done: null }, guide: 'map' },   /* r300: D92a follows the order line */
  { trait: 'fire', shape: 'Broadsword', qty: 1, market: { by: 'dragon', ask: 'D92i', done: 'D28f' }, guide: 'book' },
  { trait: 'fire', shape: 'Katana',     qty: 1, market: { by: 'player', ask: 'D92j', done: null } } ]);
eq('part 3 after (v3: the bell brings TC4)', FTUE.parts[3].after, 'p4-tc4');
eq('part 3 rewards (D32: none)', FTUE.parts[3].rewards, { tc: [], gpc1: [], gpc2: [], gpc3: [], gpc4: [] });
/* owner, 2026-10-09: the Day 2 cave holds all of Day 2's ore (parts 3-6) plus 5 of each: nickel 2 (GC4) + 2 (TC4);
   iron and manganese 6 (GC5-GC7) + 1 (GC8) + 1 (Garric); copper 7 (TC5) + 5 (GC9) */
/* owner, 2026-10-10: "not enough ore for Garric" - the Day 2 cave holds his Epic Balanced (2 + 2) + 5 more of
   each on top; the dragon does not refill the bag */
eq('day2Cave (r291: GC4\'s Nickel only; the dragon gives the rest)', FTUE.day2Cave, { nickel: 2 });
/* owner, 2026-10-10: Day 3's cave holds the same, + 15 aluminium (it was normal play) */
eq('day3Cave', FTUE.day3Cave, { nickel: 9, iron: 20, manganese: 20, copper: 17, aluminium: 15 });
eq('the second night stocks it', src.includes("if(TUT_STAGE==='bed') ftueStockCave(FTUE_ST.part===6 ? FTUE.day3Cave : FTUE.day2Cave);"), true);
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
  D8:   "Look, the sword icon moves on the trait map with each pump. Keep pumping till we reach the '?'.",   /* R1: the bellows move it */
  D10:  "We reached a '?' trait! Tap the smelter gate to take the trait.",   /* R1: the gate takes the trait (was the mug) */
  D14:  'Press and hold the metal, and I will heat it for you to hammer.',
  D15:  'It is hot enough.',   /* r283 (owner): the instruction moved to D15a */
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
eq('fire sword: an ore arrow for each ore D68 asks for (R24: and the finishing iron)', src.includes("if(TUT_STAGE==='fire-grind' || TUT_STAGE==='fire-iron'){") &&src.includes("tutWheelArrow(want==='iron' ? 'Iron' : 'Manganese')")
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
/* r283 (owner, 2026-10-21): after D21 or D22 the player answers first, "I just crafted a sword. You can have it."; that tap brings D23 */
eq('D21 and D22 both wait for the reply', src.includes("typeAfter(()=>{ bramGiveAsk(); });")
  && src.includes("b.textContent='I just crafted a sword. You can have it.';") && !src.includes("I can give you a sword."), true);
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

/* R1 (2026-10-23, the smelter loop): the first sword's lines - specs/2026-10-23-ftue-smelter-rework-plan.md */
eq('D4 text (R1)', line('D4'), 'Drag the bellows handle up and down.');
eq('D12 text (R1)', line('D12'), 'Pick the shape of the sword blade.');
eq('D17 text (R1)', line('D17'), 'Pick up the blade by its handle and dip it in the bucket to finish.');
eq('D5 and D7 are gone (R1: the gate opens on a trait; the bellows move the sword)', /\n\s*D5: "/.test(src) || /\n\s*D7: "/.test(src) || /'D5'|'D7'/.test(src), false);
eq('pumpBeat: D8 after this much pumping (full-speed s; about one pump)', FTUE.pumpBeat, 0.4);
eq('the bellows count the beat as the sword glides', /function smGlide\(dt\)\{[\s\S]{0,400}advanceSword\(d\); tutPumpBeat\(d\);/.test(src)
  && src.includes("function tutPumpBeat(d){ if(TUT_STAGE!=='bellows') return; TUT_STRIKE+=d; if(TUT_STRIKE>=FTUE.pumpBeat) tutStrikeStep(); }"), true);
eq('pumping during a pause (D8) stores nothing (found in R1\'s browser check)', /function wireBellowGate\(\)\{[\s\S]{0,1400}if\(live!==e\.pointerId\) return; if\(TUT_PAUSE\)\{ lastY=e\.clientY; return; \}/.test(src), true);
eq('the bellows step resets the beat', /function tutBellowsStep\(\)\{[\s\S]{0,200}TUT_STRIKE=0;/.test(src), true);
eq('at the \'?\': D10, and the gate pointer goes up with it', src.includes("if(id==='D10' && TUT_STAGE==='quench') tutGatePointer();")
  && /function tutGatePointer\(\)\{ tutArrow\(null, '#furnaceGate'[^\n]*tutGlow\('#furnaceGate', true\); \}/.test(src), true);
eq('the trait window closed: D6, the metal from the gate to the anvil', /function tutShapeStep\(\)\{\s*if\(TUT_STAGE!=='acquired'\) return;\s*TUT_STAGE='anvil';[\s\S]{0,300}say\('D6'\);[\s\S]{0,100}tutArrow\('#orb', '#stAnvil \.anvil'/.test(src), true);
eq('on the anvil the shape window opens with D12 over it', /function openShapeSelect\(\)\{[\s\S]{0,300}if\(TUT_STAGE==='anvil'\)\{ TUT_STAGE='shape'; ftueSaySh\('D12'\); \}/.test(src), true);
eq('the old hammer and anvil steps are gone', /function tutHammerStep\(|function tutAnvilStep\(/.test(src), false);
eq('shaped: D17 with the pointer from the blade to the bucket', /function smShaped\(\)\{[\s\S]{0,500}smBladeShow\(\);[\s\S]{0,200}tutMugStep\(\);/.test(src)
  && src.includes("function tutMugStep(){ if(tutOver() || TUT_SAIDMUG) return; TUT_SAIDMUG=true; tutDipStep('D17'); }")
  && src.includes("function tutDipStep(id){ if(SAY_SEQ.indexOf(id)<0) SAY_SEQ.push(id); SAY_I=SAY_SEQ.indexOf(id); say(id); TUT_DIP=true; TUT_DIP_LINE=id; tutDipArrow(); }")
  && src.includes("function tutDipArrow(){ if(TUT_DIP) tutArrow('#smBlade', '#bucketBack'"), true);
eq('the pointer goes while the blade is held, and comes back if it is put down', /function smBladeGrab\(e\)\{[\s\S]{0,900}if\(TUT_DIP\) tutArrow\(null,null\);/.test(src) && /function smBladeHome\(\)\{[\s\S]{0,700}tutDipArrow\(\);/.test(src), true);
eq('the dip ends D17 and the pointer', /function smBladeQuench\(\)\{[\s\S]{0,300}tutDipDone\(\);/.test(src) && /function smBladeDrop\(\)\{[\s\S]{0,300}tutDipDone\(\);/.test(src)
  && src.includes("function tutDipDone(){ if(!TUT_DIP) return; TUT_DIP=false; tutArrow(null,null); if(SAY_ON===TUT_DIP_LINE) sayHide(); TUT_DIP_LINE=null; }"), true);

/* R3 (2026-10-23): TC2 in the smelter loop - no heat lesson (D39, D40 gone), D41 the gate, D44 the anvil, D47 the dip */
eq('D41 text (R3)', line('D41'), 'We are on the balanced trait. Open the gate!');
eq('D44 text (R3)', line('D44'), 'Take the hot metal to the anvil.');
eq('D47 text (R3)', line('D47'), 'Dip the blade in the bucket to finish crafting.');
eq('D39 and D40 are gone (R3: heat no longer sets the speed)', /\n\s*D39: "/.test(src) || /\n\s*D40: "/.test(src) || /'D39'|'D40'/.test(src), false);
eq('ground manganese in: D38, then the bellows (no lock)', src.includes("TUT_STAGE='regrind-heat'; tutArrow(null,null);   /* R3: no heat lesson - D38, then the bellows */")
  && !src.includes('TUT_BELLOWS_LOCK'), true);
eq('TC2 pumps with the bellows lit, then the shared pointer', src.includes("if(TUT_STAGE==='regrind-heat'){ tutArrow(null, '#bellowtop', { tfx:0.44, tfy:0.42, ox:78, oy:-116, bow:0.18, back:20 }); return; }")
  && src.includes("if(TUT_STAGE==='regrind-work'){ tutLoopPointer(); return; }"), true);
eq('on Balanced: D41 (the gate)', /function tutGateStep\(\)\{[\s\S]{0,200}TUT_STAGE='regrind-work'; tutArrow\(null,null\);\s*if\(SAY_SEQ\.indexOf\('D41'\)<0\)/.test(src), true);
eq('recorded and the panel shut: D44, the hot metal to the anvil (a glow on it if it is there already)', /function tutHudClosed\(\)\{[\s\S]{0,400}say\('D44'\);[\s\S]{0,80}if\(melt && melt\.stage==='onAnvil'\) tutGlow\('#orb', true\); else tutArrow\('#orb', '#stAnvil \.anvil'/.test(src), true);
/* found in R3/R4's browser checks: since r286 the trait window closes the dragon's line, and the lines said in the same beat
   (D42, D76, D99, D106) were closed at once. Now a line said by the gate's hooks is said again when the window closes. */
eq('a line said as the trait window opens comes back when it closes', /smGateFx\(\); setTimeout\(\(\)=>\{ const sayWas=SAY_ON; updateSfTraits\(\);[\s\S]{0,900}const sayNew=\(SAY_ON && SAY_ON!==sayWas\) \? SAY_ON : null;[\s\S]{0,200}if\(firstFind\)\{ showAcquire\(bt,tier,melt\.traits\.length,true\); TUT_ACQ_LINE=sayNew; \}/.test(src)
  && src.includes("function closeAcquire(){ document.getElementById('sfAcquireModal').classList.remove('show'); tutShapeStep(); tutAcqLineBack(); }")
  && src.includes("function tutAcqLineBack(){ const id=TUT_ACQ_LINE; TUT_ACQ_LINE=null; if(!id || SAY_ON) return; SAY_I=SAY_SEQ.indexOf(id); say(id); }")
  && /function tutRecordStep\(\)\{\s*if\(TUT_STAGE!=='regrind-work'\) return;\s*TUT_STAGE='record';\s*if\(SAY_SEQ\.indexOf\('D42'\)<0\) SAY_SEQ\.push\('D42'\);\s*SAY_I=SAY_SEQ\.indexOf\('D42'\); say\('D42'\);\s*\}/.test(src) && !src.includes('TUT_D42_WAIT'), true);
eq('D44 and D77 go, and the arrow to the anvil, when the metal is on the anvil (the shape window opens)', /function openShapeSelect\(\)\{[\s\S]{0,700}if\(SAY_ON==='D44' \|\| SAY_ON==='D77'\) sayHide\(\); if\(TUT_ARROW && TUT_ARROW\.from==='#orb'\) tutArrow\(null,null\);/.test(src), true);
eq('the minigame\'s lines go when the blade comes out onto the anvil (R4)', /function smShaped\(\)\{[\s\S]{0,600}if\(\['D45','D46','D78'\]\.includes\(SAY_ON\)\) sayHide\(\);/.test(src), true);
eq('the minigame speaks D46 only; D47 comes with the blade on the anvil', src.includes("const id='D46';   /* R3: D47 is the dip's, on the anvil */")
  && /function smShaped\(\)\{[\s\S]{0,700}if\(TUT_STAGE==='forge2'\) tutDipStep\('D47'\); else if\(!TUT_SAIDMUG\) tutMugStep\(\); else if\(!tutOver\(\) && !TUT_SOLO\)\{ TUT_DIP=true; TUT_DIP_LINE=null; tutDipArrow\(\); \}/.test(src), true);   /* R7: not in Garric's solo run */

/* R4 (2026-10-23): TC3's fire run in the smelter loop - the metal stays in the smelter, the next ore goes straight in */
eq('D69 text (R4)', line('D69'), 'Now pump the bellows.');
eq('D71 text (R4)', line('D71'), "We need to go further. Let's add one more ore.");
eq('D74 text (R4)', line('D74'), 'Pump the bellows.');
eq('D75 text (R4)', line('D75'), 'Open the gate! I hope this is the fire trait!');
eq('D77 text (R4)', line('D77'), 'Take it to the anvil.');
eq('the route end is read while the metal is in the smelter', src.includes("function tutAtRouteEnd(){ return !!melt && melt.stage==='smelting' && swordAtRouteEnd(); }")
  && /function tutFireSpot\(\)\{[\s\S]{0,120}if\(!melt \|\| melt\.stage!=='smelting' \|\| !swordAtRouteEnd\(\)\) return;/.test(src), true);
eq('the travel hooks run as the bellows move the sword (the hammer branch that called them is gone)', /function smGlide\(dt\)\{[\s\S]{0,500}tutPumpBeat\(d\); tutTravelHooks\(\);/.test(src)
  && src.includes('function tutTravelHooks(){ tutFireSpot(); tutFireSeen(); tutFireReached(); tutDay2Pull(); tutGaleEnd(); }'), true);   /* R24: tutFireSeen */
eq('D71 is read before D72: no carry back, the next ore once it is closed', !/function tutFireBack\(\)\{[^}]*tutArrow\('#orb'/.test(src)
  && src.includes("if(TUT_STAGE==='fire-reheat' && melt && melt.stage==='smelting' && SAY_ON!=='D71') tutFireReheated();"), true);
eq('Fire reached: D75 and the gate, at the route end (FTUE.fireAt: it ends on Fire, Fine; at the first touch it was Weak)', /function tutFireReached\(\)\{[\s\S]{0,250}if\(!swordAtRouteEnd\(\)\) return;[\s\S]{0,300}say\('D75'\);\s*tutGatePointer\(\);/.test(src), true);
eq('Fire taken: D76, D77 and the metal to the anvil', /function tutFireGot\(\)\{[\s\S]{0,300}say\('D76'\);\s*setTimeout\(\(\)=>tutArrow\('#orb', '#stAnvil \.anvil'/.test(src), true);
eq('both heat runs point with the shared pointer, the gate only on Fire at the route end (R24: none over D70 / D70a)', src.includes("if(TUT_STAGE==='fire-heat1' || TUT_STAGE==='fire-heat2'){ if(SAY_ON==='D70' || SAY_ON==='D70a'){ tutArrow(null,null); return; } tutLoopPointer('fire', true); return; }")
  && src.includes("if(gateReady && (!want || (melt.reachedTrait && melt.reachedTrait.trait.id===want)) && (!atEnd || swordAtRouteEnd())) tutArrow(null, '#furnaceGate'")
  && /const TUT_TICK_STAGES=\[[^\]]*'fire-heat2'/.test(src), true);

/* R5 (2026-10-23): GC4 and TC4's Durable crafts, and the ladle lessons (TC4's D97, TC5's D97a) */
eq('D97 text (R5)', line('D97'), "Tilt the ladle beside the smelter. It slowly pulls the sword icon to the centre of the map. Line the sword up with a trait's centre to get an epic tier every time!");
eq('the Durable heat run: the shared pointer on Durable; TC4 at the route end: the ladle lesson', src.includes("if(TUT_STAGE==='p3-dur-heat'){ if(FTUE_ST.part===4 && melt && melt.stage==='smelting' && swordAtRouteEnd()){ tutTc4Pull(); return; } tutLoopPointer('durable'); return; }"), true);
eq('D97 points at the ladle, not the dragon', /function tutTc4Pull\(\)\{[\s\S]{0,300}sayQueue\('D97'\);[\s\S]{0,120}tutArrow\(null, '#ladleHead'/.test(src) && !/function tutTc4Pull\(\)\{[\s\S]{0,400}'#dragon'/.test(src), true);
eq('D97a too (TC5\'s swift reminder), read while the metal is in the smelter', /function tutDay2Pull\(\)\{[\s\S]{0,120}if\(!melt \|\| melt\.stage!=='smelting' \|\| !swordAtRouteEnd\(\)\) return;[\s\S]{0,300}tutArrow\(null, '#ladleHead'/.test(src) && !/function tutDay2Pull\(\)\{[\s\S]{0,500}'#dragon'/.test(src), true);
eq('the ladle parks the sword on the lesson\'s trait (the clamp the dragon\'s fire had), then stops', /function smLadleTick\(dt\)\{[\s\S]{0,300}if\(TUT_SWIFT_LOCK\) return;[\s\S]{0,700}const want=tutPullTarget\(\), tg=want && traits\.find\(t=>t\.trait && t\.trait\.id===want\);[\s\S]{0,300}TUT_SWIFT_LOCK=true; setTimeout\(want==='swift' \? tutSwiftAligned : want==='durable' \? tutDurableAligned : tutGaleAligned, 0\);/.test(src), true);
eq('parked on the trait: D98 and the gate (was the mug)', ['tutDurableAligned', 'tutSwiftAligned', 'tutGaleAligned'].every(f => new RegExp('function ' + f + '\\(\\)\\{[\\s\\S]{0,300}sayQueue\\(\'D98\'\\);[^\\n]*\\n\\s*setTimeout\\(tutGatePointer, 0\\);').test(src)), true);

/* R6 (2026-10-23): TC5's swift and gale runs and GC8's Weak sword in the smelter loop */
eq('D96 text (R6)', line('D96'), 'Pump the bellows.');
eq('D102 text (R6)', line('D102'), 'Use the bellows to travel along the path on the map.');
eq('D103 text (R6)', line('D103'), 'Add one more ground copper.');
eq('D105 text (R6)', line('D105'), 'Pump the bellows.');
eq('D106 text (R6)', line('D106'), 'Amazing, you got it! We got it! Take it to the anvil.');
eq('each "pump" line lights the bellows', /function tutDay2Smelted\(\)\{[\s\S]{0,200}sayQueue\('D96'\); tutArrow\(null, '#bellowtop'/.test(src)
  && src.includes("TUT_STAGE='d2-gale-hammer'; sayQueue('D102'); tutArrow(null, '#bellowtop'") && /TUT_STAGE='d2-gale-work';[\s\S]{0,200}sayQueue\('D105'\); tutArrow\(null, '#bellowtop'/.test(src), true);
eq('the gale route\'s end: read while smelting, one more copper to the grindstone (no carry back)', /function tutGaleEnd\(\)\{[\s\S]{0,120}if\(!melt \|\| melt\.stage!=='smelting' \|\| !swordAtRouteEnd\(\)\) return;[\s\S]{0,200}sayQueue\('D103'\);\s*setTimeout\(\(\)=>tutWheelArrow\('Copper'\), 0\);/.test(src)
  && !src.includes("if(TUT_STAGE==='d2-gale2' && melt && melt.stage==='smelting' && TUT_ARROW) tutArrow(null,null);"), true);
eq('Gale taken: D106 and the metal to the anvil', /function tutGaleGot\(\)\{[\s\S]{0,300}sayQueue\('D106'\);\s*setTimeout\(\(\)=>tutArrow\('#orb', '#stAnvil \.anvil'/.test(src), true);
eq('GC8: the bellows while it travels; parked in the Weak band, D107b and the gate', src.includes("if(TUT_STAGE==='p4-weak-heat'){ if(melt && melt.stage==='smelting') tutArrow(null, '#bellowtop', { tfx:0.44, tfy:0.42, ox:78, oy:-116, bow:0.18, back:20 }); return; }")
  && /function tutWeakStop\(\)\{[\s\S]{0,1200}sayQueue\('D107b'\); setTimeout\(tutGatePointer, 0\);/.test(src), true);
eq('no hammer to send home, no mug pointer left', !/homeHammer\(\)/.test(src.replace(/function homeHammer\(\)\{/, '')) && !/tutMugPointer/.test(src), true);

/* R7 (2026-10-23): parts 5-6 - Bram's stored swift metal comes back at the gate; Garric's solo run gets no dip arrow */
/* R18 (owner, 2026-10-27): R7 sent a stored ingot to the gate, hot, though it is dropped on the anvil - it lands on the anvil now */
eq('a stored ingot dropped on the anvil lands on the anvil (the anvil opens the shaping)', /function restoreIngot\(id\)\{[\s\S]{0,1800}orbEl\.style\.display='block'; placeOnAnvil\(\);/.test(src)
  && !/function restoreIngot\(id\)\{[^]*?\n\}/.exec(src)[0].includes('snapToGate') && !src.includes("if(melt.stage==='onAnvil') melt.stage='hot';"), true);
eq('its heat is the heat it was stored with', /function restoreIngot\(id\)\{[\s\S]{0,1300}melt=\{ heat:g\.heat,/.test(src), true);
eq('the bag keeps an ingot\'s heat: no cooling while it waits', src.includes('const STASH_COOL = 0;'), true);
eq('storing says so', src.includes("hint('Ingot stored. It keeps its ores, its route, its traits and its heat.');"), true);
eq('Bram\'s metal on the anvil: D113 goes, no D44 or arrow (the shape window opens)', /function tutBram2Restored\(\)\{\s*if\(TUT_STAGE!=='bram2-ingot'\) return;\s*TUT_STAGE='bram2-shape'; tutArrow\(null,null\); FTUE_ST\.swiftFree=true;[^\n]*\n\s*if\(SAY_ON==='D113'\) sayHide\(\);[^\n]*\n\}/.test(src), true);
eq('(R7, replaced by R18) no stored ingot comes back at the gate', /function restoreIngot\(id\)\{[\s\S]{0,1200}if\(melt\.stage==='onAnvil'\) melt\.stage='hot';[\s\S]{0,400}orbEl\.style\.display='block'; updateOrbLook\(\); snapToGate\(\);/.test(src), false);
eq('(R7, replaced by R18) no D44 and arrow for Bram\'s metal', /function tutBram2Restored\(\)\{[\s\S]{0,300}sayQueue\('D44'\);/.test(src), false);

/* R8 (2026-10-23): no gate-on-heat left */
eq('markGateReady (the gate on heat) is gone', src.includes('markGateReady'), false);

/* R11 (owner, 2026-10-23): the craft lock follows what the tutorial asks for - TC5 orders Gale, its first step asks for Swift */
eq('TC5\'s swift run: the tutorial\'s trait is Swift', src.includes("const TUT_SWIFT_STAGES=['d2-copper','d2-hammer','d2-pull','d2-quench'];")
  && src.includes("function ftueTutTrait(){ return TUT_SWIFT_STAGES.indexOf(TUT_STAGE)>=0 ? 'swift' : null; }"), true);
eq('the gate takes the tutorial\'s trait as well as the order\'s', /function ftuePourOk\(\)\{[^\n]*\n\s*if\(ftueTutTrait\(\)===melt\.reachedTrait\.trait\.id \|\| ftueOrderTraitOk\(o, melt\.reachedTrait\.trait\.id\)\) return true;/.test(src), true);
eq('Swift taken before or after the ladle: D99 and the store', /function tutSwiftGot\(\)\{\s*if\(TUT_SWIFT_STAGES\.indexOf\(TUT_STAGE\)<0\) return;[^\n]*\n\s*TUT_STAGE='d2-store'; TUT_SWIFT_LOCK=false;/.test(src), true);

/* R12 (owner, 2026-10-26): the trait window only for a first discovery; no craft-book toast for the first four swords (Part 1) */
eq('the craft-book toast is quiet through Part 1 (Bram\'s sword and GC1-GC3)', FTUE.bookToastQuietPart, 1);
eq('ftueBookToastQuiet reads it (free play and a finished FTUE keep the toast)',
  src.includes('function ftueBookToastQuiet(){ return !SM_FREE && !FTUE_ST.done && FTUE_ST.part<=FTUE.bookToastQuietPart; }'), true);
eq('the gate toasts a new page only when not quiet', src.includes("if(isNew && !ftueBookToastQuiet()) setTimeout(()=>toast('&#128214; <b>'+bt.name+'</b> recorded in the craft book'), 900);"), true);
eq('the trait window opens on a first discovery only; a re-take goes straight on', src.includes('if(firstFind){ showAcquire(bt,tier,melt.traits.length,true); TUT_ACQ_LINE=sayNew; } else tutShapeStep();'), true);
/* R13 (owner, 2026-10-26): a blueprint the dragon buys for the open order cannot be bought by the player */
eq('ftueDragonPays: the open order\'s blueprint, when the dragon buys it',
  src.includes("function ftueDragonPays(k, sh){ const m=FTUE_MK; return !!(m && m.o.market && m.o.market.by==='dragon' && m.o.trait===k && m.o.shape===sh); }"), true);
eq('the shape window shows no BUY on it', src.includes("const open=ftueShapeOpen(k, sh), gift=!open && ftueDragonPays(k, sh), b=document.createElement('button');")
  && src.includes("<span>'+sh+'</span>'+(open || gift ? '' : '<b class=\"sf-buy'"), true);
eq('a tap on it buys nothing (the shape window)', /function shapeBuy\(k, sh\)\{[^\n]*\n\s*if\(ftueDragonPays\(k, sh\)\) return;/.test(src), true);
eq('a tap on it buys nothing (the market)', /function marketBuy\(k, sh\)\{\s*const st=[^\n]*\n\s*if\(\(FTUE_MK && FTUE_MK\.step==='gift'\) \|\| ftueDragonPays\(k, sh\)\) return;/.test(src), true);
eq('the market shows it locked, with no price', src.includes("const gift=st!=='owned' && st!=='free' && ftueDragonPays(k, sh);")
  && src.includes("b.className='mk-cell '+(gift ? 'closed gift' : st);") && src.includes("b.innerHTML = gift ? '\\u{1F512}' : st==='free'"), true);
eq('six orders are the dragon\'s', [1, 3, 5].flatMap(p => FTUE.parts[p].gpc).concat([FTUE.bramBlueprint]).filter(o => o.market && o.market.by === 'dragon')
  .map(o => o.trait + ':' + o.shape), ['balanced:Longsword', 'balanced:Broadsword', 'fire:Longsword', 'fire:Broadsword', 'gale:Longsword', 'swift:Dagger']);

/* R14 (owner, 2026-10-26): D28l and the refill appeared after the TC5 gale sale, while the customer stayed to say thanks - his
   order still read as open, with no gale sword and a short bag. A customer who has paid has no open order. */
eq('a scripted sale that keeps the customer marks the customer paid', src.includes('COUNTER=null; if(!scriptedBye) CUSTOMER=null; else if(CUSTOMER) CUSTOMER.paid=true;'), true);
eq('a paid customer has no open order (no refill, no craft lock)', /function ftueOrderOpen\(\)\{ if\(FTUE_ST\.done\) return null;\s*const c=CUSTOMER;\s*if\(c\)\{ if\(c\.paid\) return null;/.test(src), true);

/* R15 (owner, 2026-10-26): "show up arrow guide on the ladle, and up and down arrow on the bellows" - the drag gestures */
{ const t = src.match(/const TUT_DRAG_GESTURE=(\{[^\n]*\});/);
  eq('the gesture table: the ladle tilts up, the bellows pump up and down', t && new Function('return ' + t[1])(),
    { '#ladleHead': { kind: 'up', fx: 0.25, fy: 0.1 }, '#bellowtop': { kind: 'updown', fx: 0.6, fy: 0.2 }, '#hudToggle': { kind: 'down', fx: 0.5, fy: 0.75 } }); }   /* R28: the ring pulls down */
eq('the gesture overlay is in the frame, with an up head and a down head', /<svg id="tutDrag" viewBox="0 0 40 64" aria-hidden="true">[\s\S]{0,400}class="g-up"[\s\S]{0,200}class="g-down"[\s\S]{0,80}<\/svg>/.test(src), true);
eq('every tutorial tap pointer sets or clears it (so every pointer change does)', /function tutTap\(sel\)\{\s*tutExit\(null\); tutDragOn\(sel\);/.test(src), true);
eq('it follows the layout every frame (hidden while its target is not on screen)', src.includes('tutSpinOn(null);   /* r229: every frame') && /tutSpinOn\(null\);   \/\* r229: every frame[^\n]*\n\s*tutDragDraw\(\);/.test(src), true);
eq('only on the forge screen (its props stay laid out under the others)', /function tutDragDraw\(\)\{[^\n]*\n\s*const g=TUT_DRAG && TUT_DRAG_GESTURE\[TUT_DRAG\], box=g && SF_SCREEN==='forge' && tutRect\(TUT_DRAG\);/.test(src), true);
eq('the up arrow slides up; the up-and-down arrow bobs', src.includes('#tutDrag.up { animation: tutDragUp') && src.includes('#tutDrag.updown { animation: tutDragBob')
  && src.includes('#tutDrag .g-down { display: none; } #tutDrag.updown .g-down { display: inline; }'), true);

/* R16 (owner, 2026-10-27): D13 in the first minigame - darken everything except the dragon and the line */
eq('the minigame lines read on a dark scene', src.includes("const HM_SAY_DARK=['D13'];"), true);
eq('the dim is in the hammer window (the dragon is inside its stacking context), the #tutHole look',
  /<div id="sfHammerModal" class="sf-modal hm-modal">\s*<div id="hmDim"><\/div>/.test(src)
  && src.includes('#hmDim { position: absolute; inset: 0; z-index: 10; background: rgba(6,4,2,.74); display: none; }'), true);
eq('on: the dim shows and the dragon rises over it (the line, #dragonSay z1100, is over the window already)',
  src.includes('#sfHammerModal.hm-dark #hmDim { display: block; } #sfHammerModal.hm-dark #hmDragon { z-index: 11; }'), true);
eq('it follows the line: on while one of them is up in the open minigame',
  src.includes("function hmDarkSync(){ const m=document.getElementById('sfHammerModal'); if(m) m.classList.toggle('hm-dark', m.classList.contains('show') && HM_SAY_DARK.includes(SAY_ON)); }"), true);
eq('synced every frame and as the line is said', /tutDarkSync\(\);[^\n]*\n\s*hmDarkSync\(\);/.test(src) && /function say\(id\)\{[\s\S]{0,900}hmDarkSync\(\);/.test(src), true);

/* R21 (owner, 2026-10-28): an ore on the grindstone goes back to the inventory (r101 had it committed); no ores during D72/D72a */
eq('the ore comes back whole (raw), the orb and its preview go, the Ingredients tab shows it',
  src.includes("function unprepOre(){ if(!prep) return false; gainOre(prep.ore,1); prep=null; hidePreviewPaths(); orbEl.style.display='none'; oreImgEl.style.opacity=1; sphereEl.style.opacity=0; invTab(0); return true; }"), true);
eq('dropped on the inventory: a metal is stored, an ore on the grindstone goes back', src.includes("if(e && moved && overRail(e) && (stashIngot() || unprepOre())) return;"), true);
eq('no ore pickup while D72 or D72a compares the paths', src.includes("function tutOresHeld(){ return TUT_STAGE==='fire-mang' && (SAY_ON==='D72' || SAY_ON==='D72a'); }")
  && /function startOreDrag\(oreId,e\)\{ if\(tutOresHeld\(\)\) return;/.test(src), true);

/* R23 (owner, 2026-10-28): Day 3 - no gathering until the pickaxe skill is upgraded */
eq('the Day 3 morning stages that hold the pickaxe', src.includes("const DAY3_HOLD=['d2-d3cave','d2-morning','d2-skill'];"), true);
eq('held until the pickaxe point is spent', src.includes("function tutGatherHeld(){ return !FTUE_ST.done && FTUE_ST.part===6 && DAY3_HOLD.includes(TUT_STAGE) && !TUT_D2_SPENT; }"), true);
eq('the pickaxe does not swing at a seam, and says why (at most every 2.5 s)', /function pickCheck\(\)\{\s*if\(SF_SCREEN!=='cave' \|\| !PICK_OUT\)\{ stopStriking\(\); return; \}\s*if\(tutGatherHeld\(\)\)\{ stopStriking\(\); if\(pickSeam\(\) && performance\.now\(\)-GATHER_NOTE>2500\)\{ GATHER_NOTE=performance\.now\(\); toast\('Upgrade the <b>Pickaxe<\/b> in the skill tree first'\); \} return; \}/.test(src), true);
eq('and no seam gives ore', /function mineNode\(n,el\)\{\s*if\(!PICK_OUT \|\| n\.left<=0 \|\| tutGatherHeld\(\)\) return;/.test(src), true);

/* v3 part 1 lines (D8, D17) */
const V3P1 = {
  D28b: "A balanced Longsword? We need its blueprint. Craft the sword, and I'll buy the shape for you when you pick it.",   /* r300 */
  D28c: 'Here it is. Watch this!',
  D28d: 'There, my treat! Now pick the Longsword.',   /* r300 */
  D28e: "A Broadsword this time. I'll pay for the shape again.",   /* r300 */
  D28f: 'Done! Pick the Broadsword.',   /* r300 */
  D28g: "I helped you a bit. Now you buy your own stuff. I'll buy for you when I feel like it. Humph!",
  D28h: "Oh, you don't have enough. Don't worry, I'll help.",
  D28i: 'Your first blueprint! Now pick the Katana.' };   /* r300 */
for (const [k, v] of Object.entries(V3P1)) eq(k + ' text', line(k), v);
/* every script block must parse: a text check cannot see a broken quote (v3 part 2 shipped one, caught here) */
[...src.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((m, i) => { let ok = true; try { new Function(m[1]); } catch (e) { ok = e.message; } eq('script block ' + i + ' parses', ok, true); });
const keyList = [...src.matchAll(/\n\s*(D\d+[a-z]?): "/g)].map(x => x[1]);
for (const [k, prev] of [['D28c','D28b'],['D28d','D28c'],['D28e','D28d'],['D28f','D28e'],['D28g','D28f'],['D28h','D28g'],['D28i','D28h']])
  eq(k + ' follows ' + prev, keyList[keyList.indexOf(k) - 1], prev);
eq('Bram: no reward window, straight to the quest list',
  /function ftueAfterBram\(\)\{[\s\S]{0,300}TUT_STAGE='p1-quest'/.test(src) && !/function ftueAfterBram\(\)\{[^}]*ftueReward\(/.test(src), true);
eq('a market order waits for the shape window (r300), MARKET still appears', src.includes("if(o.market){ FTUE_ST.market=true; marketBtnUi(); FTUE_MK={ o:o, step:'shape' }; }"), true);
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
  D92j: 'Remember how to buy the blueprint? Buy the fire Katana when you pick the shape!' };   /* r300 */
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
  D97a: 'Remember? Tilt the ladle to pull the sword onto the trait.',   /* R5 */
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
eq('the trait is gained at once; the hooks, the window and the toast wait for the effect (R0: the gate\'s embers, not the mug\'s mist)', /melt\.traits\.push[\s\S]{0,1500}smGateFx\(\); setTimeout\(\(\)=>\{ const sayWas=SAY_ON; updateSfTraits\(\); tutAcquired\(\);[\s\S]{0,900}showAcquire\(bt,tier,melt\.traits\.length,true\);/.test(src), true);
/* r301 (owner, 2026-10-21): the first sword's Shortsword blinks; a BUY the gold cannot cover is greyed; in the tutorial only the
   ordered (or waiting) blueprint can be bought - anything else gets D28m, in the shape window and the market */
eq('D28m text, beside D28l', line('D28m') === "Let's buy those later. Focus on the customer's request." && keyList[keyList.indexOf('D28m') - 1] === 'D28l', true);
eq('the first sword\'s shape window blinks the Shortsword', /function openShapeSelect\(\)\{[\s\S]{0,1400}if\(TUT_HM_FIRST\) setTimeout\(\(\)=>tutExit\("#sfShapeModal \.sf-shape\[data-shape='Shortsword'\]"\), 0\);/.test(src), true);
eq('a BUY the gold cannot cover is greyed', src.includes("'<b class=\"sf-buy'+(GOLD<marketPrice(k, sh) ? ' poor' : '')+'\">BUY '+marketPrice(k, sh)+'g</b>'") && src.includes('.sf-shape .sf-buy.poor {'), true);
{ const fn = name => { const i = src.indexOf('function ' + name + '('); if (i < 0) return ''; let d = 0, j = src.indexOf('{', i);
    for (; j < src.length; j++) { if (src[j] === '{') d++; else if (src[j] === '}' && --d === 0) break; } return src.slice(i, j + 1); };
  const mk = (order, waiting, done) => new Function('FTUE_ST', 'ftueOrderOpen', fn('ftueBlueprintOk') + '; return ftueBlueprintOk;')({ done: !!done, waiting: waiting || [] }, () => order);
  eq('only the order\'s blueprint', [mk({ trait: 'balanced', shape: 'Katana' })('balanced', 'Katana'), mk({ trait: 'balanced', shape: 'Katana' })('balanced', 'Dagger'), mk({ trait: 'balanced', shape: 'Katana' })('fire', 'Katana')], [true, false, false]);
  eq('an order with no shape: its trait\'s blueprints', [mk({ trait: 'durable', shape: null })('durable', 'Longsword'), mk({ trait: 'durable', shape: null })('fire', 'Longsword')], [true, false]);
  eq('a waiting customer\'s blueprints too (GC9)', mk(null, [{ items: [{ trait: 'gale', shape: 'Katana' }, { trait: 'fire', shape: 'Claymore' }] }])('fire', 'Claymore'), true);
  eq('no order, nothing waiting: nothing', mk(null, [])('balanced', 'Longsword'), false);
  eq('after the tutorial: anything', mk(null, [], true)('balanced', 'Longsword'), true); }
eq('the shape window refuses it with D28m', /function shapeBuy\(k, sh\)\{[\s\S]{0,300}if\(!ftueBlueprintOk\(k, sh\)\)\{ ftueSaySh\('D28m'\); return; \}/.test(src), true);
eq('so does the market', /function marketBuy\(k, sh\)\{[\s\S]{0,700}if\(st==='buy' && !ftueBlueprintOk\(k, sh\)\)\{ sayOver\('D28m'\); return; \}/.test(src), true);
/* r300 (owner, 2026-10-21): the tutorial buys at the shape window - no market trip */
eq('an order line has a lit OK again, and closing the order\'s last line starts the craft guide', ['D28b','D28e','D28g','D92a','D92i','D92j','D111b','D113a'].every(k => new RegExp('const SAY_GO_MORE=\\{[^}]*\\b' + k + ':1').test(src) && new RegExp('const SAY_GO_GLOW=\\{[^}]*\\b' + k + ':1').test(src))
  && src.includes("if(o.market) SAY_THEN={ id:lines[lines.length-1], fn:()=>ftueOrderGo(o) };") && /function sayHide\(\)\{[\s\S]{0,1600}if\(SAY_THEN && SAY_ON===SAY_THEN\.id\)\{ const f=SAY_THEN\.fn; SAY_THEN=null; setTimeout\(f, 0\); \}/.test(src), true);
eq('the craft guide is the old market ending without the market', src.includes("function ftueOrderGo(o){ if(FTUE_ST.part===1) ftueGcCraftGo(); if(o.guide) ftueBookGo(o); }"), true);
eq('the shape window runs the purchase for the order\'s trait', /function openShapeSelect\(\)\{[\s\S]{0,1300}ftueShapeOpened\(\);/.test(src) && /function ftueShapeOpened\(\)\{[\s\S]{0,300}if\(k!==o\.trait\) return;/.test(src), true);
eq('the dragon pays: D28c, coins to the shape, unlocked, then the done line and the shape', /function ftueShapeOpened\(\)\{[\s\S]{0,900}ftueSaySh\(FTUE\.marketWatch\);[\s\S]{0,400}coinFly\(dragonEl\(\), [\s\S]{0,200}FTUE_ST\.shapes\[key\]=true; shapeGrid\(\);[\s\S]{0,200}ftueShapeDone\(m\);/.test(src), true);
eq('the player buys: BUY pointed at; short of gold, D28h and the top-up first', /function ftueShapeOpened\(\)\{[\s\S]{0,2000}m\.step='buy';[\s\S]{0,300}ftueSaySh\(FTUE\.marketShort\);/.test(src) && /function shapeBuy\(k, sh\)\{[\s\S]{0,900}ftueShapeBought\(k, sh\);/.test(src), true);
eq('a purchase ends the lesson and points at the shape', /function ftueShapeDone\(m\)\{ FTUE_MK=null;[\s\S]{0,400}tutExit\(/.test(src), true);
eq('a market purchase of the ordered blueprint also ends it, with no second craft guide', /function ftueMarketBought\(k, sh\)\{[\s\S]{0,200}FTUE_MK=null;/.test(src), true);
eq('the shape window\'s lines go when the shape is picked', src.includes("function ftueFocusDone(){ if(SAY_ON==='D28k' || (FTUE_SHAPE_LINE && SAY_ON===FTUE_SHAPE_LINE)) sayHide(); }"), true);
eq('Bram\'s Dagger: D111b runs into D48, no market', /function tutBram2Illus\(\)\{[\s\S]{0,600}FTUE_MK=\{ o:b, step:'shape' \};[\s\S]{0,200}sayQueue\(b\.market\.ask, 'D48'\);/.test(src), true);
eq('a line over a window clears the shape window too (z 1010)', src.includes('.say-over-modal { z-index: 1011 !important; }'), true);
/* r298 (owner, 2026-10-21): the first sword goes on the counter only once the tutorial asks (D23) */
eq('D23 opens the counter for the first sword', /function bramGiveStep\(\)\{ TUT_BRAM_GIVE_OK=true; say\('D23'\);/.test(src), true);
eq('until then a drop on the counter is refused and the sword stays in the bag', src.includes("function counterShut(){ return SF_SCREEN==='customer' && !FTUE_ST.done && FTUE_ST.part===1 && !TUT_BRAM_SOLD && !TUT_BRAM_GIVE_OK; }")
  && src.includes("else if(overTable(ev)){ if(counterShut()){ toast('Not yet. The dragon will tell you when.'); return; } take(); zonePlace(w); } };"), true);
eq('a new game shuts it again', /function tutReset\(\)\{[\s\S]{0,300}TUT_BRAM_GIVE_OK=false;/.test(src), true);
/* r297 (owner, 2026-10-21): Day 2 morning - D89's OK is lit first; only after it (D92) does the arrow to the counter blink */
eq('the morning no longer blinks the arrow with D89', /function tutDay2Morning\(\)\{[\s\S]{0,700}TUT_STAGE='d2-counter'; tutExit\(null\);\s*sayQueue\('D89','D92'\);[^\n]*\n\s*\}/.test(src), true);
/* R20 (owner, 2026-10-28): the way to the counter lights after D92 (its OK), not as D92 comes up after D89 */
eq('D92\'s close lights the way to the counter', /D92:function\(\)\{ if\(TUT_STAGE==='d2-counter'\) tutExit\('#panLeft'\); \},/.test(src), true);
eq('not as D92 is said', src.includes("if(id==='D92' && TUT_STAGE==='d2-counter')"), false);
eq('the cave path waits for D92 too', /TUT_STAGE='d2-counter';[^\n]*\n[^\n]*\n\s*sayQueue\('D92'\);[^\n]*\n\}/.test(src), true);
eq('D89\'s OK is lit', /const SAY_GO_GLOW=\{[^}]*D89:1/.test(src), true);
/* r293 (owner, 2026-10-21): the refill - when the bag can no longer make the open order (nothing on the bench, no ingot,
   the order not made), the dragon gives what is missing with D28l over the reward window */
eq('D28l text, beside D28k', line('D28l') === 'Careful! Here, try again.' && keyList[keyList.indexOf('D28l') - 1] === 'D28k', true);
{ const fn = name => { const i = src.indexOf('function ' + name + '('); if (i < 0) return ''; let d = 0, j = src.indexOf('{', i);
    for (; j < src.length; j++) { if (src[j] === '{') d++; else if (src[j] === '}' && --d === 0) break; } return src.slice(i, j + 1); };
  const L = new Function(fn('ftueShortfall') + '; return { ftueShortfall };')();
  eq('shortfall: what the bag lacks of the round', L.ftueShortfall({ iron: 2, manganese: 2 }, { iron: 1, manganese: 2, copper: 9 }), { iron: 1 });
  eq('shortfall: nothing when the bag covers it', L.ftueShortfall({ nickel: 2 }, { nickel: 3 }), {});
  eq('shortfall: no round, nothing', L.ftueShortfall(null, {}), {}); }
eq('the refill runs every frame', /if\(tutTicks\(\)\) tutNudge\(\);[^\n]*\n\s*ftueRefillTick\(\);/.test(src), true);
eq('only for an open order not yet made, the bench empty, no window, no pause, no stored ingot that can finish it; GC9 waiting is not covered', /function ftueRefillTick\(\)\{[\s\S]{0,900}benchBusy\(\)[\s\S]{0,300}\.sf-modal\.show[\s\S]{0,500}INV\.ingots\.some[\s\S]{0,300}ftueCraftLocked\(\)/.test(src), true);
/* r295 (owner, 2026-10-21): "Careful! Here, try again." came up when the first sword was put on Bram's counter - the bag was
   empty, so the first sword looked unmade. Now a sword on the counter or the table stops the refill, and the first sword is
   an open order only on its own craft steps */
eq('a sword on the counter or the table is a made sword', /function ftueRefillTick\(\)\{[\s\S]{0,300}if\(COUNTER \|\| WORK\) return;/.test(src), true);
eq('the first sword is open only on its craft steps, with the starting bag as its round', src.includes("const FIRST_SWORD_STAGES={ ore:1, bellows:1, anvil:1, strike:1, travel:1, quench:1, acquired:1, shape:1, forge:1 };   /* R8: no gate or hammer step since R1 */")
  && /function ftueRefillTick\(\)\{[\s\S]{0,900}const first=\(!CUSTOMER && FTUE_ST\.part===1 && !!FIRST_SWORD_STAGES\[TUT_STAGE\] && !INV\.swords\.length\)[\s\S]{0,500}const need=first \? FTUE\.oreStart : FTUE_ST\.oreRound;/.test(src), true);
eq('after the refill the guided craft goes back to its first step', (() => { const m = src.match(/const CRAFT_REWIND=(\{[^}]*\});/); return m && new Function('return ' + m[1])(); })(),
  { bellows: 'first', anvil: 'first', strike: 'first', travel: 'first', quench: 'first', acquired: 'first', shape: 'first',
    'p1-craft-heat': 'p1-craft-ore', 'p1-craft-shape': 'p1-craft-ore', 'p3-dur-heat': 'p3-dur-grind', 'p4-pull': 'p3-dur-grind', 'p4-quench': 'p3-dur-grind',
    'p4-weak-heat': 'p4-weak-grind', 'p4-weak-quench': 'p4-weak-grind' });
eq('the first sword starts again at D3 (its ore step)', /function ftueCraftRewind\(\)\{[\s\S]{0,300}if\(to==='first'\)\{ TUT_STAGE=null; tutPause\(false\); tutArrow\(null,null\); tutUnglow\(\); sayQueue\('D3'\); return; \}/.test(src)
  && src.includes("ftueOreWindow(miss, { say:'D28l' }, ftueCraftRewind);"), true);
eq('a sword with no reward row ends the round (TC2, TC3, GC8, Garric)', /function ftueOreReward\(key, then\)\{ const e=key && FTUE\.oreChain\[key\]; if\(!e\)\{ if\(key\) FTUE_ST\.oreRound=null;/.test(src), true);
eq('the caves set their rounds (TC3: 3 Iron + 2 Manganese; GC4: 2 Nickel)', /function tutMined\(\)\{[\s\S]{0,900}FTUE_ST\.oreRound=\{ iron:3, manganese:2 \};/.test(src) && /function tutDay2Mined\(\)\{[\s\S]{0,300}FTUE_ST\.oreRound=\{ nickel:2 \};/.test(src), true);
/* r292 (owner, 2026-10-21): the craft lock - while an order is open, only that sword: CRAFT 1 / CONTINUE FROM HERE on another
   trait's page, another shape, or a pour on another trait are refused with D28k */
eq('D28k text, beside D28j', line('D28k') === "The customer asked for a {o}. Let's focus on that." && keyList[keyList.indexOf('D28k') - 1] === 'D28j', true);
{ const fn = name => { const i = src.indexOf('function ' + name + '('); if (i < 0) return ''; let d = 0, j = src.indexOf('{', i);
    for (; j < src.length; j++) { if (src[j] === '{') d++; else if (src[j] === '}' && --d === 0) break; } return src.slice(i, j + 1); };
  const TB = { fire: { name: 'Fire' }, gale: { name: 'Gale' }, balanced: { name: 'Balanced' } };
  const L = new Function('TRAIT_BY', 'orderLabel', fn('ftueOrderName') + fn('ftueOrderTraitOk') + fn('ftueOrderShapeOk') + '; return { ftueOrderName, ftueOrderTraitOk, ftueOrderShapeOk };')(TB, (n, sh) => sh ? n + ' ' + sh : n + ' sword');
  const fireLong = { trait: 'fire', shape: 'Longsword' }, bal = { trait: 'balanced', shape: null }, two = { items: [{ trait: 'gale', shape: 'Katana' }, { trait: 'fire', shape: 'Claymore' }] };
  eq('the order\'s name', [L.ftueOrderName(fireLong), L.ftueOrderName(bal), L.ftueOrderName(two)], ['Fire Longsword', 'Balanced sword', 'Gale Katana and a Fire Claymore']);
  eq('trait: only the order\'s', [L.ftueOrderTraitOk(fireLong, 'fire'), L.ftueOrderTraitOk(fireLong, 'balanced'), L.ftueOrderTraitOk(two, 'gale'), L.ftueOrderTraitOk(two, 'swift')], [true, false, true, false]);
  eq('shape: the order\'s, or any when it names none', [L.ftueOrderShapeOk(fireLong, 'Longsword'), L.ftueOrderShapeOk(fireLong, 'Katana'), L.ftueOrderShapeOk(bal, 'Katana'), L.ftueOrderShapeOk(two, 'Claymore'), L.ftueOrderShapeOk(two, 'Longsword')], [true, false, true, true, false]); }
eq('the open order: the customer, or GC9 waiting once D107g is said; none after the tutorial', /function ftueOrderOpen\(\)\{ if\(FTUE_ST\.done\) return null;[\s\S]{0,600}FTUE_ST\.wq==='craft'/.test(src), true);
eq('CRAFT 1 refuses another trait\'s page', /function cbCraft\(n\)\{[\s\S]{0,300}if\(!ftuePageOk\(r\)\) return;/.test(src), true);
eq('so does CONTINUE FROM HERE', /function cbContinue\(\)\{[\s\S]{0,200}if\(!ftuePageOk\(r\)\) return;/.test(src), true);
eq('the shape picker refuses another shape, and stays open', /function selectShape\(shape\)\{ const fo=ftueOrderOpen\(\); if\(fo && !ftueOrderShapeOk\(fo, shape\)\)\{ ftueFocus\(fo\); return; \}/.test(src), true);
eq('over a frame window the dragon speaks from the frame bubble (the counter\'s sits in the screen layer, under it)', /function sayWhere\(\)\{[\s\S]{0,400}if\(\['sfBookModal','sfShapeModal','sfTraitModal','sfCraftModal','sfRewardModal'\]\.some\(id=>\{ const m=document\.getElementById\(id\); return m && m\.classList\.contains\('show'\); \}\)\) return 'bench';/.test(src), true);
eq('D28k goes with its window; a kept line (D107g) moves back to the screen bubble', src.includes("function ftueFocusDone(){ if(SAY_ON==='D28k' || (FTUE_SHAPE_LINE && SAY_ON===FTUE_SHAPE_LINE)) sayHide(); }")
  && /function closeBook\(\)\{[^\n]*ftueFocusDone\(\)/.test(src) && /function closeTraitCard\(\)\{[^\n]*ftueFocusDone\(\)/.test(src) && /function cancelShape\(\)\{[\s\S]{0,200}ftueFocusDone\(\)/.test(src)
  && src.includes("ftueReward(list, ()=>{ if(line && SAY_ON===line){ if(e.keep) say(line); else sayHide(); } if(then) then(); });"), true);
eq('the mug refuses another trait (TC5\'s swift pour is the lesson)', src.includes("if(mugOverAnvil() && canPourQuench() && ftuePourOk()){") && /function ftuePourOk\(\)\{[\s\S]{0,400}ftueTutTrait\(\)===melt\.reachedTrait\.trait\.id/.test(src), true);
/* r291 (owner, 2026-10-21): the ore chain - after each tutorial sword the dragon gives exactly the next sword's ores,
   in the reward window with his line on top (record: "The ore chain" in specs/2026-10-07-ftue-v3-rework.md) */
eq('oreChain is the recorded table', FTUE.oreChain, {
  first:    { give: { iron: 2, manganese: 2 }, say: 'D18a' },
  p1g0:     { give: { iron: 2, manganese: 2 }, say: 'D18a' },
  p1g1:     { give: { iron: 2, manganese: 2 }, say: 'D18a' },
  p1g2:     { give: { iron: 1, manganese: 1 }, say: 'D28j' },
  p3g0:     { give: 'page:fire', say: 'D18a' },
  p3g1:     { give: 'page:fire', say: 'D18a' },
  p3g2:     { give: 'page:fire', say: 'D18a' },
  p3g3:     { give: { nickel: 2 }, say: 'D18a' },
  tc4:      { give: { copper: 2 }, say: 'D18a' },
  tc5swift: { give: { copper: 5 }, say: 'D18a' },
  tc5:      { give: { iron: 1, manganese: 1 }, say: 'D18a' },
  bram2:    { give: 'page:gale', say: 'D18a' },
  p5g0:     { give: { iron: 2, manganese: 2 }, say: 'D18a' },
  gc9:      { give: ['page:gale', 'page:fire'], say: 'D107g', keep: true } });
eq('no reward after TC2, TC3, GC8 or Garric (caves, the stored ingot, the end)', ['tc2', 'tc3', 'p4g0', 'garric'].some(k => FTUE.oreChain[k]), false);
eq('D18a text, beside D18', line('D18a') === "Here's a reward from me." && keyList[keyList.indexOf('D18a') - 1] === 'D18', true);
eq('D28j text, beside D28i', line('D28j') === 'I am running out of my reward stock. I only have 1 iron and 1 manganese.' && keyList[keyList.indexOf('D28j') - 1] === 'D28i', true);
{ const fn = name => { const i = src.indexOf('function ' + name + '('); if (i < 0) return ''; let d = 0, j = src.indexOf('{', i);
    for (; j < src.length; j++) { if (src[j] === '{') d++; else if (src[j] === '}' && --d === 0) break; } return src.slice(i, j + 1); };
  const L = new Function('RECIPES', 'recipeKey', fn('ftuePageOres') + fn('ftueOreGive') + '; return { ftueOreGive };')(
    { fire: { ores: ['iron', 'iron', 'manganese', 'manganese'] }, gale: { ores: ['copper', 'copper', 'copper', 'copper', 'copper'] } }, a => a.join('+'));
  eq('a page reward is that page\'s ores', L.ftueOreGive('page:fire'), { iron: 2, manganese: 2 });
  eq('several add up', L.ftueOreGive(['page:gale', 'page:fire']), { copper: 5, iron: 2, manganese: 2 });
  eq('a plain one is itself', L.ftueOreGive({ nickel: 2 }), { nickel: 2 }); }
eq('the ore reward kind: name, line, icon, apply', src.includes("if(r.kind==='ore') return r.n+' '+ORE_BY[r.id].name;") && src.includes("if(r.kind==='ore') return 'For the next sword.';")
  && src.includes("if(r.kind==='ore') return '<img class=\"rwd-ic\" src=\"'+oreImg(r.id)+'\" alt=\"\">';") && src.includes("if(r.kind==='ore'){ gainOre(r.id, r.n); if(INV_TAB===0) buildShelf(); return; }"), true);
eq('which sword was made: the hammered one', /function finishBlade\(\)\{[\s\S]*?const oreKey=ftueSwordKey\(\{ first:TUT_STAGE==='forge' && !CUSTOMER, second:second, fire:fireSword, gale:galeSword, bram2:bram2Sword, garric:garricSword \}\);[\s\S]*?CRAFT_ORE=oreKey; showCraft\(/.test(src), true);
eq('and CRAFT 1\'s', /function cbCraft\(n\)\{[\s\S]*?CRAFT_ORE=\(n===1\) \? ftueSwordKey\(\{\}\) : null;[^\n]*\n\s*showCraft\(/.test(src), true);
/* r294 (owner, 2026-10-21): the ore reward comes after the SALE. The crafted window only notes which sword was made (a sword
   with no row still ends the round); each sale gives it at its natural pause */
eq('the crafted window notes the sword; the flow goes straight on', /function closeCraft\(\)\{[\s\S]{0,1200}const ok=CRAFT_ORE; CRAFT_ORE=null;[^\n]*\n\s*if\(ok\)\{ if\(FTUE\.oreChain\[ok\]\) FTUE_ST\.orePending=ok; else FTUE_ST\.oreRound=null; \}\s*if\(typeof after==='function'\) after\(\);/.test(src), true);
eq('ftueOreSold gives the noted sword\'s reward, once, after the customer has gone (r295: their goodbye ends first)', src.includes("function ftueOreSold(then){ if(CUST_BYE){ setTimeout(()=>ftueOreSold(then), 250); return; }") && src.includes("    const k=FTUE_ST.orePending; FTUE_ST.orePending=null; ftueOreReward(k, then); }"), true);
eq('after Bram leaves (D26), before the quest list', src.includes("setTimeout(()=>ftueOreSold(()=>sayQueue('D118')), 0);"), true);
eq('after a gameplay customer\'s sale, before the walk back', src.includes("setTimeout(()=>ftueReward(list, ()=>ftueOreSold(ftueToCounter)), 700);"), true);
eq('after TC4\'s sale', src.includes("setTimeout(()=>ftueReward(FTUE.parts[4].rewards.tc, ()=>ftueOreSold(()=>{ bellShow(true); ftueToCounter(); })), 700);"), true);
eq('after TC5\'s sale, before D109', src.includes("ftueReward(FTUE.parts[4].rewards.tc, ()=>ftueOreSold(()=>{ sayQueue('D109'); TUT_STAGE='p4-bell'; bellShow(true); ftueBellGlow(); }));"), true);
eq('after Bram\'s Dagger (his gift and the diary), before the bell', /function ftueAfterDiary\(\)\{[\s\S]{0,200}TUT_STAGE='p5-bell'; ftueOreSold\(\(\)=>\{ bellShow\(true\); ftueToCounter\(\); \}\);/.test(src), true);
eq('TC5: 5 Copper once the swift ingot is stored', /function tutGaleStart\(\)\{[\s\S]{0,200}ftueOreReward\('tc5swift', \(\)=>\{ sayQueue\('D100','D101'\);/.test(src), true);
eq('GC9: the ores come with D107g', src.includes("if(FTUE_ST.wq==='see'){ FTUE_ST.wq='craft'; wqLit(); ftueOreReward('gc9'); }"), true);
eq('TC3 (R24): the last iron stays in the bag when the manganese is in - it finishes the route', !/function tutFireSmelted2\(\)\{[\s\S]{0,300}ORE_COUNT\.iron=0;/.test(src), true);
eq('the line sits over the reward window, and goes with it', /function ftueOreReward\(key, then\)\{[\s\S]{0,1400}say-over-modal/.test(src) && /function closeReward\(\)\{[\s\S]{0,300}say-over-modal/.test(src), true);
eq('PART seeds follow the chain (part 4: 2 Nickel; part 5: empty; part 6: 2 + 2)', src.includes("ORE_COUNT.nickel=2; ORE_COUNT.iron=0; ORE_COUNT.manganese=0; ORE_COUNT.copper=0; FTUE_ST.oreRound={ nickel:2 }; GOLD=520;")
  && src.includes("ORE_COUNT.nickel=0; ORE_COUNT.iron=0; ORE_COUNT.manganese=0; ORE_COUNT.copper=0; FTUE_ST.oreRound=null; GOLD=820;") && src.includes("ORE_COUNT.iron=2; ORE_COUNT.manganese=2; ORE_COUNT.copper=0; FTUE_ST.oreRound={ iron:2, manganese:2 }; GOLD=1100;"), true);
/* r290 (owner, 2026-10-21): the minigame's D13 run is the first sword's alone. The first sword's shape pick (stage 'shape')
   marks it, since tutDone() then clears the stage; any other craft (GC4, TC4, GC8, the part 5 gale Longsword, Garric's
   solo run) no longer falls through to D13, nor has its stage changed to 'forge' (which cost GC4/TC4/GC8 the counter pointer) */
eq('the first sword\'s shape pick marks its minigame', src.includes("if(TUT_STAGE==='shape'){ TUT_HM_FIRST=true; tutDone(); }"), true);
eq('tutHmStep says D13 only for it, once', /function tutHmStep\(\)\{[\s\S]{0,1200}if\(tutOver\(\) \|\| TUT_STAGE==='forge' \|\| !TUT_HM_FIRST\) return;\s*TUT_HM_FIRST=false; TUT_STAGE='forge';/.test(src), true);
eq('a new game clears the mark', /function tutReset\(\)\{[\s\S]{0,1500}TUT_HM_FIRST=false;/.test(src), true);
/* r288 (owner, 2026-10-21): D15 pauses the game (the minigame's heat and clock hold) under the dark screen, until its OK */
eq('D15 pauses', /function tutHmHeat\(hot\)\{[\s\S]{0,400}say\('D15'\); tutPause\(true\); return; \}/.test(src), true);
eq('its OK lifts the pause before D15a', src.includes('const SAY_PAUSE_ONE={ D15:1 };') && /function sayNext\(\)\{[\s\S]{0,600}if\(TUT_PAUSE && SAY_PAUSE_ONE\[SAY_ON\]\) tutPause\(false\);/.test(src), true);
eq('a hidden D15 does not leave the game paused', /function sayHide\(\)\{[\s\S]{0,1400}if\(TUT_PAUSE && SAY_PAUSE_ONE\[SAY_ON\]\) tutPause\(false\);/.test(src), true);
eq('its OK is lit, like the other pause lines', /const SAY_GO_GLOW=\{[^}]*D15:1/.test(src), true);
/* r287 (owner, 2026-10-21): D28 ("Go ahead, try it!") is removed */
eq('D28 is gone', /\n\s*D28: "/.test(src) || /'D28'/.test(src), false);
/* r286 (owner, 2026-10-21): the trait window opens on its own - the dragon's line behind it (D10) is closed */
eq('showAcquire closes the dragon\'s line', /function showAcquire\(bt,tier,total,fresh\)\{[\s\S]{0,600}sayHide\(\);[\s\S]{0,160}document\.getElementById\('sfAcquireModal'\)\.classList\.add\('show'\);/.test(src), true);
/* r282 (owner, 2026-10-21): D10 and D11 are one line (D10), with no close; the mug pointer goes up with it */
eq('D11 is gone', /\n\s*D11: "/.test(src), false);
eq('the quench says D10 alone', /function tutQuenchStep\(\)\{[\s\S]{0,200}if\(SAY_SEQ\.indexOf\('D10'\)<0\) SAY_SEQ\.push\('D10'\);/.test(src) && !/'D11'/.test(src), true);
/* r281 (owner, 2026-10-21): the first sword's lines that the player's own action moves on show no close (x); the ones
   that hold the game (D8, D9, D16) or start something when closed (D19) keep it */
eq('SAY_NO_X is the recorded list', (() => { const m = src.match(/const SAY_NO_X=(\{[^}]*\});/); return m && Object.keys(new Function('return ' + m[1])()); })(),
  ['D3', 'D4', 'D6', 'D10', 'D12', 'D14', 'D15a', 'D17', 'D18', 'D23', 'D24', 'D27', 'D118', 'D18a', 'D28j', 'D28l', 'D28c', 'D28d', 'D28f', 'D28h', 'D28i']);   /* r300: the order lines have an OK again; the shape window's lines have none */   /* r289: every market ask. r291: the reward lines (the window closes them) */   /* r282: D10 (with D11 in it). r283: D23. r284: D24. r287: D27, D118. r288: D28b */
eq('the pause and close-to-continue lines are not in it', (() => { const m = src.match(/const SAY_NO_X=(\{[^}]*\});/), L = m ? new Function('return ' + m[1])() : {}; return ['D8', 'D9', 'D16', 'D19'].some(k => L[k]); })(), false);
eq('a hidden button is gone, not an empty frame (the rule beats #dragonSay .go)', src.includes('.say-go.none, #dragonSay .go.none, #screenDragonSay .go.none, .tut-iconsay .go.none { display: none; }'), true);
/* r288: a listed line shows no button wherever it sits in the run - D23 repeats, and a stale run behind it turned its button into an OK */
eq('a listed line shows no button anywhere in a run', src.includes("const goKind=(SAY_CHOICES || SAY_NO_X[id]) ? 'none' : ((SAY_I>=0 && SAY_I>=SAY_SEQ.length-1 && !SAY_GO_MORE[id]) ? 'close' : 'next');"), true);
/* R22 (owner, 2026-10-28): no X on the dragon's lines on the counter and cave screens - a tap on the bubble closes them */
eq('the screens without the X', src.includes("const SAY_NO_X_SCREENS=['customer','cave'];"), true);
eq('there a closing line shows no button (OK stays)', src.includes("sayGoIcon(go, (goKind==='close' && SAY_NO_X_SCREENS.includes(SF_SCREEN)) ? 'none' : goKind, id);"), true);
eq('both bubbles close on a tap anywhere on them', src.includes('<div id="screenDragonSay" onclick="sayNext()">') && src.includes('<div id="dragonSay" onclick="sayNext()">'), true);
/* r280 (owner, 2026-10-20): the route the metal follows (ore in the smelter) is dark brown; the preview while an ore is
   held stays red, fainter (values: Claude's proposal) */
{ const tag = id => (src.match(new RegExp('<path id="' + id + '"[^>]*>')) || [''])[0], at = (t, a) => (t.match(new RegExp(' ' + a + '="([^"]*)"')) || [])[1];
  eq('the placed route is dark brown', at(tag('pathline'), 'stroke'), '#4a2c17');
  eq('the preview stays red', [at(tag('pathpreviewsolid'), 'stroke'), at(tag('pathpreview'), 'stroke')], ['#e0392b', '#e0392b']);
  eq('the preview is fainter: solid 0.45, dotted tail 0.3', [at(tag('pathpreviewsolid'), 'opacity'), at(tag('pathpreview'), 'opacity')], ['0.45', '0.3']); }
/* r279 (owner, 2026-10-20): arriving on a screen picks its inventory tab - the forge the ingredients, the basement, the
   counter and the shop the swords; the bedroom and the cave keep the tab that was open */
eq('SCREEN_TAB is the recorded table', (() => { const m = src.match(/const SCREEN_TAB=(\{[^}]*\});/); return m && new Function('return ' + m[1])(); })(), { forge: 0, basement: 2, customer: 2, shop: 2 });
eq('goScreen switches the tab on arrival, before the tutorial\'s own arrival step', /function goScreen\(name\)\{[\s\S]*?SF_SCREEN = name;[\s\S]{0,200}if\(SCREEN_TAB\[name\]!=null && INV_TAB!==SCREEN_TAB\[name\]\) invTab\(SCREEN_TAB\[name\]\);[\s\S]*?tutScreenArrived\(name\)/.test(src), true);
/* r278 (owner, 2026-10-20): the map's trait icon opens a trait card; GC5's map route points at the card's CRAFT 1 */
eq('the book step knows the card is open (signature)', /function ftueBookSig\(\)\{[\s\S]{0,400}traitCardOpen\(\)\?1:0/.test(src), true);
eq('card open on the order\'s page: its CRAFT 1; on another page: its close', src.includes("if(traitCardOpen()){ tutSpotOn(null); tutHole(null); tutArrow(null,null); tutExit(CB_SEL===key ? '#tcCraft1' : '#sfTraitModal .tc-x'); return; }"), true);
eq('order made with the card open: shut the card', /if\(custOrderReady\(\)\)\{[\s\S]{0,200}if\(traitCardOpen\(\)\)\{ tutArrow\(null,null\); tutExit\('#sfTraitModal \.tc-x'\); return; \}/.test(src), true);
/* r276 (owner, 2026-10-16): while hammering to the '?' (stage 'travel', after D8) only the map, the anvil, the metal and the
   dialogue show */
{ const m = src.match(/const STAGE_DARK=({.*});/), T = m && new Function('return ' + m[1])();
  eq('STAGE_DARK.travel (R1): a map window and the smelter (the bellows)', T && T.travel, { cut: [{ sel: '#map-wrap' }], lift: ['#stSmelt'] }); }
/* r275 (owner, 2026-10-16): the quench (D10, D11) is dark too: the dialogue, the bucket, the mug, the arrow, the anvil and
   the metal show. The pour's steam and mist (#quenchFog, z58) would be under the dim, so the dim lifts while they play */
{ const m = src.match(/const STAGE_DARK=(\{.*\});/), T = m && new Function('return ' + m[1])();
  eq('STAGE_DARK.quench (R1: the gate step, D10): a map window and the smelter', T && T.quench, { cut: [{ sel: '#map-wrap' }], lift: ['#stSmelt'] }); }
eq('the bucket and the mug beat their inline z-index', src.includes('#frame.landscape #bucketBack.dark-lit { z-index: 61 !important; }') && src.includes('#frame.landscape #mug.dark-lit { z-index: 64 !important; }'), true);
eq('the dim lifts while the quench steam and mist play', src.includes("function tutDarkSync(){ const qf=document.getElementById('quenchFog'), st=(STAGE_DARK[TUT_STAGE] && !(qf && qf.classList.contains('catch'))) ? TUT_STAGE : null;"), true);
/* r274 (owner, 2026-10-16): a lifted prop being dragged (the metal, the hammer, the dragon) stays over the dim. .dragging
   is 'z-index: 35 !important', which beat the lift and dropped it under the dim (z60) mid-drag */
eq('a lifted prop being dragged rises over the dim and the other lifted props', src.includes('.dark-lit.dragging { z-index: 64 !important; }'), true);
eq('it comes after .dragging, which it must beat', src.indexOf('.dark-lit.dragging { z-index: 64 !important; }') > src.indexOf('.dragging { z-index: 35 !important; }'), true);
/* r273 (owner, 2026-10-16): the ore step also shows the path, the active sword and the map's highlight. The map gets a
   window in the main dim and its own dim (#tutHoleMap, over the map's box only) with a soft hole for each fog circle,
   fading over the fog's own blur */
eq('the map dim exists beside the main one', src.includes('<div id="tutHole"></div>\n    <div id="tutHoleMap"></div>') || src.includes('<div id="tutHole"></div>\r\n    <div id="tutHoleMap"></div>'), true);
eq('it is the same dim, over the map only', src.includes('#tutHoleMap { position: absolute; z-index: 60; background: rgba(6,4,2,.74); display: none; pointer-events: none; }'), true);
eq('a fog window takes a soft hole per fog circle, intersected', /function tutDarkLayout\(\)\{[\s\S]{0,1200}if\(c\.fog\) tutFogDim\(r, a, k, x, y, w, h\);[\s\S]{0,400}function tutFogDim\([^)]*\)\{[\s\S]{0,600}getScreenCTM\(\)[\s\S]{0,200}#fogHoles circle[\s\S]{0,600}radial-gradient\(circle [\s\S]{0,900}maskComposite='intersect'/.test(src), true);
eq('the fade spans the fog blur (FOG_EDGE)', (src.match(/const FOG_EDGE=(\d+);/) || [])[1], '40');
/* r272 (owner, 2026-10-16): the first sword's steps stay dark until the hammering starts. One table, stage -> what is
   lifted over the dim (and any window cut in it): ore = the smelter and the inventory (r271); bellows and gate = the
   smelter, bellows included; anvil = the anvil and the metal; hammer = the anvil, the metal and the hammer; strike (D8,
   the first strike) = a window over the map, so the sword icon moving is what shows. D8's pause keeps the frame loop
   held but drops its own #tutDim for this. The dragon, his line and the arrow (z70) are always over */
{ const m = src.match(/const STAGE_DARK=(\{.*\});/);
  eq('STAGE_DARK is the recorded table', m && new Function('return ' + m[1])(), {
    ore:     { cut: [{ sel: '#matPanel' }, { sel: '#map-wrap', fog: true }], lift: ['#stSmelt'] },
    bellows: { lift: ['#stSmelt'] },
    anvil:   { lift: ['#stAnvil', '#orb'] },
    strike:  { cut: [{ sel: '#map-wrap' }], lift: ['#stSmelt'] },
    quench:  { cut: [{ sel: '#map-wrap' }], lift: ['#stSmelt'] },
    travel:  { cut: [{ sel: '#map-wrap' }], lift: ['#stSmelt'] } }); }   /* R1: the smelter loop - no gate (on heat) or hammer steps */
eq('lifted: the smelter and anvil, then the hammer, then the metal on top (their own order)', src.includes('#dragon.dark-lit, #frame.landscape #stSmelt.dark-lit, #frame.landscape #stAnvil.dark-lit { z-index: 61; }')
  && src.includes('#frame.landscape #hammerTool.dark-lit { z-index: 62; }') && src.includes('#frame.landscape #orb.dark-lit { z-index: 63; }'), true);
eq('tutDarkSync follows the stage', src.includes("function tutDarkSync(){ const qf=document.getElementById('quenchFog'), st=(STAGE_DARK[TUT_STAGE] && !(qf && qf.classList.contains('catch'))) ? TUT_STAGE : null;"), true);
eq('say() syncs after its hooks, and leaves a stage dim alone', src.includes("if(!STAGE_DARK[TUT_STAGE]) tutDark(SAY_DARK.includes(id) && B[0]==='dragonSay');") && /function say\(id\)\{[\s\S]*?tutDarkSync\(\);[^\n]*\n\s*sayLayout\(\);/.test(src), true);
eq('closing a line keeps a stage dim', /function sayHide\(\)\{[\s\S]{0,1400}if\(!STAGE_DARK\[TUT_STAGE\]\) tutDark\(false\);/.test(src), true);
eq('the frame loop syncs it', src.includes("    tutDarkSync();   /* r271/r272 */"), true);
eq('the cut is an even-odd path of rectangles', /function tutDarkLayout\(\)\{[\s\S]{0,900}path\(evenodd, '/.test(src), true);
eq('a pause in a dark stage uses the stage\'s dim, not #tutDim', src.includes("if(d){ d.classList.toggle('on', !!on && !STAGE_DARK[TUT_STAGE]);"), true);
/* r270 (owner, 2026-10-16): D1 and D2 are read on a dark screen - the r245 dim with no hole; only the dragon and his
   line (with its glowing OK) show above it */
eq('SAY_DARK is D1, D2 and D32c (r296)', (src.match(/const SAY_DARK=(\[[^\]]*\]);/) || [])[1], "['D1','D2','D32c']");
eq('D32c\'s OK is lit (r296)', /const SAY_GO_GLOW=\{[^}]*D32c:1/.test(src), true);
eq('say() darkens for those lines on the forge bubble, and clears for any other', src.includes("tutDark(SAY_DARK.includes(id) && B[0]==='dragonSay');"), true);
eq('sayHide() lifts it', /function sayHide\(\)\{[\s\S]{0,1400}tutDark\(false\);/.test(src), true);
eq('the dragon rises over the dim with his line', src.includes('#dragon.dark-lit, #frame.landscape #stSmelt.dark-lit, #frame.landscape #stAnvil.dark-lit { z-index: 61; }'), true);
eq('tutDark leaves a live trait hole alone', src.includes("function tutDark(on, cut, lift){ if(TUT_HOLE) return;"), true);
/* r268 (owner, 2026-10-16): a paid sale flies coins from SELL to the gold panel, as a quest claim does; the gold count
   shows the new total when they land */
eq('SELL\'s box is read before the counter changes', /function sellCounter\(\)\{[\s\S]*?const sellR=\(document\.querySelector\('#csPanel \.cs-sell'\)\|\|\{ getBoundingClientRect:\(\)=>null \}\)\.getBoundingClientRect\(\), goldWas=GOLD;[\s\S]*?COUNTER=null;/.test(src), true);
eq('a paid sale flies the coins and holds the count until they land', /function sellCounter\(\)\{[\s\S]*?if\(paidAll>0\)\{ setGoldShown\(goldWas\); flyCoins\(sellR, document\.getElementById\('goldVal'\), \(\)=>\{ updateHud\(\); goldPop\('\+'\+paidAll\+'g'\); \}\); \}/.test(src), true);
eq('a hand-over pays nothing, so it flies nothing', /function orderHandedOver\(c\)\{(?:(?!flyCoins)[\s\S])*?\n\}/.test(src), true);
/* r267 (owner, 2026-10-16): an order of several swords is sold one sword at a time; the gold comes once, for all of
   them, after the last. orderSlot / orderLeft / orderHandOver run here on real swords */
{ const fn = name => { const i = src.indexOf('function ' + name + '('); if (i < 0) return '';
    let d = 0, j = src.indexOf('{', i); for (; j < src.length; j++) { if (src[j] === '{') d++; else if (src[j] === '}' && --d === 0) break; }
    return src.slice(i, j + 1); };
  const lib = new Function(['orderMatches', 'orderSlot', 'orderLeft', 'orderHandOver'].map(fn).join('\n') + '; return { orderSlot, orderLeft, orderHandOver };')();
  const sw = (t, shape) => ({ shape, traits: [{ tid: t, tier: 'Fine' }] });
  const kat = sw('gale', 'Katana'), clay = sw('fire', 'Claymore');
  const two = { ftue: true, qty: 1, got: 0, items: [{ trait: 'gale', shape: 'Katana' }, { trait: 'fire', shape: 'Claymore' }] };
  eq('two swords: the first is handed over, unpaid', lib.orderLeft(two) === 2 && lib.orderHandOver(two, clay) === true && two.held.length === 1 && lib.orderLeft(two) === 1, true);
  eq('the same sword again fills nothing', lib.orderSlot(two, sw('fire', 'Claymore')), -1);
  eq('the last one is the sale (no hand-over)', lib.orderSlot(two, kat) === 0 && lib.orderHandOver(two, kat) === false, true);
  const five = { ftue: true, tid: 'balanced', qty: 5, got: 0 }, bal = () => sw('balanced', 'Longsword');
  let handed = 0; while (lib.orderHandOver(five, bal())) handed++;
  eq('five swords: four are handed over, the fifth is the sale', handed === 4 && five.got === 4 && five.held.length === 4 && lib.orderLeft(five) === 1, true);
  eq('a single order is a plain sale', lib.orderHandOver({ ftue: true, tid: 'fire', qty: 1, got: 0 }, sw('fire', 'Longsword')), false); }
eq('sellCounter hands over before any gold moves', /function sellCounter\(\)\{[\s\S]*?if\(ftueC && orderHandOver\(ftueC, COUNTER\)\)\{ orderHandedOver\(ftueC\); return; \}[\s\S]*?GOLD \+= pay;/.test(src), true);
eq('the last sale pays the held swords too', /function sellCounter\(\)\{[\s\S]*?const held=\(ftueC && ftueC\.held\) \|\| \[\][\s\S]*?held\.forEach\(h=>\{ const hg=swordPrice\(h\)[\s\S]*?GOLD\+=hg;/.test(src), true);
eq('the old all-or-none rule is gone', src.includes('My request was for two swords. You only have one?'), false);
eq('SELL reads "Hand over (n of m)", then "Sell all for"', src.includes("'Hand over ('") && src.includes("'Sell all for '"), true);
eq('COME LATER gives the held swords back', /function comeLater\(\)\{[\s\S]{0,400}INV\.swords\.push\(\.\.\.c\.held\)/.test(src), true);
eq('CRAFT 1 counts only the swords still owed', /function ftueCraftLocked\(\)\{[\s\S]{0,300}orderOwed\(c\)\.every/.test(src), true);
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
eq('the tap: unglow, D119b, then D27 (D27 starts the bell; r287: D28 is gone)', src.includes("function dragonTap(e, layer){ if(TUT_STAGE==='p1-dragon-tap'){ tutUnglow(); TUT_STAGE='p1-bell0'; sayQueue('D119b','D27'); return true; }"), true);
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
  && /if\(byeC && !CUSTOMER\) custBye\(byeC\.portrait, custThanksLine\(tier, byeC\.tier\)\);[^\n]*\r?\n    gainExp\(XP_SELL\*\(held\.length\+1\),'sell'\);/.test(src), true);
eq('the leaving customer is drawn, never counted as present', src.includes("else if(name==='customer' && CUST_BYE) list.unshift({ src:CUST_BYE.portrait, l:7.97, w:20.99, b:86.16 });   /* r252 */")
  && src.includes("const here=!!CUSTOMER, bye=!here && !!CUST_BYE;") && src.includes("if(dlg) dlg.style.display = ((here || bye) && !introOn) ? '' : 'none';"), true);
eq('the goodbye ends after CUST_BYE_MS or when the next customer comes', src.includes('const CUST_BYE_MS=3200;')
  && /if\(CUSTOMER\) \{ toast\('Someone is already at the counter'\); return false; \}\r?\n    custByeEnd\(\);/.test(src), true);
/* r251 (owner, 2026-10-15): a very long route (5+ fully ground irons of drawn length) runs the sword twice as fast;
   the hazard damage is scaled with it, so a zone costs the same per distance */
{ const m = src.match(/const ROUTE_FAST=(\{[^}]*\});/); eq('ROUTE_FAST is the recorded threshold and multiplier (R24: 6 irons, the fire route is 1116 long)', m && new Function('return ' + m[1])(), { irons: 6, mul: 2 }); }
eq('the route length is what is drawn (len x ground fraction), the yardstick a fully ground iron',
  src.includes('function routeLen(){ return segs.reduce((n,s)=>n+(s.len||0)*(s.tPct==null?1:s.tPct), 0); }')
  && src.includes("function ironLen(){ if(!IRON_LEN){ measure.setAttribute('d', ORE_BY.iron.d); IRON_LEN=measure.getTotalLength(); } return IRON_LEN; }")
  && src.includes('function routeSpeedMul(){ return routeLen() >= ROUTE_FAST.irons*ironLen() ? ROUTE_FAST.mul : 1; }'), true);
eq('advanceSword uses it, and so does the hazard damage (R0: no heat factor; the bellows give the time)', src.includes('const mul=routeSpeedMul(); let step=SWORD_SPEED*mul*dt')
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
/* R2 (2026-10-23, the smelter loop): GC1-GC3's craft guide - one pointer worked out from the state, the gate's two checks back */
eq('D9 text (R2)', line('D9'), 'Pumping the bellows also lets you collect experience points scattered all over the map. Collect them to level up.');
eq('tutLoopPointer: the bellows, the gate on a trait, the hot metal to the anvil, the shaped blade to the bucket', (b => !!b
  && b.includes("if(melt.stage==='smelting'){ if(gateReady && (!want || (melt.reachedTrait && melt.reachedTrait.trait.id===want)) && (!atEnd || swordAtRouteEnd())) tutArrow(null, '#furnaceGate'") && b.includes("else tutArrow(null, '#bellowtop'")
  && b.includes("if(melt.stage==='hot'){ tutArrow('#orb', '#stAnvil .anvil'") && b.includes("if(melt.stage==='shaped'){ if(SM_BL) tutArrow(null,null); else tutArrow('#smBlade', '#bucketBack'")
  )((src.replace(/\r\n/g, '\n').match(/function tutLoopPointer\(want, atEnd\)\{[\s\S]*?\n\}/) || [])[0]), true);
eq('the craft guide points with it, through the shaping and the dip', src.includes("if(TUT_STAGE==='p1-craft-heat' || TUT_STAGE==='p1-craft-shape' || TUT_STAGE==='p1-craft-hammer'){ tutLoopPointer(); return; }"), true);
eq('those stages tick', /const TUT_TICK_STAGES=\[[^\]]*'p1-craft-shape','p1-craft-hammer'/.test(src), true);
eq('the guide notices the blade being held', /function tutNudgeSig\(\)\{[\s\S]{0,700}SM_BL\?1:0/.test(src), true);
eq('the gate: the craft lock (another trait, D28k) and the GC retry (2 + 2, D28a) before it opens', /function openGate\(\)\{[\s\S]{0,400}FTUE_POUR_SAID=false; if\(!ftuePourOk\(\)\) return; if\(!ftueGateOk\(\)\) return;[\s\S]{0,200}tryAcquire\(\);/.test(src), true);
eq('after the gate: the metal to the anvil (the pointer), not a glow on it', src.includes("function ftueGcQuenched(){ TUT_STAGE='p1-craft-shape'; tutArrow(null,null); tutUnglow(); tutNudge(true); }"), true);
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
/* owner, 2026-10-09: the crafted window at the wireframe's size - the card fills ~88% of the height (470 px wide in the 1080x600 frame) */
eq('the crafted card is wireframe-sized (R17: the art 150 px, for the two stat rows)', src.includes('.cw-stage { position: relative; width: 470px;') && src.includes('.cw-main .cr-art { height: 150px;'), true);
/* owner, 2026-10-09: the QUEST button glows green while a finished quest waits to be claimed */
eq('the glow follows "something to claim"', src.includes("function questBtnUi(){ const b=document.getElementById('questBtn'); if(b) b.classList.toggle('qs-ready', QUESTS.some(q=>q.done && !q.claimed)); }"), true);
eq('it is refreshed when a quest finishes, is claimed, and on load', /function bumpQuest\(id,n\)\{[\s\S]{0,600}questBtnUi\(\)/.test(src)
  && /function claimQuest\(id, btn\)\{[\s\S]{0,200}questBtnUi\(\)/.test(src) && /function applyState\(o\)\{[\s\S]*?questBtnUi\(\)/.test(src), true);
eq('the green glow', src.includes('#questBtn.qs-ready {'), true);
/* owner, 2026-10-09: the new "Sword crafted!" window (wireframes in assets/Anchor-images/Sword_crafted_*.png) */
eq('the main card: title, art, name line, heart + hammer with their gold, gold, CLOSE (R17: no ores)', ['<h3 class="cw-title">Sword crafted!</h3>', 'id="cwName"',
  'class="cw-fill cw-hp"', 'class="cw-fill cw-hm"', 'id="cwHpEff"', 'id="cwHmEff"', 'id="cwGold"', '<button class="cw-close" type="button" onclick="closeCraft()">Close</button>']
  .every(t => src.includes(t)) && !src.includes('id="cwOreN"'), true);
/* R17 (owner, 2026-10-27): Health and hammering on the card - icon, percentage under it, the gold effect on the right; the
   paper shows only the ores */
{ const card = (src.match(/<div class="cw-main">([\s\S]*?)<button class="cw-close"/) || [])[1] || '', paper = (src.match(/<div class="cw-paper" id="cwPaper">([\s\S]*?)<\/div>\s*<div class="cw-main">/) || [])[1] || '';
  eq('the card\'s rows: Health, then hammering, each the icon + % and the gold effect', /<div class="cw-stats">(?:<!--[^>]*-->)?\s*<div class="cw-box cw-row" id="cwHpRow"><span class="cw-stat"><span class="cw-fill cw-hp"[\s\S]*?<span class="cw-pct" id="cwHpPct"><\/span><\/span><span class="cw-eff" id="cwHpEff"><\/span><\/div>\s*<div class="cw-box cw-row" id="cwFgRow"><span class="cw-stat"><span class="cw-fill cw-hm"[\s\S]*?<span class="cw-pct" id="cwHmPct"><\/span><\/span><span class="cw-eff" id="cwHmEff"><\/span><\/div>\s*<\/div>/.test(card), true);
  eq('the paper: the ores and its arrow, nothing else', paper.includes('<div class="cw-drow cw-dores" id="cwOres"></div>') && paper.includes('id="cwTab"')
    && !/cwHpRow|cwFgRow|cwHpTxt|cwFgTxt/.test(paper), true); }
eq('the Health gold: the full-health price minus the price (red), else "No loss"; a tier drop noted under it',
  src.includes("function cwHpEffHtml(w){ const lost=w.hp!=null ? swordBase(Object.assign({}, w, { hp:100 })) - swordBase(w) : 0, tiers=hazTierDrop(w.haz);")
  && src.includes("return (lost>0 ? '<span class=\"cr-lost\">-'+lost+'g</span>' : 'No loss')+(tiers ? '<small>'+w.haz+' hazards: -'+tiers+' tier</small>' : ''); }"), true);
eq('the hammering gold: the price minus the unforged price (+ green, - red), else "No change"; the band under it',
  src.includes("function cwHmEffHtml(w){ const d=swordBase(w) - swordBase(Object.assign({}, w, { quality:HM_HITS.unforged }));")
  && src.includes("return (d>0 ? '<span class=\"cw-up\">+'+d+'g</span>' : d<0 ? '<span class=\"cr-lost\">'+d+'g</span>' : 'No change')+'<small>'+(w.quality || HM_HITS.unforged)+'</small>'; }"), true);
eq('showCraft fills them', src.includes("document.getElementById('cwHpEff').innerHTML=cwHpEffHtml(w); document.getElementById('cwHmEff').innerHTML=cwHmEffHtml(w);"), true);
eq('a lit card row keeps its orange edge', src.includes('#sfCraftModal .cw-box.tut-lit-ctl, #sfCraftModal .cw-drow.tut-lit-ctl'), true);
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
/* R17: the hammer row is on the card now, so D17b comes first (the row lit), then D17a (the arrow), then the paper's D17c */
eq('the window opens on D17b and the hammer row', src.includes("function cwLessonStart(){ if(FTUE_ST.cwSeen || FTUE_ST.done) return; FTUE_ST.cwSeen=true; CW_LESSON='hammer';")
  && src.includes("setTimeout(()=>{ if(CW_LESSON!=='hammer') return; cwLit('#cwFgRow'); sayQueue('D17b'); cwLessonSay(); }, 350); }"), true);
eq('closing D17b lights the arrow and says D17a', /D17b:function\(\)\{ if\(CW_LESSON==='hammer'\)\{ CW_LESSON='arrow'; cwLit\('#cwTab'\); sayQueue\('D17a'\); cwLessonSay\(\); \} \},/.test(src), true);
eq('D17b keeps a continue button', /const SAY_GO_MORE=\{[^}]*D17b:1/.test(src), true);
eq('the arrow opens the ores lesson', /function craftDetails\(\)\{[\s\S]{0,800}CW_LESSON==='arrow'[\s\S]{0,200}sayQueue\('D17c'\)/.test(src), true);
eq('each line lights its own part', src.includes("if(id==='D17b' && CW_LESSON) cwLit('#cwFgRow');") && src.includes("if(id==='D17c' && CW_LESSON) cwLit('#cwOres');")
  && src.includes('id="cwFgRow"'), true);
eq('after D17c the CLOSE button lights', /D17c:function\(\)\{ if\(CW_LESSON==='rows'\)\{ CW_LESSON='close'; cwLit\('#sfCraftModal \.cw-close'\);/.test(src), true);
eq('D17c keeps a continue button', /const SAY_GO_MORE=\{[^}]*D17c:1/.test(src), true);
eq('the lines sit over the window', /function cwLessonSay\(\)\{[^\n]*say-over-modal/.test(src), true);
eq('closing ends the lesson', /function closeCraft\(\)\{\r?\n\s*cwLessonEnd\(\);/.test(src), true);
/* owner, 2026-10-10: the hurt fire sword's window - D69d lights the Health row, then CLOSE. R17: the row is on the card, no arrow first */
eq('the hurt fire sword starts the Health lesson', src.includes("if(fireHurt) setTimeout(()=>cwHurtStart(), 350);"), true);
eq('D69d lights the card\'s Health row', src.includes("function cwHurtStart(){ if(CW_LESSON) return; CW_LESSON='hp-row'; cwLit('#cwHpRow'); sayQueue('D69d'); cwLessonSay(); }") && src.includes('id="cwHpRow"'), true);
eq('no arrow step left in the Health lesson', !src.includes('hp-arrow'), true);
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
/* owner, 2026-10-13: the fire run's last ore - full iron (crosses a zone) or full manganese (goes round it), both Fine.
   R24 (2026-10-28): the rotated paths - manganese, then a ground iron; Fire sits where the manganese path sees it */
eq('fireAt (R24)', FTUE.fireAt, { x: 807, y: 1113 });
eq('fire moves after hazards and books are placed', /addBook\(K,bx,by\); got\+\+; \} \}\);[\s\S]{0,900}const ft=traits\.find\(t=>t\.trait && t\.trait\.id==='fire'\); if\(ft\)\{ ft\.x=FTUE\.fireAt\.x; ft\.y=FTUE\.fireAt\.y;/.test(src), true);
eq('D72 text', line('D72'), 'If we use iron, we will cross another hazard zone.');
eq('D72a text', line('D72a'), 'But the manganese can avoid it.');
eq('D72a follows D72', (() => { const ks = [...src.matchAll(/\n\s*(D\d+[a-z]?): "/g)].map(x => x[1]); return ks[ks.indexOf('D72a') - 1]; })(), 'D72');
eq('no grind cap any more', !src.includes('GRIND_FIRE_CAP'), true);
eq('R24: manganese only (it avoids the hazard), fully ground', src.includes("if(TUT_STAGE==='fire-mang') return segs.filter(g=>g.ore==='manganese').length<2 ? 'manganese' : false;") && src.includes("if(want && want.split('/').indexOf(oreId)<0)")
  && /function fullGrindOnly\(\)\{[\s\S]{0,300}TUT_STAGE==='fire-mang' \|\| TUT_STAGE==='fire-iron'; \}/.test(src), true);
eq('after the reheat: both lines, and each draws its path', src.includes("sayQueue('D72','D72a'); tutForkPath('iron');") && src.includes("if(id==='D72a' && TUT_STAGE==='fire-mang') tutForkPath('manganese');"), true);
eq('the choice paths are dashed, apart from the red route (found in the browser: iron blended into it)',
  src.includes("el.setAttribute('stroke', id==='iron' ? '#8e1a10' : '#2f9e4f'); el.setAttribute('stroke-dasharray','14 9'); el.setAttribute('stroke-width','5');"), true);
eq('the fog opens over the choice, so the hazard is seen (found in the browser: both paths ran into the fog)',
  src.includes("if(id==='iron'){ const m=HAZ.move[0]; reveal(m.to.x, m.to.y, 'fork'); tutForkHaz(true); }"), true);
eq('the hazard on the iron path shows red while it is talked about (found in the browser: faint under the fog texture)',
  src.includes("function tutForkHaz(on){ const m=HAZ.move[0], z=hazards.find(z=>Math.hypot(z.x-m.to.x, z.y-m.to.y)<1); if(z && z.el) z.el.classList.toggle('fork-hot', !!on); }") && src.includes(".haz.fork-hot .hazHot {")
  && src.includes("tutForkHaz(true);") && /function tutForkHide\(\)\{[^\n]*tutForkHaz\(false\);/.test(src), true);
eq('then the manganese to the grindstone (R24)', /D72a:function\(\)\{ if\(TUT_STAGE==='fire-mang'\) tutForkDone\(\); \}/.test(src)
  && src.includes("function tutForkDone(){ tutForkHide(); tutNeedTab(0); if(!prep) tutWheelArrow('Manganese'); }"), true);
eq('a full grind says D73', src.includes("function tutFireGround(){") && src.includes("if(TUT_STAGE==='fire-mang') tutFireGround();"), true);
eq('the PART jumps\' fire recipe is the full route (R24)', src.includes("RECIPES.fire={ key:'fire', traits:[{ tid:'fire', tier:'Fine' }], ores:['iron','iron','manganese','manganese','iron'], grinds:[1,1,1,1,1], at:Date.now() };"), true);
/* R24 (owner, 2026-10-28): iron's path turns 30 deg anticlockwise, manganese's 30 deg clockwise (specs/2026-10-28-rotated-ore-paths-test.md) */
eq('R24 record: balancedAt', FTUE.balancedAt, { x: 1163, y: 1036 });
eq('R24 record: fireSeenIn', FTUE.fireSeenIn, 15);
eq('R24: the ores carry the turn', /\{ id:'iron',[^\n]*len:200, rot:-30,/.test(src) && /\{ id:'manganese',[^\n]*len:258, rot:30,/.test(src)
  && /function normalizeOrePaths\(\)\{[\s\S]{0,900}if\(o\.rot\)\{/.test(src), true);
eq('R24: Balanced moves after the map is built, its value kept', /const bt=traits\.find\(t=>t\.trait && t\.trait\.id==='balanced'\); if\(bt\)\{ bt\.x=FTUE\.balancedAt\.x; bt\.y=FTUE\.balancedAt\.y; bt\.el\.setAttribute/.test(src)
  && !/bt\.value=/.test(src), true);
eq('R24: Fire keeps its old value (prices unchanged)', src.includes('ft.value=traitValue(824, 1016);'), true);
eq('R24: at the first three ores\' end, D71 straight away (Fire is out of sight)', /function tutFireSpot\(\)\{[\s\S]{0,600}say\('D71'\);\s*\}/.test(src)
  && !/function tutFireSpot\(\)\{[^}]*say\('D70'\)/.test(src), true);
eq('R24: D70 and D70a when Fire comes into view', src.includes("if(!f || Math.hypot(p.x-f.x, p.y-f.y) > revealR()-FTUE.fireSeenIn) return;")
  && /function tutFireSeen\(\)\{ if\(TUT_STAGE!=='fire-heat2' \|\| TUT_SAIDSEEN\) return;[\s\S]{0,400}tutSpotOn\(f\);[\s\S]{0,200}sayQueue\('D70','D70a'\);/.test(src), true);
eq('R24: D70a text, beside D70', line('D70a'), "Let's finish it with one ground iron.");
eq('R24: D70a follows D70', (() => { const ks = [...src.matchAll(/\n\s*(D\d+[a-z]?): "/g)].map(x => x[1]); return ks[ks.indexOf('D70a') - 1]; })(), 'D70');
eq('R24: D70a asks for the iron (stage fire-iron, its arrow)', src.includes("if(id==='D70a') setTimeout(tutFireIronAsk, 0);")
  && src.includes("function tutFireIronAsk(){ if(TUT_STAGE!=='fire-heat2') return; TUT_STAGE='fire-iron';")
  && src.includes("if(TUT_STAGE==='fire-iron') return segs.filter(g=>g.ore==='iron').length<3 ? 'iron' : false;")
  && src.includes("if(TUT_STAGE==='fire-grind' || TUT_STAGE==='fire-iron'){")
  && /const TUT_TICK_STAGES=\[[^\]]*'fire-iron'/.test(src) && /const FIRE_STAGES=\[[^\]]*'fire-iron'/.test(src), true);
eq('R24: the ground iron in, back to the bellows', src.includes("else if(_fireStage==='fire-iron') tutFireIronIn();")
  && src.includes("function tutFireIronIn(){ if(TUT_STAGE!=='fire-iron' || fireOreWanted()!==false) return; TUT_STAGE='fire-heat2';"), true);
/* R24 geometry: the paths as the build draws them (scaled to len, then turned), measured here the way the build does */
{ const START = { x: 1400, y: 1030 }, EPIC = 9, FINE = 20, MAX = 34, SIGHT = 120;
  const ore = id => { const r = src.match(new RegExp("\\{ id:'" + id + "',[^\\n]*?len:(\\d+), rot:(-?\\d+),[^\\n]*?d:'([^']+)'")); return { len: +r[1], rot: +r[2], v: r[3].match(/-?\d+(\.\d+)?/g).map(Number) }; };
  const path = id => { const o = ore(id), v = o.v, pts = []; let x0 = v[0], y0 = v[1];
    for (let i = 2; i + 5 < v.length; i += 6) { const [a, b, c, d, e, f] = v.slice(i, i + 6);
      for (let k = (pts.length ? 1 : 0); k <= 400; k++) { const t = k / 400, u = 1 - t;
        pts.push({ x: u*u*u*x0 + 3*u*u*t*a + 3*u*t*t*c + t*t*t*e, y: u*u*u*y0 + 3*u*u*t*b + 3*u*t*t*d + t*t*t*f }); }
      x0 = e; y0 = f; }
    let L = 0; const cum = [0]; for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y); cum.push(L); }
    const k = o.len / L, A = o.rot * Math.PI / 180, cs = Math.cos(A), sn = Math.sin(A);
    const P = pts.map(p => ({ x: (p.x*cs - p.y*sn) * k, y: (p.x*sn + p.y*cs) * k })), C = cum.map(c => c * k);
    return f => { const want = f * o.len; const i = C.findIndex(c => c >= want - 1e-9); if (i <= 0) return P[Math.max(0, i)]; const t = (want - C[i-1]) / (C[i] - C[i-1]);
      return { x: P[i-1].x + (P[i].x - P[i-1].x) * t, y: P[i-1].y + (P[i].y - P[i-1].y) * t }; }; };
  const at = { iron: path('iron'), manganese: path('manganese') };
  const end = seq => seq.reduce((o, [id, f]) => { const p = at[id](f); return { x: o.x + p.x, y: o.y + p.y }; }, START);
  const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
  const B = FTUE.balancedAt, Fi = FTUE.fireAt;
  eq('R24 geometry: full 1 iron + 1 manganese ends on Balanced (Epic)', dist(end([['iron', 1], ['manganese', 1]]), B) <= EPIC, true);
  eq('R24 geometry: raw 2 iron + 2 manganese ends on Balanced (Epic)', dist(end([['iron', .5], ['iron', .5], ['manganese', .5], ['manganese', .5]]), B) <= EPIC, true);
  eq('R24 geometry: TC2\'s raw 1 + 1 still misses Balanced', dist(end([['iron', .5], ['manganese', .5]]), B) > MAX, true);
  const pre = [['iron', 1], ['iron', 1], ['manganese', 1]], three = end(pre);
  eq('R24 geometry: at the first three ores\' end Fire is out of sight (D71, no D70)', dist(three, Fi) > SIGHT + 30, true);
  let near = 1e9; for (let i = 0; i <= 600; i++) { const p = at.manganese(i / 600); near = Math.min(near, dist({ x: three.x + p.x, y: three.y + p.y }, Fi)); }
  eq('R24 geometry: the manganese path brings Fire into view (D70)', near <= SIGHT - FTUE.fireSeenIn, true);
  const dFire = dist(end(pre.concat([['manganese', 1], ['iron', 1]])), Fi);
  eq('R24 geometry: the full route ends on Fire, Fine (D76: not perfect)', dFire > EPIC && dFire <= FINE, true); }
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
/* R19 (owner, 2026-10-28): the waiting customer's guide only with nobody at the counter, and only when the blueprints can be bought */
eq('no customer at the counter, nor one still saying goodbye (a sale\'s coins are still flying then)',
  /function wqFree\(\)\{ if\(SAY_ON \|\| document\.querySelector\('\.sf-modal\.show'\)\) return false; const P=FTUE\.parts\[FTUE_ST\.part\];\s*if\(CUSTOMER \|\| CUST_BYE\) return false;/.test(src), true);
eq('can buy: the gold covers the blueprints still to buy, and the market sells each (open, trait discovered)',
  src.includes("function wqCanBuy(){ return GOLD>=wqNeed() && wqOrder().every(it=>{ const c=marketCtx(it.trait, it.shape); return c.owned || (c.open && c.known); }); }"), true);
eq('see: D107f once they can be bought', src.includes("if(FTUE_ST.wq===''){ const need=wqNeed(); if(!need){ FTUE_ST.wq='craft'; return; } if(wqCanBuy() && wqFree()) wqStep('see', 'D107f'); return; }"), true);
eq('craft: closing the ledger (r291: D107g comes over the ore reward)', src.includes("if(FTUE_ST.wq==='see'){ FTUE_ST.wq='craft'; wqLit(); ftueOreReward('gc9'); }"), true);
eq('call: both swords in the bag', src.includes("if(FTUE_ST.wq==='craft'){ if(wqHave() && wqFree()) wqStep('call', 'D107h'); return; }"), true);
eq('the lights: ledger, then the request, then YES (call only)', src.includes("function wqLit(){") && src.includes("'#sfWaitModal .wt-yes'") && src.includes("'#lbWait .lb-wreq'"), true);
eq('served: the guide ends (only once it has started - before part 4 nobody waits)', src.includes("if(!e){ if(FTUE_ST.wq && FTUE_ST.wq!=='done' && !wqAtCounter()) FTUE_ST.wq='done'; wqLit(); return; }"), true);
eq('it runs every frame', /function updateHintArrow\(\)\{[\s\S]{0,1200}wqTick\(\);/.test(src), true);
/* owner, 2026-10-14: the Durable craft's mug pointer stayed after the trait was in (also TC4's, GC8's) */
eq('after the gate, the guide takes the metal to the anvil (R5)', src.includes("function ftueDurQuenched(){ tutArrow(null,null); tutUnglow(); setTimeout(()=>tutArrow('#orb', '#stAnvil .anvil', { tfx:0.5, tfy:0.20, bow:0.16, back:26 }), 0); }")
  && src.includes("if(TUT_STAGE==='p3-dur-heat' || TUT_STAGE==='p4-quench' || TUT_STAGE==='p4-weak-quench') ftueDurQuenched();"), true);
eq('the Durable guide no longer re-points at the mug once Durable is on (R5: after the gate the metal is hot - the shared pointer takes it to the anvil; the old on-the-anvil branch is gone)', !src.includes("if(melt.traits.some(a=>a.t && a.t.id==='durable')) return;"), true);
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
  eq('no gate step any more (R1)', keys.includes('gate'), false);
  const E = {   /* stage: [done, next] - the record of what "already done" means */
    'ore':            ["ftueOreIn('iron')>=2 && ftueOreIn('manganese')>=2", 'tutCheckOre()'],
    'bellows':        ['!!melt && !!melt.reachedTrait', 'tutTravelOnTrait()'],   /* R1: pumped onto the trait already */
    'anvil':          ["!!melt && melt.stage==='onAnvil'", 'tutAnvilShape()'],   /* R1: the metal is on the anvil already */
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
  eq('the second craft waits for D38 to close, then for the sword on Balanced (R3: gateReady is the trait now)', /'regrind-heat':\s*\{ quiet:true, done:\(\)=>!!melt && \(melt\.stage!=='smelting' \|\| gateReady\), next:\(\)=>tutGateStep\(\) \}/.test(blk), true);
  eq('grinding early: ground on the wheel, or already in the smelter', blk.includes("'regrind-grind':") && blk.includes("done:()=>(!!prep && prep.grind>=0.999) || tutGroundIn('iron')"), true);
  eq('the hammer opened early, for every shape step', ['fire-shape', 'd2-gale-shape', 'bram2-shape'].every(k => blk.includes("'" + k + "':   { done:()=>tutHmOpen(), next:()=>tutHmStep() }")), true);
  eq('a pickaxe point spent before the tree lesson counts', blk.includes("'d2-skill':") && blk.includes("done:()=>FTUE_ST.part===6 && rank('pick')>=1 && !TUT_D2_SPENT, next:()=>{ TUT_D2_SPENT=true; }"), true);
  eq('"go to X" while already on X: the arrival runs again', ['to-bed:bedroom', 'g-forge:forge', 'p3-dur-cave:cave', 'd2-d3cave:cave', 'to-basement:basement', 'dec-back:customer', 'counter-guide:customer', 'to-forge:forge']
    .every(p => { const [k, v] = p.split(':'); return scr.includes("'" + k + "':'" + v + "'"); }), true);
  eq('screen entries wait for the line and replay goScreen\'s arrival', src.includes("function tutArriveHere(){ const name=SF_SCREEN; if(name==='forge' && TUT_STAGE==='to-forge'){ tutDone(); setTimeout(tutForgeAgain, 450); return; } if(name==='customer') tutCounterArrival(); tutScreenArrived(name); }")
    && src.includes("Object.keys(TUT_SKIP_SCREEN).forEach(k=>{ TUT_SKIP[k]={ quiet:true, done:()=>SF_SCREEN===TUT_SKIP_SCREEN[k], next:tutArriveHere }; });"), true);
  eq('a quiet entry waits while a line is up', src.includes("if(!e || TUT_SKIP_TRIED===st || (e.quiet && SAY_ON)) return;"), true);
  /* the market: a blueprint the player already owns is not bought again (it looped: buy -> close -> ask) */
  eq('owned blueprint: no purchase, straight to the craft (r300)', src.includes("function ftueMarketOwned(){ const m=FTUE_MK; return !!(m && m.step==='shape' && FTUE_ST.shapes[m.o.trait+':'+m.o.shape]); }")
    && src.includes("if(nudge) typeAfter(()=>{ if(ftueMarketOwned()){ FTUE_MK=null; ftueOrderGo(o); return; }"), true);
  eq('closeMarket and the skip share one ending', /function closeMarket\(\)\{[\s\S]{0,300}if\(m && m\.step==='done'\) ftueMarketDone\(m\);/.test(src), true);
}
/* D28a must sit beside D28, never at the end: lastLine() is the map's final key */
const keys = [...src.matchAll(/\n\s*(D\d+[a-z]?): "/g)].map(x => x[1]);
eq('D28a follows D27 (r287: D28 removed)', keys[keys.indexOf('D28a') - 1], 'D27');
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
eq('rail buttons blink like the tabs (R26: MARKET only; the gear, the book and the basket glow along their art)', src.includes('#diaryBtn.tut-blink, #questBtn.tut-blink, #settingsBtn.tut-blink { animation: tutGlow 1.15s ease-in-out infinite; }') && src.includes('#marketBtn.tut-blink { animation: tutBlinkTab 1.1s ease-in-out infinite; }'), true);
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
eq('the book guide re-runs when a window closes', src.includes("return [SF_SCREEN, bk && bk.classList.contains('show') ? 1:0, CB_SEL, custOrderReady()?1:0, COUNTER?1:0, ftueBookModal()?1:0, traitCardOpen()?1:0].join(','); }")
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

/* r302 (owner, 2026-10-21): the intro - four pictures before D1, the old portrait intro's texts ("The intro") */
eq('the intro slides, in story order', FTUE.intro.slides, [
  { img: 'assets/Illustrations/intro_1_fall.webp', title: 'The Fall',
    text: 'The monsters arrived without warning. By dawn, my ancestral home was nothing but ash and bone. Everything I ever loved was consumed by the horde.' },
  { img: 'assets/Illustrations/intro_2_exile.webp', title: 'Exile',
    text: "I wandered for weeks through cursed, twilight wilderness. Cold, starving, and hollowed by grief, with only my father's heavy iron anvil hammer remaining at my side." },
  { img: 'assets/Illustrations/intro_3_hearth.webp', title: 'A New Hearth',
    text: "At the remote edge of Oakhaven, I stumbled across it: an old, long-abandoned forge. The grand hearth was cold and choked with soot, waiting for a master's spark." },
  { img: 'assets/Illustrations/intro_4_anvil.webp', title: 'The Anvil Awaits',
    text: 'My destiny is unwritten. I will master the flames, rebuild my legacy, and become the greatest blacksmith this world has ever seen. The work begins now.' } ]);
eq('the intro prompts', [FTUE.intro.tap, FTUE.intro.last, FTUE.intro.skip], ['TAP TO CONTINUE', 'TAP TO BEGIN', 'SKIP']);
eq('the intro texts are the old intro\'s, word for word', (() => { const v2 = readFileSync('swordforgeV2.html', 'utf8');
  return FTUE.intro.slides.every(sl => v2.includes('<h2>' + sl.title + '</h2>') && v2.includes('<p>' + sl.text + '</p>')); })(), true);
eq('every intro picture is on disk', FTUE.intro.slides.every(sl => existsSync(sl.img)), true);
eq('the intro overlay is in the frame, with SKIP', /<div id="frame" class="landscape">[\s\S]*<div id="sfIntro"[^>]*>[\s\S]{0,400}<button type="button" id="introSkip"/.test(src), true);
eq('D1 waits for the intro: load opens it, its end speaks D1', /function initMechanics\(\)\{[\s\S]{0,1600}if\(!introOpen\(\)\) setTimeout\(sayStart, 600\);/.test(src)
  && /function introEnd\(\)\{[\s\S]{0,300}setTimeout\(sayStart, 600\);/.test(src), true);
eq('a new game or a PART jump closes the intro without replaying it', /function newGame\(\)\{[\s\S]{0,200}introClose\(\);/.test(src), true);
eq('a tap moves on, a tap during the fade is ignored, the last tap ends it', /function introNext\(\)\{ if\(INTRO_BUSY\) return;[\s\S]{0,200}introEnd\(\)/.test(src), true);

/* R25 (owner, 2026-10-28): the forge's craft frame - the wood, the inkpot, the craft book and the pulley ring
   (specs/2026-10-28-forge-screen-new-look.md) */
{ const m = src.match(/const CRAFT_FRAME=(\{[\s\S]*?\});/);
  eq('R25: CRAFT_FRAME is the record', m && new Function('return ' + m[1])(), {
    w: 148, left: 4, top: -12, shut: 63.3, art: 'assets/ui/craft_window_frame.webp',
    slots:  { l: 11.6, t: 8.0,  w: 76.4, h: 12.4 },
    cancel: { l: 63.5, t: 21.4, w: 22.9, h: 14.1 },
    record: { l: 17.4, t: 25.1, w: 33.7, h: 28.9, art: 'assets/ui/inkpot.webp' },
    book:   { l: 8.0,  t: 54.0, w: 83.3, h: 17.9, art: 'assets/ui/craftbook.webp' },
    ring:   { l: 17.0, t: 76.7, w: 20.5, h: 22.3, art: 'assets/ui/craft_window_frame_pulley.webp' } }); }
eq('R25: the art is on disk (webp beside each png)', ['craft_window_frame', 'craft_window_frame_pulley', 'craftbook', 'inkpot']
  .every(k => existsSync('assets/ui/' + k + '.png') && existsSync('assets/ui/' + k + '.webp')), true);
eq('R25: one panel holds the slots, the X, the inkpot, the book and the ring (the old ids)',
  /<div id="bladePanel">\s*<div id="traitSlots"[^>]*><\/div>\s*<button id="cancelCraft"[^>]*>[^<]*<\/button>\s*<button id="saveBlade"[^>]*><\/button>\s*<button id="recipeBtn"[^>]*><\/button>\s*<button id="hudToggle"[^>]*><\/button>\s*<\/div>/.test(src), true);
eq('R25: no text buttons left (RECORD CRAFT, CRAFT BOOK, the chevrons)', !src.includes('💾 RECORD CRAFT') && !/id="recipeBtn"[^>]*>CRAFT BOOK/.test(src)
  && !/function toggleHud\(\)\{[\s\S]{0,400}&#9660;/.test(src), true);
eq('R25: closed, the frame slides up by shut % of its height', src.includes("#hud.collapsed #bladePanel { transform: translateY(calc(var(--cf-shut) * -1%)); }")
  && src.includes("p.style.setProperty('--cf-shut', CRAFT_FRAME.shut);"), true);
eq('R25: each box is placed from CRAFT_FRAME, its art inside it lined up with the canvas', /function wireCraftFrame\(\)\{[\s\S]{0,1600}im\.style\.width=\(100\*100\/b\.w\)\+'%'; im\.style\.height=\(100\*100\/b\.h\)\+'%'; im\.style\.left=\(-100\*b\.l\/b\.w\)\+'%'; im\.style\.top=\(-100\*b\.t\/b\.h\)\+'%';/.test(src), true);
eq('R25: the ring - a tap toggles, a pull down opens, a push up closes', /function wireRing\(tg\)\{[\s\S]{0,700}Math\.abs\(dy\)<12 \? !open : dy>0/.test(src)
  && src.includes('wireRing(tg);'), true);
eq('R25: the inkpot, the book and the ring glow along their art', src.includes('#saveBlade.tut-blink, #recipeBtn.tut-blink, #hudToggle.tut-blink { animation: tutGlow 1.15s ease-in-out infinite; }'), true);
eq('R25: the toast names the inkpot', src.includes("toast('Record this craft first \\u2014 tap the <b>inkpot</b>')"), true);

/* R26 (owner, 2026-10-28): the right rail, the bedroom calendar, the market on the counter (specs/2026-10-28-forge-screen-new-look.md) */
{ const m = src.match(/const RAIL_ART=(\{[\s\S]*?\});/);
  eq('R26: RAIL_ART is the record', m && new Function('return ' + m[1])(), {
    diary: { left: 17, top: 537, w: 57, art: 'assets/ui/diary.webp' },
    quest: { left: 58, top: 478, w: 79, art: 'assets/ui/questbasket.webp' },
    gear:  { right: 4, bottom: 2, size: 40 },
    cal:   { l: 24.5, t: 27, w: 6.5, h: 13 } }); }
eq('R26: the art is on disk', ['diary', 'questbasket'].every(k => existsSync('assets/ui/' + k + '.png') && existsSync('assets/ui/' + k + '.webp')) && existsSync('assets/ui/icon_skilltree.webp'), true);
eq('R26: the skill tree takes the day tile\'s place, with its level, points and xp', /<div class="statRow">\s*<button id="skillBtn" type="button" title="Skill Tree"><img class="sk-art" src="assets\/ui\/icon_skilltree\.webp" alt=""><span class="sk-lv" id="skillLv">Lv 1<\/span><span class="sk-xp"><i id="skillXpFill"><\/i><\/span><\/button>/.test(src)
  && !src.includes('class="dayTile"') && !src.includes('class="statRow2"'), true);
eq('R26: no MARKET on the rail', !/<div id="rail">[\s\S]*?id="marketBtn"[\s\S]*?<!-- ===== Shape select/.test(src), true);
eq('R26: the gear sits in the frame\'s corner, outside the rail', /<\/div>\s*<button id="settingsBtn" type="button" title="Menu" aria-label="Menu">&#9881;<\/button>\s*<!-- ===== Shape select/.test(src)
  && src.includes('#frame.landscape > #settingsBtn {'), true);
eq('R26: the book and the basket are the diary and quest buttons', src.includes('<button id="diaryBtn" type="button" title="Diary" aria-label="Diary"></button>')
  && src.includes('<button id="questBtn" type="button" title="Quests" aria-label="Quests"></button>')
  && /function wireRailArt\(\)\{[\s\S]{0,900}\[\['diary','diaryBtn'\],\['quest','questBtn'\]\]/.test(src) && src.includes('wireRailArt();   /* R26 */'), true);
eq('R26: the basket\'s claim glow follows the art', /#questBtn\.qs-ready \{[^}]*filter: drop-shadow/.test(src) || /#questBtn\.qs-ready \{[^}]*animation: qsReadyArt/.test(src), true);
eq('R26: the day is a calendar on the bedroom wall, holding #dayNum', /<div id="calendar"><span class="cal-h">DAY<\/span><span class="n" id="dayNum">1<\/span><\/div>/.test(src)
  && src.includes('#screenLayer.sc-bedroom #calendar { display: flex; }') && src.split('id="dayNum"').length === 2, true);
eq('R26: the calendar is placed from RAIL_ART.cal', /function wireRailArt\(\)\{[\s\S]{0,1400}const c=document\.getElementById\('calendar'\)[\s\S]{0,200}c\.style\.left=RAIL_ART\.cal\.l\+'%';/.test(src), true);
eq('R26: MARKET on the customer counter, under CRAFT BOOK, with the old id', src.includes("{ x:0.79, y:10.2, w:8.20, h:8.47, gl:'&#128722;', cap:'MARKET', title:'Market', act:'market', id:'marketBtn' }")
  && src.includes("if(b.id) el.id=b.id;") && src.includes("else if(b.act==='market') el.addEventListener('click', openMarket);")
  && /function buildScreenUi\(name\)\{[\s\S]{0,1400}marketBtnUi\(\);\s*\}/.test(src), true);

/* R27 (owner, 2026-10-28): D42 names the inkpot; 12 boxes above the quest basket, the fifth row fading behind it */
eq('R27: D42 names the inkpot', line('D42'), "Wait, since we discovered how to craft a 'balanced' sword using fewer ores, we should update our crafting process. It will be helpful later. Tap the inkpot to record the craft.");
eq('R27: 15 cells at least (12 above the basket, 3 fading behind it)', src.includes('const MAT_CELLS=15;'), true);
eq('R27: fixed 85 px rows, 5 px gap: four rows end above the basket', src.includes('grid-auto-rows: 85px; gap: 5px; padding: 0; align-content: start;'), true);
/* R27b (owner, 2026-10-28): "the gradient is supposed to be dark in color" - a dark overlay (the rail's #1b120c), not a fade to the parchment */
eq('R27b: the fifth row fades into the rail\'s dark, under the basket', src.includes("#matPanel::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 115px; z-index: 4; pointer-events: none; border-radius: 0 0 6px 6px; background: linear-gradient(to bottom, rgba(27,18,12,0) 0%, rgba(27,18,12,.85) 45%, #1b120c 75%); }")
  && !src.includes('mask-image: linear-gradient(to bottom, #000 360px'), true);

/* R28 (owner, 2026-10-29): "add a glow on the pulley to guide players to drag the window down so they can see the inkpot. once they
   record, guide them to click on the pulley again to close the window." */
eq('R28: the record step reads the frame\'s closed state (it slides, it is never hidden)', src.includes("const open=!document.getElementById('hud').classList.contains('collapsed');")
  && !/const panel=document.getElementById('bladePanel');s*const open=panel && getComputedStyle(panel).display/.test(src), true);
eq('R28: closed - the ring glows with the down arrow; open - the inkpot glows, no arrow', src.includes("tutExit(open ? '#saveBlade' : '#hudToggle'); tutDragOn(open ? null : '#hudToggle');"), true);
eq('R28: after recording - the ring glows, no arrow (a tap closes it)', src.includes("if(TUT_STAGE==='record-close'){ tutArrow(null,null); tutExit('#hudToggle'); tutDragOn(null); return; }"), true);
eq('R28: the guide notices the frame opening and closing', src.includes("document.getElementById('hud').classList.contains('collapsed')?0:1,") && !src.includes("panel? (getComputedStyle(panel).display!=='none'?1:0) : 0,"), true);
eq('R28: the down arrow slides down, its up head hidden', src.includes('#tutDrag.down { animation: tutDragDown 1.2s ease-in-out infinite; }')
  && src.includes('#tutDrag.down .g-up { display: none; } #tutDrag.down .g-down { display: inline; }') && src.includes("svg.classList.remove('up','updown','down'); svg.classList.add(g.kind, 'on');"), true);

console.log('[ftue] GREEN / ' + n + ' checks');
