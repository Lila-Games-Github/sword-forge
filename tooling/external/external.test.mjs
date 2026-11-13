/* R115 (owner, 2026-11-12): the external tester copy. Record: specs/2026-11-12-external-build.md.
   Run: node tooling/external/external.test.mjs */
import fs from 'node:fs';
import assert from 'node:assert';
import { makeExternal } from './make-external.mjs';
let n = 0;
const eq = (name, a, b) => { assert.deepStrictEqual(a, b, name); n++; console.log('  ok   ' + name); };
const src = fs.readFileSync(new URL('../../Swordforge_looptest_landscape.html', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

eq('the main build has the switch once, on', src.split('const DEV=true;').length - 1, 1);
eq('the switch opens the second script', /<script>\n\/\* R115[^\n]*\*\/\nconst DEV=true;/.test(src), true);
eq('devStrip removes the cheat bar, +1000 GOLD and the fog eye; it runs at start when DEV is off', [
  src.includes("function devStrip(){ ['cheatBar','mnGold','fogCheat'].forEach(id=>{ const e=document.getElementById(id); if(e) e.remove(); }); }"),
  src.includes('if(!DEV) devStrip();'), src.includes('<button class="mn-btn" id="mnGold" type="button" onclick="cheatGold()">+1000 GOLD</button>')], [true, true, true]);
eq('the console helpers and cheats do nothing when DEV is off', [
  src.includes("function ftuePart(n, j){   /* R109: j = a CUST_JUMPS row, applied after the part's state */\n    if(!DEV) return 'Not available';"),
  src.includes("function ftueCust(id){ if(!DEV) return 'Not available';"),
  src.includes('function cheatGold(){ if(!DEV) return;'),
  src.includes('function toggleFogCheat(){ if(!DEV) return false;'),
  src.includes('function hmSkip(){ if(!DEV) return;')], [true, true, true, true, true]);
eq('the debug handles are set only when DEV is on', [src.includes('if(DEV) window.ftuePart=ftuePart;'), src.includes('if(DEV) window.ftueCust=ftueCust;'),
  src.includes('    if(DEV) window.SF = {'), src.includes('    if(DEV) window.SFM = {')], [true, true, true, true]);
eq('?freeplay and ?nointro only when DEV is on; the settings note too', [src.includes("const SM_FREE=DEV && location.search.indexOf('freeplay')>=0;"),
  src.includes("if(DEV && location.search.indexOf('nointro')>=0){ introClose(); return; }"), src.includes("mnNote(DEV ? 'Cheats \\u2014 for testing.' : ''); }")], [true, true, true]);

eq('R116: the layout and art aids answer only when DEV is on', ['wire', 'test', 'bbox', 'clean', 'labels', 'hammer'].map(q => src.includes("if(DEV && location.search.indexOf('" + q + "')>=0)")), [true, true, true, true, true, true]);
eq('R116: the W key (wireframe) only when DEV is on; the arrow keys stay', [src.includes("window.addEventListener('keydown', e=>{ if(DEV && (e.key==='w'||e.key==='W')) toggleWireframe(); });"),
  src.includes("const KEY={ ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' };")], [true, true]);
const out = makeExternal(src, '2026-11-12');
eq('the copy turns the switch off', [out.split('const DEV=false;').length - 1, out.includes('const DEV=true;')], [1, false]);
eq('the copy says it is generated, after the doctype', out.startsWith('<!DOCTYPE html>\n<!-- GENERATED 2026-11-12 by tooling/external/make-external.mjs from Swordforge_looptest_landscape.html'), true);
eq('nothing else changes', out.replace(/\n<!-- GENERATED[^\n]*-->/, '').replace('const DEV=false;', 'const DEV=true;'), src);
assert.throws(() => makeExternal(src.replace('const DEV=true;', ''), 'x')); n++; console.log('  ok   refuses a build without the switch');

const ext = new URL('../../Swordforge_external.html', import.meta.url);
if (fs.existsSync(ext)) { const e = fs.readFileSync(ext, 'utf8');
  eq('the committed copy is the external one', [e.includes('const DEV=false;'), e.includes('const DEV=true;')], [true, false]); }
console.log('[external] GREEN / ' + n + ' checks');
