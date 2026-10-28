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

/* 2. the traits: Balanced on the new iron + manganese meeting point, Fire 15 from the order choice's end (Fine) */
once("    fireAt: { x:824, y:1016 },", "    fireAt: { x:790, y:1103 },   /* path test: 3 iron + 2 manganese (full) end at (790.1, 1118.2) in either order; 15 away = Fine (D76) */\n    balancedAt: { x:1163, y:1036 },   /* path test: 1 iron + 1 manganese full ends at (1162.6, 1035.1), 2 + 2 raw at (1163.9, 1037.8): Epic, as before */");
once("    { const ft=traits.find(t=>t.trait && t.trait.id==='fire'); if(ft){ ft.x=FTUE.fireAt.x; ft.y=FTUE.fireAt.y; ft.value=traitValue(ft.x, ft.y);",
     "    /* path test: the value stays the main build's (Balanced keeps its own, Fire's is read at the main build's spot), so prices match */\n" +
     "    { const bt=traits.find(t=>t.trait && t.trait.id==='balanced'); if(bt){ bt.x=FTUE.balancedAt.x; bt.y=FTUE.balancedAt.y; bt.el.setAttribute('transform','translate('+bt.x+','+bt.y+')'); } }\n" +
     "    { const ft=traits.find(t=>t.trait && t.trait.id==='fire'); if(ft){ ft.x=FTUE.fireAt.x; ft.y=FTUE.fireAt.y; ft.value=traitValue(824, 1016);");

/* 3. the hazards: the big ribbon under the new iron leg goes; the D69 speck and the fork speck move */
once("    clear: [ { x:1154, y:748, kind:'island' } ],", "    clear: [ { x:1154, y:748, kind:'island' }, { x:1003.22, y:1179.18, kind:'ribbon' } ],   /* path test: the fire run's first three ores ran ~240 px through this ribbon (D69c says 'a small one') */");
once("    move: [ { kind:'speck', x:917.83, y:1003.27, to:{ x:866, y:1001 }, scale:0.75 } ]",
     "    /* path test: [0] the fork speck, on the iron-first side only; [1] the D69 speck, on the first three ores' manganese leg */\n" +
     "    move: [ { kind:'speck', x:917.83, y:1003.27, to:{ x:920, y:1146 }, scale:0.5625 }, { kind:'speck', x:1028.4, y:1016.22, to:{ x:1054, y:1158 }, scale:0.75 } ]");

/* 4. a 3 iron + 2 manganese fire route is 1116 long: keep the main build's pace (5 irons would double it) */
once("const ROUTE_FAST={ irons:5, mul:2 };", "const ROUTE_FAST={ irons:6, mul:2 };   /* path test: was 5; the fire route is 3 iron + 2 manganese now */");

/* 5. the fork: the last iron AND the last manganese, the order is the choice */
once("    if(TUT_STAGE==='fire-mang') return 'iron/manganese';   /* 2026-10-13: either - '/' lists the choices */",
     "    if(TUT_STAGE==='fire-mang'){ const n=id=>segs.filter(g=>g.ore===id).length;   /* path test: the last two, either first */\n" +
     "        return n('iron')<3 && n('manganese')<2 ? 'iron/manganese' : n('iron')<3 ? 'iron' : n('manganese')<2 ? 'manganese' : false; }");
