/* Skill tree: trading and ore skills (r218), guarded against drift.
 *
 * The recorded values live in specs/2026-10-06-skill-tree-trade-ore.md. The build keeps the SKILLS
 * table and the skill helpers between the SKILLS-BEGIN / SKILLS-END markers; this test reads them
 * OUT OF THE SHIPPED HTML.
 * Run: node tooling/skills/skills.test.mjs
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const HTML = 'Swordforge_looptest_landscape.html';
const src = readFileSync(HTML, 'utf8');
const blk = src.match(/\/\* SKILLS-BEGIN \*\/([\s\S]*?)\/\* SKILLS-END \*\//);
assert.ok(blk, 'SKILLS markers not found in ' + HTML);
const M = new Function('let SKILL_RANK={}; function rank(id){ return SKILL_RANK[id]||0; }\n' + blk[1] +
  '; return { SKILLS, tradeMul, extractChance, extractBonus, pickSwingMs, bountyExtra, set:(o)=>{ SKILL_RANK=o; } };')();

let n = 0;
function eq(label, got, want) { assert.deepStrictEqual(got, want, label); n++; console.log('  ok   ' + label); }
const by = id => { const s = M.SKILLS.find(k => k.id === id); return s ? { name: s.name, max: s.max, cost: s.cost, node: s.node } : null; };

/* the record: the four new skills */
eq('trade',   by('trade'),   { name: 'Improved Trading Skills', max: 20, cost: 1, node: 0 });
eq('extract', by('extract'), { name: 'Ore Extraction Upgrade',  max: 5,  cost: 1, node: 4 });
eq('pick',    by('pick'),    { name: 'Pickaxe Upgrade',         max: 5,  cost: 1, node: 5 });
eq('bounty',  by('bounty'),  { name: 'Ore Bountifulness',       max: 10, cost: 1, node: 6 });
/* the old four are unchanged */
eq('old skills keep their nodes', ['bulk', 'master', 'vision', 'restore'].map(id => by(id).node), [8, 9, 10, 11]);
eq('no two skills share a node', new Set(M.SKILLS.map(k => k.node)).size, M.SKILLS.length);

/* effects */
eq('trade x at 0', M.tradeMul(0), 1);
eq('trade x at 1', M.tradeMul(1), 1.05);
eq('trade x at 20 (doubles)', M.tradeMul(20), 2);
eq('extract chances', [0, 1, 2, 3, 4, 5].map(M.extractChance), [0, 0.05, 0.10, 0.15, 0.20, 0.25]);
eq('extract bonus is 3 or 4', [0, 0.49, 0.5, 0.99].map(M.extractBonus), [3, 3, 4, 4]);
eq('pick swing ms', [0, 1, 5].map(M.pickSwingMs), [340, 306, 170]);
eq('bounty extra', [0, 1, 10].map(M.bountyExtra), [0, 1, 10]);

/* wiring in the build */
eq('price uses trading', /function swordBase\(w\)\{[^}]*tradeMul\(rank\('trade'\)\)/.test(src), true);
eq('normal seams start with the bounty', src.includes("left:NODE_YIELD+bountyExtra(rank('bounty'))"), true);
eq('tutorial caves are scripted', src.includes("{ metal:'iron', spot:2, left:2, script:true }") && src.includes('per:FTUE.day2Swing.slice(), script:true'), true);
eq('extraction rolls once per seam, never on scripted seams', src.includes('if(!n.script && !n.rolled){ n.rolled=true;'), true);
eq('swing interval follows the pickaxe rank', src.includes("setInterval(()=>{ const cur=pickSeam();") && src.includes("}, pickSwingMs(rank('pick')));"), true);

console.log('[skills] GREEN / ' + n + ' checks');
