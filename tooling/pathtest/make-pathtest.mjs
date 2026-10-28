// Builds Swordforge_looptest_landscape_pathtest.html from the main build (owner, 2026-10-28: the rotated-path test).
// Record: specs/2026-10-28-rotated-ore-paths-test.md. Run from anywhere: node tooling/pathtest/make-pathtest.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('../../', import.meta.url));   /* the repo root */
let s = readFileSync(ROOT + 'Swordforge_looptest_landscape.html', 'utf8').replace(/\r\n/g, '\n');
function once(a, b) { const n = s.split(a).length - 1; if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 90)); s = s.replace(a, () => b); }

/* 0. title and the cheat bar: PART 1, PART 2 and the fire run only */
once('<title>Swordforge ' + String.fromCharCode(0x2014) + ' Loop Test</title>', '<title>Swordforge - Path Test</title>');   /* the main build's title carries a long dash */
once('<button type="button" class="cheatPart" onclick="toast(ftuePart(3))" title="New game at the start of FTUE part 3">PART 3</button><button type="button" class="cheatPart" onclick="toast(ftuePart(4))" title="New game at the start of FTUE part 4">PART 4</button><button type="button" class="cheatPart" onclick="toast(ftuePart(5))" title="New game at the start of FTUE part 5">PART 5</button><button type="button" class="cheatPart" onclick="toast(ftuePart(6))" title="New game at the start of FTUE part 6">PART 6</button>',
  '<button type="button" class="cheatPart" onclick="toast(ftuePart(3))" title="New game with TC3 at the bell: the fire sword run">FIRE RUN</button><span class="cheatPart" style="pointer-events:none;opacity:.8">PATH TEST</span>');

/* 1. the paths: iron turns 30 degrees anticlockwise, manganese 30 clockwise (on screen) */
once("{ id:'iron',      name:'Iron',      color:'#8a5a33', img:'assets/forge/iron_ore.webp',      len:200, ",
     "{ id:'iron',      name:'Iron',      color:'#8a5a33', img:'assets/forge/iron_ore.webp',      len:200, rot:-30, /* path test (owner, 2026-10-28): 30 deg anticlockwise on screen */ ");
once("{ id:'manganese', name:'Manganese', color:'#6f6a72', img:'assets/forge/gale_ore.webp',      len:258, ",
     "{ id:'manganese', name:'Manganese', color:'#6f6a72', img:'assets/forge/gale_ore.webp',      len:258, rot:30, /* path test: 30 deg clockwise on screen */ ");
once("        o.d=o.d.replace(/-?\\d+(\\.\\d+)?/g, n=>{ const v=parseFloat(n)*k; return (Math.round(v*100)/100).toString(); });\n",
     "        o.d=o.d.replace(/-?\\d+(\\.\\d+)?/g, n=>{ const v=parseFloat(n)*k; return (Math.round(v*100)/100).toString(); });\n" +
     "        /* path test: turn the whole path about its origin (y points down, so +deg is clockwise on screen). The d is M/C pairs only. */\n" +
     "        if(o.rot){ const a=o.rot*Math.PI/180, c=Math.cos(a), sn=Math.sin(a), v=o.d.match(/-?\\d+(\\.\\d+)?/g).map(Number); let i=0;\n" +
     "            o.d=o.d.replace(/-?\\d+(\\.\\d+)?/g, ()=>{ const j=i++, x=v[j&~1], y=v[j|1], r=(j&1) ? x*sn+y*c : x*c-y*sn; return (Math.round(r*100)/100).toString(); }); }\n");

/* 2. the traits: Balanced on the new iron + manganese meeting point; Fire 17.7 from the fire route's end (Fine), on the
   side the manganese leg passes, so that leg comes within 100 of it (the sword sees 120) */
once("    fireAt: { x:824, y:1016 },", "    fireAt: { x:807, y:1113 },   /* path test: 2 iron + 1 manganese, then manganese, then iron (full) end at (790.1, 1118.2): 17.7 away = Fine (D76) */\n    balancedAt: { x:1163, y:1036 },   /* path test: 1 iron + 1 manganese full ends at (1162.6, 1035.1), 2 + 2 raw at (1163.9, 1037.8): Epic, as before */");
once("    { const ft=traits.find(t=>t.trait && t.trait.id==='fire'); if(ft){ ft.x=FTUE.fireAt.x; ft.y=FTUE.fireAt.y; ft.value=traitValue(ft.x, ft.y);",
     "    /* path test: the value stays the main build's (Balanced keeps its own, Fire's is read at the main build's spot), so prices match */\n" +
     "    { const bt=traits.find(t=>t.trait && t.trait.id==='balanced'); if(bt){ bt.x=FTUE.balancedAt.x; bt.y=FTUE.balancedAt.y; bt.el.setAttribute('transform','translate('+bt.x+','+bt.y+')'); } }\n" +
     "    { const ft=traits.find(t=>t.trait && t.trait.id==='fire'); if(ft){ ft.x=FTUE.fireAt.x; ft.y=FTUE.fireAt.y; ft.value=traitValue(824, 1016);");

