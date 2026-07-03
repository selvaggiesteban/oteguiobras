// scripts/download-obra-images-from-prod.mjs
// Fetch every obra image referenced by the local MySQL DB via /api/obras and save
// it under C:/xampp/htdocs/oteguiobras/images/obras/<db-name>.
//
// Source of truth for original bytes: Firebase Storage URLs in obra-image-map.json
// (kept from the original Firebase-export download). Prod oteguiobras.com currently
// serves a SPA shell from every path, so we can't pull bytes from there.
//
// One-shot dev utility. Re-runnable: skips files already on disk > 0 bytes.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const MAP_FILE = path.join(ROOT, 'scripts', 'obra-image-map.json');
const API_URL = process.env.API_URL || 'http://localhost:5173/api/obras';
const OUT_DIR = String.raw`C:\xampp\htdocs\oteguiobras\images\obras`;
const CONCURRENCY = 8;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function downloadOnce(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) throw new Error('empty body');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function downloadWithRetry(url, dest, retries = 3) {
  let last;
  for (let i = 0; i < retries; i++) {
    try {
      return await downloadOnce(url, dest);
    } catch (e) {
      last = e;
      if (i < retries - 1) await sleep(400 * (i + 1));
    }
  }
  throw last;
}

function destForDbPath(dbPath) {
  // "/images/obras/001_01.jpg" -> C:\xampp\htdocs\oteguiobras\images\obras\001_01.jpg
  const base = path.basename(dbPath);
  return path.join(OUT_DIR, base);
}

async function main() {
  if (!fs.existsSync(MAP_FILE)) {
    console.error(`[!] missing map: ${MAP_FILE}`);
    process.exit(1);
  }
  const map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf-8'));
  console.log(`[map] ${Object.keys(map).length} Firebase URL -> DB path entries`);

  // Validate against current /api/obras so we only download what's actually referenced.
  console.log('[api]', API_URL);
  const obras = await (await fetch(API_URL)).json();
  const referenced = new Set();
  for (const o of obras) {
    for (const img of o.imagenes || []) {
      if (typeof img === 'string' && img.startsWith('/images/obras/')) {
        referenced.add(img);
      }
    }
  }
  console.log(`[api] ${referenced.size} distinct obra image paths referenced`);

  const tasks = [];
  for (const [firebaseUrl, dbPath] of Object.entries(map)) {
    if (!referenced.has(dbPath)) continue;
    tasks.push({
      url: firebaseUrl,
      dest: destForDbPath(dbPath),
      name: path.basename(dbPath),
    });
  }
  console.log(`[plan] ${tasks.length} tasks (referenced AND in map)`);

  const remaining = tasks.filter((t) => {
    try {
      if (fs.existsSync(t.dest) && fs.statSync(t.dest).size > 0) return false;
    } catch {}
    return true;
  });
  console.log(`[skip] already on disk: ${tasks.length - remaining.length}`);
  console.log(`[fetch] remaining: ${remaining.length}`);

  let ok = 0, fail = 0;
  let cursor = 0;

  async function worker(id) {
    while (cursor < remaining.length) {
      const i = cursor++;
      if (i >= remaining.length) return;
      const t = remaining[i];
      try {
        const bytes = await downloadWithRetry(t.url, t.dest);
        ok++;
        if (ok % 10 === 0 || ok === remaining.length) {
          console.log(`[ok ${ok}/${remaining.length}] ${t.name} (${bytes} bytes)`);
        }
      } catch (e) {
        fail++;
        console.error(`[fail ${id}] ${t.name}: ${e.message}`);
      }
    }
  }

  const workers = [];
  for (let w = 0; w < CONCURRENCY; w++) workers.push(worker(w));
  await Promise.all(workers);

  console.log(`[done] ok=${ok}, fail=${fail}, total=${tasks.length}`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
