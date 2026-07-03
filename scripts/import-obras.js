/**
 * Script de importación de obras a Firebase (Firestore + Storage)
 *
 * PRE-REQUISITOS:
 * 1. Tener el archivo scripts/obras-scraped.json generado por scrape-obras.js
 * 2. Descargar la clave de servicio de Firebase:
 *    - Ir a: https://console.firebase.google.com/project/pedidos-lett-2/settings/serviceaccounts/adminsdk
 *    - Hacer click en "Generar nueva clave privada"
 *    - Guardar el JSON como: scripts/serviceAccountKey.json
 *
 * Uso: node scripts/import-obras.js
 */

import admin from 'firebase-admin';
import { readFileSync, createWriteStream } from 'fs';
import { Readable } from 'stream';
import path from 'path';

// ── Config ────────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = 'scripts/serviceAccountKey.json';
const OBRAS_JSON_PATH = 'scripts/obras-enriched.json';
const STORAGE_BUCKET = 'pedidos-lett-2.appspot.com';
const COLLECTION = 'otegui_obras';
const STORAGE_FOLDER = 'obras'; // carpeta en Firebase Storage

// ── Init Firebase Admin ───────────────────────────────────────────────────────
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
} catch {
  console.error(`\n❌ No se encontró ${SERVICE_ACCOUNT_PATH}`);
  console.error('   Descargá la clave desde:');
  console.error('   https://console.firebase.google.com/project/pedidos-lett-2/settings/serviceaccounts/adminsdk');
  console.error('   Guardala como: scripts/serviceAccountKey.json\n');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: STORAGE_BUCKET,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// ── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function downloadBuffer(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} descargando ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function subirImagenAStorage(imageUrl, obraSlug, imageIndex) {
  const ext = imageUrl.split('?')[0].split('.').pop().toLowerCase() || 'jpg';
  const fileName = `${STORAGE_FOLDER}/${obraSlug}/${imageIndex}.${ext}`;

  // Verificar si ya existe
  const file = bucket.file(fileName);
  const [exists] = await file.exists();
  if (exists) {
    const [metadata] = await file.getMetadata();
    console.log(`    → Ya existe: ${fileName}`);
    return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(fileName)}?alt=media`;
  }

  // Descargar imagen
  let buffer;
  try {
    buffer = await downloadBuffer(imageUrl);
  } catch (err) {
    console.warn(`    ⚠ No se pudo descargar ${imageUrl}: ${err.message}`);
    return null;
  }

  const contentType = ext === 'png' ? 'image/png' :
                      ext === 'webp' ? 'image/webp' :
                      ext === 'gif' ? 'image/gif' : 'image/jpeg';

  await file.save(buffer, {
    metadata: { contentType },
    public: true,
  });

  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(fileName)}?alt=media`;
  console.log(`    ✓ Subida: ${fileName}`);
  return publicUrl;
}

async function importarObra(obra, index, total) {
  console.log(`\n[${index + 1}/${total}] ${obra.nombre}`);

  // ── Subir imágenes ──────────────────────────────────────────────────────────
  const obraSlug = slugify(obra.nombre) || `obra-${index + 1}`;
  const imagenesSubidas = [];

  if (obra.imagenes?.length > 0) {
    console.log(`  Subiendo ${obra.imagenes.length} imagen(es)...`);
    for (let i = 0; i < obra.imagenes.length; i++) {
      const url = await subirImagenAStorage(obra.imagenes[i], obraSlug, i + 1);
      if (url) imagenesSubidas.push(url);
      await sleep(300);
    }
  } else {
    console.log('  Sin imágenes.');
  }

  // ── Crear documento en Firestore ────────────────────────────────────────────
  const docData = {
    nombre: obra.nombre || '',
    categoria: obra.categoria || 'Sin categoría',
    descripcion: obra.descripcion || '',
    ubicacion: obra.ubicacion || '',
    año: obra.año || null,
    cliente: obra.cliente || '',
    metrosCuadrados: obra.metrosCuadrados || null,
    imagen: imagenesSubidas[0] || obra.imagen || '',
    imagenes: imagenesSubidas.length > 0 ? imagenesSubidas : (obra.imagenes || []),
    destacada: false,
    visible: true,
    orden: index + 1,
    fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
    fechaModificacion: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Limpiar campos undefined/null vacíos
  Object.keys(docData).forEach(key => {
    if (docData[key] === null || docData[key] === '') {
      delete docData[key];
    }
  });

  const docRef = await db.collection(COLLECTION).add(docData);
  console.log(`  ✓ Firestore ID: ${docRef.id}`);
  return docRef.id;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Importando Obras a Firebase ===\n');

  let obras;
  try {
    obras = JSON.parse(readFileSync(OBRAS_JSON_PATH, 'utf-8'));
  } catch {
    console.error(`❌ No se encontró ${OBRAS_JSON_PATH}`);
    console.error('   Primero corré: node scripts/scrape-obras.js\n');
    process.exit(1);
  }

  // Filtrar obras con error de scraping
  const obrasValidas = obras.filter(o => !o._error);
  const obrasConError = obras.filter(o => o._error);

  if (obrasConError.length > 0) {
    console.log(`⚠  ${obrasConError.length} obras con error de scraping serán omitidas:`);
    obrasConError.forEach(o => console.log(`   - ${o._urlOriginal}: ${o._error}`));
    console.log('');
  }

  console.log(`Importando ${obrasValidas.length} obras...\n`);
  const resultados = [];

  for (let i = 0; i < obrasValidas.length; i++) {
    try {
      const id = await importarObra(obrasValidas[i], i, obrasValidas.length);
      resultados.push({ id, nombre: obrasValidas[i].nombre, ok: true });
    } catch (err) {
      console.error(`  ❌ Error importando "${obrasValidas[i].nombre}":`, err.message);
      resultados.push({ nombre: obrasValidas[i].nombre, ok: false, error: err.message });
    }
    // Pausa entre obras para no saturar Firebase
    await sleep(500);
  }

  const exitosas = resultados.filter(r => r.ok).length;
  const fallidas = resultados.filter(r => !r.ok).length;

  console.log('\n=== RESUMEN ===');
  console.log(`✓ Importadas: ${exitosas}/${obrasValidas.length}`);
  if (fallidas > 0) {
    console.log(`✗ Fallidas: ${fallidas}`);
    resultados.filter(r => !r.ok).forEach(r => console.log(`  - ${r.nombre}: ${r.error}`));
  }
  console.log('\n¡Listo! Las obras ya están en Firebase.');
}

main().catch(console.error);
