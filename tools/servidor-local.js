#!/usr/bin/env node
/* Servidor local do site com as mesmas rotas do vercel.json e do .htaccess.
   Uso: node tools/servidor-local.js [--porta 8080] [--assets caminho/para/assets]
   --assets serve /assets/* de outra pasta (útil enquanto site/assets/ está vazia). */
const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : dflt; };
const PORT = Number(opt('porta', 8080));
const ROOT = path.resolve(__dirname, '..', 'site');
const ASSETS = opt('assets', null) ? path.resolve(opt('assets')) : null;

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webp': 'image/webp' };

function rewrite(p) {
  if (/^\/shop\/category\/[^/]+\/?$/.test(p)) return '/shop/index.html';
  if (/^\/shop\/[^/]+\/?$/.test(p) && !fs.existsSync(path.join(ROOT, p))) return '/shop/produto.html';
  return p;
}

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.length > 1 && p.endsWith('/') && !p.startsWith('/shop/category')) p = p.slice(0, -1);
  p = rewrite(p);
  let file = path.join(ROOT, p);
  if (ASSETS && p.startsWith('/assets/') && !fs.existsSync(file)) file = path.join(ASSETS, p.slice('/assets/'.length));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!file.startsWith(ROOT) && !(ASSETS && file.startsWith(ASSETS))) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('404'); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(PORT, '127.0.0.1', () => console.log(`Vulto em http://127.0.0.1:${PORT}`));