once('    D71: "We need to go further. Let\'s add one more ore.",', '    D71: "We need to go further. Let\'s add two more ores.",   /* path test */');
once('    D72: "If we use iron, we will cross another hazard zone.",', '    D72: "If we add the iron first, we will cross another hazard zone.",   /* path test: the order is the choice */');
once('    D72a: "But the manganese can avoid it.",', '    D72a: "But if the manganese goes first, it can avoid it.",');
/* the preview: each order's two legs */
once("    const o=routeEnd(); measure.setAttribute('d', ORE_BY[id].d); const len=measure.getTotalLength(), n=Math.max(2, Math.round(len/10)); let d='';\n" +
     "    for(let i=0;i<=n;i++){ const p=measure.getPointAtLength(len*i/n); d+=(i?'L':'M')+(o.x+p.x).toFixed(1)+','+(o.y+p.y).toFixed(1)+' '; }\n",
     "    const o=routeEnd(); let d='', x=o.x, y=o.y;   /* path test: id first, then the other ore */\n" +
     "    [id, id==='iron' ? 'manganese' : 'iron'].forEach((oid,k)=>{ measure.setAttribute('d', ORE_BY[oid].d); const len=measure.getTotalLength(), n=Math.max(2, Math.round(len/10)); let e={x:0,y:0};\n" +
     "        for(let i=0;i<=n;i++){ const p=measure.getPointAtLength(len*i/n); e=p; if(k && !i) continue; d+=(d?'L':'M')+(x+p.x).toFixed(1)+','+(y+p.y).toFixed(1)+' '; }\n" +
     "        x+=e.x; y+=e.y; });\n");
/* the first of the two, ground: no line, the smelter. The second: D73 as before */
once("    if(!prep || ['iron','manganese'].indexOf(prep.ore)<0 || prep.grind < 0.999) return;\n    TUT_SAIDENOUGH=true;",
     "    if(!prep || ['iron','manganese'].indexOf(prep.ore)<0 || prep.grind < 0.999) return;\n" +
     "    if(String(fireOreWanted()).indexOf('/')>=0){ TUT_SAIDENOUGH=true; tutSpinOn(null); tutForkHide(); setTimeout(tutSmelterArrow, 0); return; }   /* path test: the first of the two */\n" +
     "    TUT_SAIDENOUGH=true;");
once("    if(TUT_STAGE!=='fire-mang') return;\n    TUT_STAGE='fire-heat2';",
     "    if(TUT_STAGE!=='fire-mang') return;\n" +
     "    { const want=fireOreWanted(); if(want){ TUT_SAIDENOUGH=false; tutArrow(null,null); tutSpinOn(null); setTimeout(()=>tutWheelArrow(want==='iron' ? 'Iron' : 'Manganese'), 0); return; } }   /* path test: one in - the other one next */\n" +
     "    TUT_STAGE='fire-heat2';");

/* 5b. D70 (owner, 2026-10-28: "the fire trait is in the fog of war when dragon points it out"): Fire is 238 from the
   first three ores' end, the sword sees 120. One fog hole of the sword's own size opens toward Fire, placed so the
   whole disc (TRAIT_R) and the fog's soft edge (24) clear; it overlaps the sword's own hole, so it reads as one view */
once("    if(f) tutSpotOn(f);   /* r113: a ring over the fog, and NO reveal */",
     "    if(f){ tutSpotOn(f); const p=swordPoint(), dx=p.x-f.x, dy=p.y-f.y, L=Math.hypot(dx,dy)||1, k=Math.max(0, revealR()-TRAIT_R-24)/L;\n" +
     "        reveal(f.x+dx*k, f.y+dy*k, 'firespot'); }   /* path test: the ring, and a glimpse of Fire through the fog */");

/* 6. the PART jumps' fire recipe is the full new route */
once("RECIPES.fire={ key:'fire', traits:[{ tid:'fire', tier:'Fine' }], ores:['iron','iron','manganese','manganese'], grinds:[1,1,1,1], at:Date.now() };",
     "RECIPES.fire={ key:'fire', traits:[{ tid:'fire', tier:'Fine' }], ores:['iron','iron','manganese','iron','manganese'], grinds:[1,1,1,1,1], at:Date.now() };   /* path test */");

/* 7. only the Balanced and Fire tutorial: the fire sword's sale ends it, free play follows */
once("    FTUE_ST.part=3; FTUE_ST.gpc=0;\n    ftueReward([], ()=>{\n        sayQueue('D87');\n        setTimeout(()=>tutExit('#panRight'), 0); });",
     "    /* path test: the tutorial stops here (owner: only the Balanced and Fire swords) */\n" +
     "    smFreePlay(); toast('Path test: the Balanced and Fire tutorial is done. Free play from here.');");

writeFileSync(ROOT + 'Swordforge_looptest_landscape_pathtest.html', s.replace(/\n/g, '\r\n'));
console.log('written');
