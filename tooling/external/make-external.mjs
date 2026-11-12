/* R115 (owner, 2026-11-12): makes the external tester copy. Record: specs/2026-11-12-external-build.md.
   Run only when the owner asks ("make the external version"): node tooling/external/make-external.mjs
   The copy is the main build with const DEV=true; turned off, and a generated-file comment. */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export function makeExternal(src, date) {
    const nl = src.includes('\r\n') ? '\r\n' : '\n';
    if (src.split('const DEV=true;').length - 1 !== 1) throw new Error('the main build must hold exactly one "const DEV=true;"');
    const head = '<!DOCTYPE html>';
    if (!src.startsWith(head)) throw new Error('the main build must start with ' + head);
    const note = '<!-- GENERATED ' + date + ' by tooling/external/make-external.mjs from Swordforge_looptest_landscape.html: the external tester copy, cheats off (DEV false). Do not edit; make it again. -->';
    return head + nl + note + src.slice(head.length).replace('const DEV=true;', 'const DEV=false;');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    const root = new URL('../../', import.meta.url);
    const src = fs.readFileSync(new URL('Swordforge_looptest_landscape.html', root), 'utf8');
    const date = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(new URL('Swordforge_external.html', root), makeExternal(src, date));
    console.log('wrote Swordforge_external.html (' + date + ')');
}
