/**
 * Script de enriquecimiento de datos
 * Completa campos faltantes (categoria, cliente) e infiere datos del nombre.
 * Uso: node scripts/enrich-obras.js
 * Input:  scripts/obras-scraped.json
 * Output: scripts/obras-enriched.json
 */

import { readFileSync, writeFileSync } from 'fs';

const obras = JSON.parse(readFileSync('scripts/obras-scraped.json', 'utf-8'));

// ── Reglas de enriquecimiento por URL original ────────────────────────────────
// Cada entrada: [urlFragment, { nombre?, categoria?, cliente?, año?, ubicacion? }]
const OVERRIDES = [
  // ── BANCOS ────────────────────────────────────────────────────────────────
  ['/41-nombre-de-la-obra',     { nombre: 'Banco Francés - Sucursal 006 Constitución', categoria: 'Bancos', cliente: 'Banco Francés' }],
  ['/22-banco-hipotecario',     { nombre: 'Banco Hipotecario - Directorio Edificio Central P6', categoria: 'Bancos', cliente: 'Banco Hipotecario' }],
  ['/5-itau-colegiales',        { nombre: 'Itaú Colegiales - Plataforma Comercial', categoria: 'Bancos', cliente: 'Itaú' }],
  ['/8-itau-junin',             { nombre: 'Itaú Junín - Personal Bank', categoria: 'Bancos', cliente: 'Itaú' }],

  // ── RETAIL / COMERCIAL ────────────────────────────────────────────────────
  ['/61-isadora-cabello',       { nombre: 'Isadora Cabello', categoria: 'Retail / Comercial' }],
  ['/56-isadora-san-telmo',     { nombre: 'Isadora San Telmo', categoria: 'Retail / Comercial', cliente: 'Isadora' }],
  ['/63-pupis-balbin',          { nombre: 'Puppis - Balbín', categoria: 'Retail / Comercial', cliente: 'Puppis' }],
  ['/64-puppis-puertos',        { nombre: 'Puppis - Puertos Escobar', categoria: 'Retail / Comercial', cliente: 'Puppis' }],
  ['/23-megatlon-devoto',       { nombre: 'Megatlon Devoto', categoria: 'Retail / Comercial', cliente: 'Megatlon' }],
  ['/21-farmacia-paradineiro',  { nombre: 'Farmacia Paradiñeiro', categoria: 'Retail / Comercial', cliente: 'Farmacia Paradiñeiro' }],
  ['/12-samsung-la-plata',      { nombre: 'Samsung La Plata', cliente: 'Samsung' }],
  ['/14-samsung-quilmes',       { nombre: 'Samsung Quilmes', cliente: 'Samsung' }],
  ['/13-samsung-plaza-oeste',   { nombre: 'Samsung Plaza Oeste', cliente: 'Samsung' }],

  // ── OFICINAS ──────────────────────────────────────────────────────────────
  ['/62-ccu-2023',              { nombre: 'CCU 2023', categoria: 'Oficinas', cliente: 'CCU Argentina' }],
  ['/60-rio-limay',             { nombre: 'Río Limay', categoria: 'Oficinas' }],
  ['/58-equaphon',              { nombre: 'Equaphone', categoria: 'Oficinas' }],
  ['/39-philips-remodelacion',  { nombre: 'Philips - Remodelación Oficinas', categoria: 'Oficinas', cliente: 'Philips' }],
  ['/24-merck-remodelacion',    { nombre: 'Merck - Remodelación Oficinas', cliente: 'Merck' }],
  ['/19-comedor-philips',       { nombre: 'Comedor Philips', categoria: 'Oficinas', cliente: 'Philips' }],
  ['/20-ayassa-fombella',       { nombre: 'Ayassa Fombella', categoria: 'Oficinas', cliente: 'Ayassa' }],
  ['/9-mural',                  { nombre: 'Mural' }],
  ['/27-cafeteria-consejo-av',  { nombre: 'Cafetería Consejo - Av. Córdoba 1532', cliente: 'Consejo Prof. de Ciencias Económicas' }],
  ['/17-cafeteria-consejo-prof',{ nombre: 'Cafetería Consejo Profesional de Ciencias Económicas', cliente: 'Consejo Prof. de Ciencias Económicas' }],
  ['/16-colegio-profesional',   { nombre: 'CPCE - Ampliación Sede Central', cliente: 'Consejo Prof. de Ciencias Económicas' }],
  ['/26-ampliacion-sede-central',{ nombre: 'CPCE - Ampliación Sede Central Av. Córdoba 1532', cliente: 'Consejo Prof. de Ciencias Económicas' }],
  ['/18-coworking-consejo',     { nombre: 'Coworking CPCE', cliente: 'Consejo Prof. de Ciencias Económicas' }],
  ['/28-sala-de-lactancia',     { nombre: 'Sala de Lactancia - Av. Córdoba 1532', cliente: 'Consejo Prof. de Ciencias Económicas' }],
  ['/15-refuncionalizacion',    { nombre: 'Refuncionalización - Corrientes 1441', cliente: 'Consejo Prof. de Ciencias Económicas' }],

  // ── INSTITUCIONAL ─────────────────────────────────────────────────────────
  ['/59-itba-',                 { nombre: 'ITBA', categoria: 'Institucional', cliente: 'ITBA' }],
  ['/55-itba-sueno',            { nombre: 'ITBA Sueño', categoria: 'Institucional', cliente: 'ITBA' }],

  // ── INDUSTRIAL ────────────────────────────────────────────────────────────
  ['/30-ml-sala-de-monitoreo',  { nombre: 'ML - Sala de Monitoreo - CD V. Celina', categoria: 'Industrial', cliente: 'Mercado Libre' }],
  ['/29-ml-sala-de-descanso',   { nombre: 'ML - Sala de Descanso - CD Munro', categoria: 'Industrial', cliente: 'Mercado Libre' }],
  ['/33-mercedes-benz-scrap',   { nombre: 'Mercedes Benz - Scrap', categoria: 'Industrial', cliente: 'Mercedes Benz' }],
  ['/31-mercedes-benz-ahuyen',  { nombre: 'Mercedes Benz - Ahuyenta Palomas', categoria: 'Industrial', cliente: 'Mercedes Benz' }],
  ['/32-mercedes-benz-alfom',   { nombre: 'Mercedes Benz - Alfombra Oficina Sanidad', categoria: 'Industrial', cliente: 'Mercedes Benz' }],
  ['/37-philips-desmonte',      { nombre: 'Philips - Desmonte Cartel Institucional', cliente: 'Philips' }],
  ['/25-trp-pintura',           { nombre: 'TRP - Pintura Pañol Ingeniería', categoria: 'Industrial', cliente: 'TRP' }],
  ['/11-ferri-real-state-garita',{ nombre: 'Ferri Real State - Garita de Seguridad', categoria: 'Industrial', cliente: 'Ferri Real State' }],
  ['/10-ferri-real-state-camara',{ nombre: 'Ferri Real State - Cámara de Congelados', categoria: 'Industrial', cliente: 'Ferri Real State' }],
  ['/34-pfizer-deposito',       { nombre: 'Pfizer - Depósito Ottaviano', cliente: 'Pfizer' }],
  ['/35-pfizer-remodelacion',   { nombre: 'Pfizer - Remodelación Administración', cliente: 'Pfizer' }],
  ['/36-pfizer-repavimentacion',{ nombre: 'Pfizer - Repavimentación Ingreso a Planta', cliente: 'Pfizer' }],
];

