/**
 * Script de scraping para extraer obras desde oteguiobras.com (PrestaShop)
 * Uso: node scripts/scrape-obras.js
 * Genera: scripts/obras-scraped.json
 */

import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';

const BASE_URL = 'https://oteguiobras.com';

const OBRA_URLS = [
  '/obras/41-nombre-de-la-obra.html',
  '/obras/61-isadora-cabello.html',
  '/obras/56-isadora-san-telmo.html',
  '/obras/63-pupis-balbin.html',
  '/obras/64-puppis-puertos-escobar.html',
  '/obras/62-ccu-2023.html',
  '/obras/60-rio-limay.html',
  '/obras/59-itba-.html',
  '/obras/58-equaphon.html',
  '/obras/55-itba-sueno-.html',
  '/obras/12-samsung-la-plata.html',
  '/obras/27-cafeteria-consejo-av-cordoba-1532.html',
  '/obras/16-colegio-profesional-de-ciencias-economicas-ampliacion-edificio-sede-central.html',
  '/obras/17-cafeteria-consejo-profesional-de-ciencias-economicas.html',
  '/obras/5-itau-colegiales-plataforma-comercial.html',
  '/obras/11-ferri-real-state-garita-de-seguridad.html',
  '/obras/14-samsung-quilmes.html',
  '/obras/23-megatlon-devoto.html',
  '/obras/26-ampliacion-sede-central-av-cordoba-1532-cpa.html',
  '/obras/18-coworking-consejo-profesional-de-ciencias-economicas.html',
  '/obras/20-ayassa-fombella.html',
  '/obras/36-pfizer-repavimentacion-ingreso-a-planta.html',
  '/obras/30-ml-sala-de-monitoreo-centro-de-distribucion-vcelina.html',
  '/obras/22-banco-hipotecario-directorio-edificio-central-piso-6-2019.html',
  '/obras/33-mercedes-benz-scrap.html',
  '/obras/29-ml-sala-de-descanso-centro-de-distribucion-munro-.html',
  '/obras/8-itau-junin-personal-bank.html',
  '/obras/31-mercedes-benz-ahuyenta-palomas.html',
  '/obras/35-pfizer-remodelacion-administracion.html',
  '/obras/39-philips-remodelacion-oficinas.html',
  '/obras/21-farmacia-paradineiro.html',
  '/obras/24-merck-remodelacion-oficinas.html',
  '/obras/28-sala-de-lactancia-av-cordoba-1532.html',
  '/obras/32-mercedes-benz-alfombra-en-oficina-sanidad.html',
  '/obras/10-ferri-real-state-camara-de-congelados.html',
  '/obras/15-refuncionalizacion-y-puesta-en-valor-entrepiso-corrientes-1441.html',
  '/obras/37-philips-desmonte-cartel-institucional-.html',
  '/obras/19-comedor-philips.html',
  '/obras/13-samsung-plaza-oeste.html',
  '/obras/25-trp-pintura-panol-ingenieria.html',
  '/obras/34-pfizer-deposito-ottaviano.html',
  '/obras/9-mural.html',
];

// Mapeo de categorías PrestaShop → nueva app
const CATEGORIA_MAP = {
  'retail': 'Retail / Comercial',
  'corporativo': 'Oficinas',
  'oficinas': 'Oficinas',
  'oficina': 'Oficinas',
  'coworking': 'Oficinas',
  'industrial': 'Industrial',
  'indistrial': 'Industrial',   // typo en prestashop
  'industria': 'Industrial',
  'banco': 'Bancos',
  'bancos': 'Bancos',
  'remodelación': 'Remodelación',
  'remodelacion': 'Remodelación',
  'proyecto': 'Proyecto',
  'institucional': 'Institucional',
  'gastronomico': 'Gastronómico',
  'gastronómico': 'Gastronómico',
  'hospitalario': 'Hospitalario',
  'comercial': 'Retail / Comercial',
};

function mapCategoria(tipoObra) {
  if (!tipoObra) return 'Sin categoría';
  const lower = tipoObra.toLowerCase().trim();
  return CATEGORIA_MAP[lower] || tipoObra;
}

function limpiarTexto(texto) {
  return texto?.replace(/\s+/g, ' ').trim() || '';
}