/* 3. the hazards: the big ribbon under the new iron leg goes; the D69 speck and the fork speck move */
once("    clear: [ { x:1154, y:748, kind:'island' } ],", "    clear: [ { x:1154, y:748, kind:'island' }, { x:1003.22, y:1179.18, kind:'ribbon' } ],   /* path test: the fire run's first three ores ran ~240 px through this ribbon (D69c says 'a small one') */");
once("    move: [ { kind:'speck', x:917.83, y:1003.27, to:{ x:866, y:1001 }, scale:0.75 } ]",
     "    /* path test: [0] the fork speck, on the 4th ore's iron path only; [1] the D69 speck, on the first three ores' manganese leg */\n" +
     "    move: [ { kind:'speck', x:917.83, y:1003.27, to:{ x:920, y:1146 }, scale:0.5625 }, { kind:'speck', x:1028.4, y:1016.22, to:{ x:1054, y:1158 }, scale:0.75 } ]");

/* 4. a 3 iron + 2 manganese fire route is 1116 long: keep the main build's pace (5 irons would double it) */
once("const ROUTE_FAST={ irons:5, mul:2 };", "const ROUTE_FAST={ irons:6, mul:2 };   /* path test: was 5; the fire route is 3 iron + 2 manganese now */");

/* 5. the fire run (owner, 2026-10-28): after the first three ores D71 asks for one more; D72 / D72a compare the iron and
   manganese paths as in the main build, and only manganese is taken (it avoids the hazard). On its path Fire comes into
   the sword's view: D70, then D70a asks for a ground iron to finish. */
once("    if(TUT_STAGE==='fire-mang') return 'iron/manganese';   /* 2026-10-13: either - '/' lists the choices */",
     "    if(TUT_STAGE==='fire-mang') return segs.filter(g=>g.ore==='manganese').length<2 ? 'manganese' : false;   /* path test: the manganese avoids the hazard */\n" +
     "    if(TUT_STAGE==='fire-iron') return segs.filter(g=>g.ore==='iron').length<3 ? 'iron' : false;   /* path test: the ground iron that finishes it */");
once("const FIRE_STAGES=['fire-grind','fire-heat1','fire-spot','fire-reheat','fire-mang','fire-heat2',",
     "const FIRE_STAGES=['fire-grind','fire-heat1','fire-spot','fire-reheat','fire-mang','fire-heat2','fire-iron',");
once("const TUT_FIRE_BUILD = ['fire-grind','fire-heat1','fire-spot','fire-reheat','fire-mang','fire-heat2'];",
     "const TUT_FIRE_BUILD = ['fire-grind','fire-heat1','fire-spot','fire-reheat','fire-mang','fire-heat2','fire-iron'];");
once("|| TUT_STAGE==='fire-mang'; }", "|| TUT_STAGE==='fire-mang' || TUT_STAGE==='fire-iron'; }");
once("const TUT_TICK_STAGES=['record','record-close','fire-heat1','fire-heat2',", "const TUT_TICK_STAGES=['record','record-close','fire-heat1','fire-heat2','fire-iron',");
once("    if(TUT_STAGE==='fire-grind'){\n", "    if(TUT_STAGE==='fire-grind' || TUT_STAGE==='fire-iron'){   /* path test: the finishing iron points the same way */\n");
/* at the first three ores' end: D71 straight away (D70 waits for Fire to come into view) */
once("    const f=traits.find(t=>t.trait && t.trait.id==='fire');\n    if(f) tutSpotOn(f);   /* r113: a ring over the fog, and NO reveal */\n" +
     "    ['D70','D71'].forEach(id=>{ if(SAY_SEQ.indexOf(id)<0) SAY_SEQ.push(id); });\n    SAY_I=SAY_SEQ.indexOf('D70'); say('D70');",
     "    if(SAY_SEQ.indexOf('D71')<0) SAY_SEQ.push('D71');   /* path test: Fire is out of sight here; D70 plays when it comes into view */\n    SAY_I=SAY_SEQ.indexOf('D71'); say('D71');");
/* D72a closed: the manganese, not the grindstone in general */
once("function tutForkDone(){ tutForkHide(); tutNeedTab(0); if(!prep) tutArrow(null, '#stMortar .mortar'); }",
     "function tutForkDone(){ tutForkHide(); tutNeedTab(0); if(!prep) tutWheelArrow('Manganese'); }   /* path test: manganese only */");