function applyOverride(obra) {
  const url = obra._urlOriginal || '';
  for (const [fragment, patch] of OVERRIDES) {
    if (url.includes(fragment)) {
      return { ...obra, ...patch };
    }
  }
  return obra;
}

// ── Inferencia automática desde el nombre ─────────────────────────────────────
function inferirCliente(obra) {
  if (obra.cliente) return obra.cliente;
  const n = obra.nombre.toLowerCase();
  if (n.includes('samsung'))         return 'Samsung';
  if (n.includes('itaú') || n.includes('itau')) return 'Itaú';
  if (n.includes('banco francés') || n.includes('banco frances')) return 'Banco Francés';
  if (n.includes('banco hipotecario')) return 'Banco Hipotecario';
  if (n.includes('pfizer'))          return 'Pfizer';
  if (n.includes('mercedes'))        return 'Mercedes Benz';
  if (n.includes('mercado libre') || n.startsWith('ml -')) return 'Mercado Libre';
  if (n.includes('philips'))         return 'Philips';
  if (n.includes('merck'))           return 'Merck';
  if (n.includes('ccu'))             return 'CCU Argentina';
  if (n.includes('isadora'))         return 'Isadora';
  if (n.includes('puppis') || n.includes('pupis')) return 'Puppis';
  if (n.includes('megatlon'))        return 'Megatlon';
  if (n.includes('itba'))            return 'ITBA';
  if (n.includes('ferri real'))      return 'Ferri Real State';
  if (n.includes('ayassa'))          return 'Ayassa';
  if (n.includes('equaphone') || n.includes('equaphon')) return 'Equaphone';
  if (n.includes('trp'))             return 'TRP';
  if (n.includes('consejo') || n.includes('cpce')) return 'Consejo Prof. de Ciencias Económicas';
  return null;
}

// ── Procesar ──────────────────────────────────────────────────────────────────
const enriched = obras.map(obra => {
  let o = applyOverride(obra);

  // Inferir cliente si sigue faltando
  o.cliente = o.cliente || inferirCliente(o);

  // Limpiar campos internos del scraping
  const { _urlOriginal, _tipoObraOriginal, _error, ...limpio } = o;

  return limpio;
});

// Stats
const stats = {
  total: enriched.length,
  conCategoria: enriched.filter(o => o.categoria && o.categoria !== 'Sin categoría').length,
  conCliente: enriched.filter(o => o.cliente).length,
  conAño: enriched.filter(o => o.año).length,
  conM2: enriched.filter(o => o.metrosCuadrados).length,
  conImagenes: enriched.filter(o => o.imagenes?.length > 0).length,
};

const cats = {};
enriched.forEach(o => { cats[o.categoria] = (cats[o.categoria] || 0) + 1; });

writeFileSync('scripts/obras-enriched.json', JSON.stringify(enriched, null, 2), 'utf-8');

console.log('=== OBRAS ENRIQUECIDAS ===');
console.log(`Con categoría:  ${stats.conCategoria}/${stats.total}`);
console.log(`Con cliente:    ${stats.conCliente}/${stats.total}`);
console.log(`Con año:        ${stats.conAño}/${stats.total}`);
console.log(`Con m2:         ${stats.conM2}/${stats.total}`);
console.log(`Con imágenes:   ${stats.conImagenes}/${stats.total}`);
console.log('\nCategorías:');
Object.entries(cats).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(` ${v}x ${k}`));
console.log('\nGuardado en: scripts/obras-enriched.json');