// Convierte URLs relativas de imágenes a absolutas y fuerza versión grande
function normalizarImagenUrl(src) {
  if (!src) return null;
  // Ya es absoluta
  if (src.startsWith('http')) {
    // Reemplazar tamaños pequeños por large_default
    src = src
      .replace(/-home_default\//g, '-large_default/')
      .replace(/-medium_default\//g, '-large_default/')
      .replace(/-small_default\//g, '-large_default/')
      .replace(/-cart_default\//g, '-large_default/')
      .replace(/-thumb_default\//g, '-large_default/');
    return src;
  }
  if (src.startsWith('//')) return 'https:' + src;
  return BASE_URL + (src.startsWith('/') ? '' : '/') + src;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'es-AR,es;q=0.9',
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} para ${url}`);
  return res.text();
}

async function scrapeObra(relativePath, index) {
  const url = BASE_URL + relativePath;
  console.log(`[${index + 1}/42] Scrapeando: ${url}`);

  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    // ── Nombre ────────────────────────────────────────────────────────────────
    const nombre = limpiarTexto($('h1').first().text());

    // ── Features: ul.info-bar li strong (key antes de <i>, valor en <i>) ─────
    const features = {};
    $('ul.info-bar li strong').each((_, el) => {
      const iVal = limpiarTexto($(el).find('i').text());
      // Clonar y quitar el <i> para quedarnos solo con el texto de la clave
      const strongClone = $(el).clone();
      strongClone.find('i').remove();
      const key = limpiarTexto(strongClone.text()).replace(/:\s*$/, '').toLowerCase();
      if (key && iVal) features[key] = iVal;
    });

    // ── Extended description: .product-description p con <b>clave:</b> valor ──
    $('.product-description p').each((_, p) => {
      $(p).find('b').each((_, b) => {
        const keyRaw = limpiarTexto($(b).text()).replace(/:$/, '').toLowerCase();
        // El valor es el nodo de texto que sigue al <b>
        const nextNode = b.nextSibling;
        if (nextNode && nextNode.type === 'text') {
          const val = limpiarTexto(nextNode.data).replace(/^:\s*/, '');
          if (keyRaw && val) features[keyRaw] = val;
        }
      });
    });

    // ── Extraer campos ────────────────────────────────────────────────────────
    const año = parseInt(
      features['año'] || features['año de ejecución'] || features['year'] || ''
    ) || null;

    const m2Raw = features['m2'] || features['superficie intervenida'] || features['metros cuadrados'] || '';
    const metrosCuadrados = parseInt(m2Raw.replace(/[^\d]/g, '')) || null;

    const tipoObra = features['tipo de obra'] || features['tipo obra'] || '';

    const cliente = limpiarTexto(
      features['cliente'] || ''
    ) || null;

    // Ubicación: combinar campos disponibles
    const ubicParts = [
      features['ubicación'] || features['ubicacion'] || '',
      features['dirección'] || features['direccion'] || '',
    ].filter(Boolean);
    const ubicacion = ubicParts.join(', ').trim() || null;

    // Descripción: buscar "descripción de trabajos" o texto libre del product-description
    let descripcion = '';
    $('.product-description p').each((_, p) => {
      const text = $(p).text();
      const lower = text.toLowerCase();
      if (lower.includes('descripción') || lower.includes('descripcion') || lower.includes('trabajos') || lower.includes('proyecto:')) {
        // Extraer solo la parte descriptiva (sin los campos clave:valor)
        const lines = text.split(/\r?\n/).filter(l => !l.includes(':') || l.split(':')[0].trim().length > 30);
        const desc = lines.join(' ').trim();
        if (desc.length > 30) descripcion = limpiarTexto(desc);
      }
    });

    // ── Imágenes: buscar src que matcheen /{número}/{slug}.jpg ───────────────
    // Extraer el slug de la URL: '/obras/12-samsung-la-plata.html' → 'samsung-la-plata'
    const obraSlugFromUrl = relativePath.replace(/^\/obras\/\d+-/, '').replace(/\.html$/, '');

    const imagenesSet = new Set();
    const imgPattern = /^https?:\/\/oteguiobras\.com\/\d+\/[^"]+\.(jpg|jpeg|png|webp)$/i;

    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      // Solo imágenes que pertenecen a esta obra (contienen el slug en el filename)
      if (imgPattern.test(src) &&
          src.includes(obraSlugFromUrl) &&
          !src.includes('/img/m/') &&
          !src.includes('logo')) {
        imagenesSet.add(src);
      }
    });

    // También de data-image-large-src y data-full-size-image-url
    $('[data-full-size-image-url], [data-image-large-src]').each((_, el) => {
      const src = $(el).attr('data-full-size-image-url') || $(el).attr('data-image-large-src') || '';
      if (src && src.includes(obraSlugFromUrl)) imagenesSet.add(normalizarImagenUrl(src));
    });

    const imagenes = [...imagenesSet].filter(Boolean);
    const imagen = imagenes[0] || null;

    return {
      nombre: nombre || relativePath.split('-').slice(1).join(' ').replace('.html', ''),
      categoria: mapCategoria(tipoObra),
      año,
      cliente,
      ubicacion,
      metrosCuadrados,
      descripcion: descripcion || null,
      imagen,
      imagenes,
      _urlOriginal: url,
      _tipoObraOriginal: tipoObra || null,
    };
  } catch (err) {
    console.error(`  ERROR en ${url}:`, err.message);
    return {
      nombre: relativePath,
      categoria: 'Sin categoría',
      _urlOriginal: url,
      _error: err.message,
      imagenes: [],
      imagen: null,
    };
  }
}

async function main() {
  console.log('=== Scraping Otegui Obras ===\n');
  const obras = [];

  for (let i = 0; i < OBRA_URLS.length; i++) {
    const obra = await scrapeObra(OBRA_URLS[i], i);
    obras.push(obra);
    // Pausa entre requests para no saturar el servidor
    if (i < OBRA_URLS.length - 1) {
      await new Promise(r => setTimeout(r, 800));
    }
  }

  const outputPath = 'scripts/obras-scraped.json';
  writeFileSync(outputPath, JSON.stringify(obras, null, 2), 'utf-8');

  console.log(`\n✓ Scraping completo!`);
  console.log(`  Total obras: ${obras.length}`);
  console.log(`  Con imágenes: ${obras.filter(o => o.imagenes?.length > 0).length}`);
  console.log(`  Con errores: ${obras.filter(o => o._error).length}`);
  console.log(`  Guardado en: ${outputPath}`);
}

main().catch(console.error);
