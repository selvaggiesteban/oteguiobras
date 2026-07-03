// scripts/generate-obras-seed.mjs
// Reads export-2026-06-24.json + obra-image-map.json (produced by downloader).
// Emits migration/obras-seed.sql: 48 INSERTs into `obras` with snake_case fields
// and local /images/obras/ paths in JSON column.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const EXPORT_JSON = path.resolve(
  'C:/Users/Esteban Selvaggi/Desktop/subagent-driven_development/data/inputs/oteguiobras/export-2026-06-24.json'
);
const MAP_JSON = path.join(ROOT, 'scripts', 'obra-image-map.json');
const SQL_OUT = path.join(ROOT, 'migration', 'obras-seed.sql');

function esc(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? '1' : '0';
  const s = String(v)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  return `'${s}'`;
}

function jsonColumn(arr) {
  // Stringified JSON array stored in MySQL JSON column.
  return esc(JSON.stringify(arr));
}

async function main() {
  console.log('[load]', EXPORT_JSON);
  const exportData = JSON.parse(fs.readFileSync(EXPORT_JSON, 'utf-8'));
  const obras = exportData.otegui_obras || [];
  console.log(`[seed] ${obras.length} obras`);

  const map = fs.existsSync(MAP_JSON)
    ? JSON.parse(fs.readFileSync(MAP_JSON, 'utf-8'))
    : {};
  console.log(`[map] loaded ${Object.keys(map).length} url→path mappings`);

  const lines = [];
  lines.push('-- obras-seed.sql');
  lines.push('-- Generated from export-2026-06-24.json');
  lines.push('-- Assumes schema-and-seed.sql was applied first (table `obras` empty).');
  lines.push('-- Field mapping:');
  lines.push('--   Firebase (camelCase)  ->  MySQL (snake_case)');
  lines.push('--   año                   ->  anno INT');
  lines.push("--   metrosCuadrados       ->  metros_cuadrados DECIMAL(10,2)");
  lines.push("--   imagenes []           ->  imagenes JSON (local paths)");
  lines.push("--   imagen_portada        ->  defaults 0 (set in app if needed)");
  lines.push('--   destacada/visible     ->  TINYINT(1)');
  lines.push('--   fechaCreacion         ->  fecha_creacion DATETIME');
  lines.push('--   fechaModificacion     ->  fecha_modificacion DATETIME');
  lines.push('');
  lines.push('SET NAMES utf8mb4;');
  lines.push('SET time_zone = \'+00:00\';');
  lines.push('');

  for (let i = 0; i < obras.length; i++) {
    const o = obras[i];

    // Resolve image URLs → local paths via map; fall back to original URL if unmapped.
    const imagenesRaw = Array.isArray(o.imagenes) ? o.imagenes : [];
    const imagenesLocal = imagenesRaw.map((u) => {
      if (map[u]) return map[u];
      // not yet downloaded: warn but keep going so SQL still valid
      console.warn(`[warn] no map entry for: ${u}`);
      return u;
    });
    const imagenPortada =
      typeof o.imagenPortada === 'number' ? o.imagenPortada : 0;

    const anno = typeof o.año === 'number' ? o.año : null;
    const metros =
      typeof o.metrosCuadrados === 'number' ? o.metrosCuadrados : null;

    const fechaCreacion =
      typeof o.fechaCreacion === 'string' && o.fechaCreacion
        ? o.fechaCreacion.replace('Z', '').slice(0, 19).replace('T', ' ')
        : null;
    const fechaModificacion =
      typeof o.fechaModificacion === 'string' && o.fechaModificacion
        ? o.fechaModificacion.replace('Z', '').slice(0, 19).replace('T', ' ')
        : null;

    const cols = [
      'nombre',
      'categoria',
      'ubicacion',
      'anno',
      'descripcion',
      'imagenes',
      'imagen_portada',
      'metros_cuadrados',
      'cliente',
      'destacada',
      'visible',
      'orden',
      'fecha_creacion',
      'fecha_modificacion',
    ];
    const vals = [
      esc(o.nombre || `Obra ${i + 1}`),
      esc(o.categoria || 'Retail / Comercial'),
      esc(o.ubicacion || null),
      anno === null ? 'NULL' : String(anno),
      esc(o.descripcion || null),
      jsonColumn(imagenesLocal),
      String(imagenPortada),
      metros === null ? 'NULL' : metros.toFixed(2),
      esc(o.cliente || null),
      o.destacada ? 1 : 0,
      o.visible === false ? 0 : 1,
      typeof o.orden === 'number' ? String(o.orden) : String(i),
      fechaCreacion === null ? 'NULL' : esc(fechaCreacion),
      fechaModificacion === null ? 'NULL' : esc(fechaModificacion),
    ];

    lines.push(`INSERT INTO obras (${cols.join(', ')}) VALUES (${vals.join(', ')});`);
  }

  fs.mkdirSync(path.dirname(SQL_OUT), { recursive: true });
  fs.writeFileSync(SQL_OUT, lines.join('\n') + '\n');
  console.log(`[out] ${SQL_OUT}  (${obras.length} inserts, ${lines.length} lines)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
