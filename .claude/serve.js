// Minimal static file server for local preview (no dependencies).
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 5678;   // honour the harness-assigned port so a second worktree can preview alongside the first
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json',
};

http.createServer((req, res) => {
  // r136 (dev only): the asset-diet page POSTs re-encoded bytes back here, because this machine has
  // no image tooling and the browser is the only WebP encoder available. Writes are confined to ROOT.
  if (req.method === 'POST' && req.url.split('?')[0] === '/__save') {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').searchParams.get('path') || '');
    const dest = path.join(ROOT, rel);
    if (!rel || !dest.startsWith(ROOT)) { res.writeHead(403); res.end('bad path'); return; }
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try { fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.writeFileSync(dest, Buffer.concat(chunks));
            res.writeHead(200); res.end(String(Buffer.concat(chunks).length)); }
      catch (e) { res.writeHead(500); res.end(String(e.message)); }
    });
    return;
  }
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));