/* the manganese in: the iron stays in the bag for the finish */
once("    ORE_COUNT.iron=0; ORE_COUNT.manganese=0; if(INV_TAB===0) buildShelf();   /* r291 (owner): the ore not chosen is removed */",
     "    /* path test: the last iron stays in the bag - it finishes the route (D70a) */");
/* Fire comes into view on the manganese path: D70 with the ring, then D70a */
once("function tutTravelHooks(){ tutFireSpot(); tutFireReached(); tutDay2Pull(); tutGaleEnd(); }",
     "function tutTravelHooks(){ tutFireSpot(); tutFireSeen(); tutFireReached(); tutDay2Pull(); tutGaleEnd(); }\n" +
     "/* path test: Fire's centre this far inside the sword's sight counts as seen (the manganese path comes within 100) */\n" +
     "const FIRE_SEEN_IN=15; let TUT_SAIDSEEN=false;\n" +
     "function tutFireSeen(){ if(TUT_STAGE!=='fire-heat2' || TUT_SAIDSEEN) return;\n" +
     "    const f=traits.find(t=>t.trait && t.trait.id==='fire'), p=swordPoint(); if(!f || Math.hypot(p.x-f.x, p.y-f.y) > revealR()-FIRE_SEEN_IN) return;\n" +
     "    TUT_SAIDSEEN=true; tutArrow(null,null); tutSpotOn(f);\n" +
     "    ['D70','D70a'].forEach(id=>{ if(SAY_SEQ.indexOf(id)<0) SAY_SEQ.push(id); }); sayQueue('D70','D70a'); }\n" +
     "/* D70a closed: the ground iron that finishes it */\n" +
     "function tutFireIronAsk(){ if(TUT_STAGE!=='fire-heat2') return; TUT_STAGE='fire-iron'; tutSpotOn(null); tutNeedTab(0); tutNudge(true); }\n" +
     "function tutFireIronIn(){ if(TUT_STAGE!=='fire-iron' || fireOreWanted()!==false) return; TUT_STAGE='fire-heat2'; tutArrow(null,null); tutSpinOn(null); setTimeout(()=>tutNudge(true), 0); }");
once("    if(id==='D71') setTimeout(tutFireBack, 0);",
     "    if(id==='D70a') setTimeout(tutFireIronAsk, 0);   /* path test */\n    if(id==='D71') setTimeout(tutFireBack, 0);");
once("    if(_fireStage==='fire-grind') tutFireSmelted(); else if(_fireStage==='fire-mang') tutFireSmelted2();",
     "    if(_fireStage==='fire-grind') tutFireSmelted(); else if(_fireStage==='fire-mang') tutFireSmelted2(); else if(_fireStage==='fire-iron') tutFireIronIn();   /* path test */");
once('    D70: "Do you see that? I think that is the fire trait!",',
     '    D70: "Do you see that? I think that is the fire trait!",\n    D70a: "Let\'s finish it with one ground iron.",   /* path test (owner, 2026-10-28) */');
/* D70 is a look-at-this line (r184): no bellows pointer over it or D70a */
once("    if(TUT_STAGE==='fire-heat1' || TUT_STAGE==='fire-heat2'){ tutLoopPointer('fire', true); return; }",
     "    if(TUT_STAGE==='fire-heat1' || TUT_STAGE==='fire-heat2'){ if(SAY_ON==='D70' || SAY_ON==='D70a'){ tutArrow(null,null); return; } tutLoopPointer('fire', true); return; }   /* path test */");

/* 6. the PART jumps' fire recipe is the full new route */
once("RECIPES.fire={ key:'fire', traits:[{ tid:'fire', tier:'Fine' }], ores:['iron','iron','manganese','manganese'], grinds:[1,1,1,1], at:Date.now() };",
     "RECIPES.fire={ key:'fire', traits:[{ tid:'fire', tier:'Fine' }], ores:['iron','iron','manganese','manganese','iron'], grinds:[1,1,1,1,1], at:Date.now() };   /* path test */");

/* 7. only the Balanced and Fire tutorial: the fire sword's sale ends it, free play follows */
once("    FTUE_ST.part=3; FTUE_ST.gpc=0;\n    ftueReward([], ()=>{\n        sayQueue('D87');\n        setTimeout(()=>tutExit('#panRight'), 0); });",
     "    /* path test: the tutorial stops here (owner: only the Balanced and Fire swords) */\n" +
     "    smFreePlay(); toast('Path test: the Balanced and Fire tutorial is done. Free play from here.');");

writeFileSync(ROOT + 'Swordforge_looptest_landscape_pathtest.html', s.replace(/\n/g, '\r\n'));
console.log('written');
