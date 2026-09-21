/* Builds tooling/asset-diet/manifest.json: for every asset the BUILD actually loads, the width to
 * re-encode it at. Not part of the game.
 *
 * Target rule: 2x the widest CSS box the asset is ever drawn in, inside the fixed 1080x600 frame.
 * 2x covers a DPR-2 screen at 1:1. On a phone the page is zoomed OUT (the fit picks a viewport
 * WIDER than 1080), so the frame gets FEWER device pixels than 1080*DPR and 2x is already generous.
 *
 * DISPLAY comes from a real measurement pass in the browser across every screen and modal, not from
 * reading the CSS. Assets whose element is display:none at measure time were forced visible; the
 * three that could not be measured that way carry an explicit note below.
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';

const DISPLAY = JSON.parse(readFileSync('tooling/asset-diet/display.json', 'utf8'));

/* Explicit overrides win over the rule. Reason required for each. */
const OVERRIDE = {
  // The map is a pannable/zoomable SVG world, so "display width" is the whole 2800-unit world, not a
  // box on screen. It is painted parchment under a fog layer and a trait overlay; 2048 is invisible
  // softness and takes the decode from 33 MB to 16 MB, which is the single biggest RAM win here.
  'assets/map/map_base.png': { w: 2048, q: 0.82 },
  // Full-frame scene art: the frame is 1080 CSS px, so 1920 is already above 2x on a zoomed-out phone.
  'assets/backgrounds/shop_background.png':             { w: 1920, q: 0.82 },
  'assets/backgrounds/customer_counter_background.png': { w: 1920, q: 0.82 },
  'assets/backgrounds/bedroom_background.png':          { w: 1920, q: 0.82 },
  'assets/backgrounds/basement_background.png':         { w: 1920, q: 0.82 },
  'assets/backgrounds/cave_background.png':             { w: 1920, q: 0.82 },
  'assets/hammer/hammer_bg.png':                        { w: 1920, q: 0.82 },
  // Could not be measured from the DOM (their panel is display:none and forcing it showed 0).
  'assets/ui/Dialogue_box.png':   { w: 980 },  // .cs-bram-dlg is 44.92% of the 1080 frame = 485 css px
  'assets/ui/dragon_icon.png':    { w: 220 },  // .tut-iconsay img, a small round portrait
  'assets/map/map_hazard.png':    { w: 320 },  // 150 world units of a 2800-unit map, so ~117 css px
  // 9-slice chrome: the border-image slice of 64 is in SOURCE pixels, so resizing the file silently
  // rescales the corners. Format change only, natural width kept.
  'assets/ui/plaque_stone.png':   { w: 99999 },
};

/* Referenced in a COMMENT only, so the browser never loads them. Excluded from the manifest and
 * from the payload numbers: the old scan counted them and overstated the total by 1.84 MB. */
const COMMENT_ONLY = ['assets/Anchor-images/landscape-scale-ref.png', 'assets/forge/anchor_cauldron.png'];

/* Measured in a second pass, because their element is absent or inert in the default state. */
const LATE = {
  'assets/forge/bell.png':      [57, 66],    // the counter bell prop, 5.2% of the frame
  'assets/customer/Bram.png':   [390, 734],  // the SCRIPTED counter portrait; the diary page shows him smaller
  'assets/customer/BramD2.png': [390, 734],
  'assets/customer/man1.png':   [390, 734],  'assets/customer/man2.png': [390, 734],
  'assets/customer/man3.png':   [390, 734],  'assets/customer/man4.png': [390, 734],
  'assets/customer/woman1.png': [390, 734],  'assets/customer/woman2.png': [390, 734],
  'assets/customer/woman3.png': [390, 734],
};

/* FAMILIES: whole directories the build reaches by BUILDING a path at runtime, e.g.
   ddSrc = (k,f) => 'assets/sword-parts/'+DD_DIR[k]+'/'+f+'.png'. A measurement sweep only ever sees
   the few members that happened to be on screen, so the first manifest missed 60-odd files and the
   reference rewrite would have left them behind as PNG. The representative width is the widest box
   any member of the family is drawn in, measured. */
const FAMILIES = [
  { dir: 'assets/sword-parts/blades',   display: [945, 945] },   // the design desk preview
  { dir: 'assets/sword-parts/grips',    display: [945, 945] },
  { dir: 'assets/sword-parts/guards',   display: [945, 945] },
  { dir: 'assets/sword-parts/pommels',  display: [945, 945] },
  { dir: 'assets/sword-parts/overlays', display: [945, 945] },   // crack / sparkle, layered over the sword
  { dir: 'assets/customer',             display: [390, 734] },   // the counter portrait box
  { dir: 'assets/hammer',               display: [1080, 590] },  // the minigame is frame-width
];

const FLOOR = 64;          // never crush a small icon below something a 2x screen can use
const DEFAULT_Q = 0.86;    // props and UI keep more detail than the flat scene art

function pngSize(file) {
  const b = readFileSync(file);
  if (b.slice(1, 4).toString() !== 'PNG') return null;
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

const man = [];
import { readdirSync } from 'node:fs';
const ALL = Object.assign({}, DISPLAY, LATE);
for (const fam of FAMILIES) {
  for (const f of readdirSync(fam.dir)) { if (!/[.]png$/i.test(f)) continue;
    const k = fam.dir + '/' + f; if (!ALL[k]) ALL[k] = fam.display; }
}
ALL['assets/ui/plaque_stone.png'] = ALL['assets/ui/plaque_stone.png'] || [426, 152];
for (const [src, box] of Object.entries(ALL)) {
  if (COMMENT_ONLY.includes(src)) continue;
  const nat = pngSize(src);
  if (!nat) { console.log('skip (not png): ' + src); continue; }
  const o = OVERRIDE[src];
  const wantRaw = o ? o.w : Math.ceil((box[0] || 0) * 2);
  const w = Math.min(nat[0], Math.max(FLOOR, wantRaw));
  man.push({ src, out: src.replace(/\.png$/, '.webp'), w, q: o && o.q != null ? o.q : DEFAULT_Q,
             bytes: statSync(src).size, nat, display: box, forced: !!o });
}
man.sort((a, b) => b.bytes - a.bytes);
writeFileSync('tooling/asset-diet/manifest.json', JSON.stringify(man, null, 1));
const tot = man.reduce((a, m) => a + m.bytes, 0);
console.log(man.length + ' assets, ' + (tot / 1048576).toFixed(2) + ' MB on disk today');
console.log('largest downscales:');
man.slice(0, 12).forEach(m => console.log('  ' + (m.bytes / 1048576).toFixed(2) + 'MB  ' +
  String(m.nat[0] + 'x' + m.nat[1]).padEnd(11) + ' -> ' + String(m.w).padStart(4) +
  '  (drawn at ' + m.display[0] + ' css px)' + (m.forced ? '  [override]' : '') + '  ' + m.src));
