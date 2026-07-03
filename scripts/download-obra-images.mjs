// scripts/download-obra-images.mjs
// Reads export-2026-06-24.json, downloads every obra image from Firebase Storage
// to dist/images/obras/ as {obra_seq}_{random}.{ext}
// Connection contract with downstream seed SQL: filenames stable, returned in JSON map.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const EXPORT_JSON = path.resolve(
  'C:/Users/Esteban Selvaggi/Desktop/subagent-driven_development/data/inputs/oteguiobras/export-2026-06-24.json'
);
const OUT_DIR = path.join(ROOT, 'dist', 'images', 'obras');
const MAP_OUT = path.join(ROOT, 'scripts', 'obra-image-map.json');

const CONCURRENCY = 8;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function safeName(obraNombre, ext) {
  const base = obraNombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  return `${base}.${ext}`;
}

function urlToExt(url) {
  const u = new URL(url);
  const decoded = decodeURIComponent(u.pathname);
  const match = decoded.match(/\.([a-z0-9]+)(?:\?|$)/i);
  return match ? match[1].toLowerCase() : 'jpg';
}

async function download(url, dest, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      return true;
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(500 * (i + 1));
    }
  }
}

async function main() {
  console.log('[load]', EXPORT_JSON);
  const exportData = JSON.parse(fs.readFileSync(EXPORT_JSON, 'utf-8'));
  const obras = exportData.otegui_obras || [];
  console.log(`[plan] ${obras.length} obras`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Build task list: { obraIndex, seq, url, dest }
  const tasks = [];
  obraLoop: for (let i = 0; i < obras.length; i++) {
    const o = obras[i];
    const imgs = o.imagenes || [];
    if (imgs.length === 0) {
      // fallback: use `imagen` singular
      if (o.imagen) imgs.push(o.imagen);
    }
    for (let s = 0; s < imgs.length; s++) {
      const url = imgs[s];
      if (!url) continue;
      const ext = urlToExt(url);
      const filename = `${String(i + 1).padStart(3, '0')}_${String(s + 1).padStart(2, '0')}.${ext}`;
      tasks.push({
        obraIndex: i + 1,
        obraId: o._id,
        obraNombre: o.nombre,
        seq: s + 1,
        originalUrl: url,
        filename,
        dest: path.join(OUT_DIR, filename),
      });
    }
  }
  console.log(`[tasks] ${tasks.length} images to fetch`);

  // Skip existing
  const remaining = tasks.filter((t) => {
    if (fs.existsSync(t.dest) && fs.statSync(t.dest).size > 0) {
      return false;
    }
    return true;
  });
  console.log(`[skip] already on disk: ${tasks.length - remaining.length}`);
  console.log(`[fetch] remaining: ${remaining.length}`);

  let completed = 0;
  let failed = 0;
  let cursor = 0;

  async function worker(id) {
    while (cursor < remaining.length) {
      const myIdx = cursor++;
      if (myIdx >= remaining.length) return;
      const t = remaining[myIdx];
      try {
        await download(t.originalUrl, t.dest);
        completed++;
      } catch (e) {
        failed++;
        console.error(`[fail ${id}] ${t.filename}: ${e.message}`);
      }
    }
  }

  const workers = [];
  for (let w = 0; w < CONCURRENCY; w++) workers.push(worker(w));
  await Promise.all(workers);

  console.log(`[done] ok=${completed}, fail=${failed}`);
  if (failed > 0) {
    console.error(`[!] ${failed} downloads failed — see above.`);
  }

  // Write map (downstream seed SQL will read this to resolve URL → filename)
  const map = {};
  for (const t of tasks) {
    map[t.originalUrl] = `/images/obras/${t.filename}`;
  }
  fs.writeFileSync(MAP_OUT, JSON.stringify(map, null, 2));
  console.log(`[map] wrote ${Object.keys(map).length} url mappings to ${MAP_OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
