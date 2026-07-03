/**
 * migrate-to-mysql.mjs
 *
 * Lee export-2026-06-24.json, descarga imágenes Firebase → local,
 * genera SQL INSERT para MySQL, y guarda migration-map.json
 *
 * Uso: node scripts/migrate-to-mysql.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { downloadFileSync } from 'cspell-curl'; // fallback: https module

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const EXPORT_FILE = join(ROOT, 'export-2026-06-24.json');
const OUTPUT_DIR = join(ROOT, 'migration');
const IMAGES_DIR = join(OUTPUT_DIR, 'images');
const SQL_FILE = join(OUTPUT_DIR, 'migration.sql');
const MAP_FILE = join(OUTPUT_DIR, 'migration-map.json');

// Crear directorios
for (const dir of ['obras', 'equipo', 'logos', 'hero', 'obras-destacadas', 'clientes']) {
  mkdirSync(join(IMAGES_DIR, dir), { recursive: true });
}
mkdirSync(join(OUTPUT_DIR, 'cvs'), { recursive: true });

// Cargar JSON
const data = JSON.parse(readFileSync(EXPORT_FILE, 'utf-8'));

// Mapa URL Firebase → ruta local
const urlMap = {};

/**
 * Descargar imagen de Firebase Storage
 */
async function downloadImage(firebaseUrl, localSubdir, filename) {
  const localPath = join(IMAGES_DIR, localSubdir, filename);
  const localUrl = `/images/${localSubdir}/${filename}`;

  if (existsSync(localPath)) {
    urlMap[firebaseUrl] = localUrl;
    return localUrl;
  }

  try {
    const res = await fetch(firebaseUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    // eslint-disable-next-line no-unsafe-fine-control-flow
    const { writeFileSync: write } = await import('fs');
    write(localPath, buf);
    urlMap[firebaseUrl] = localUrl;
    console.log(`  ✓ Descargada: ${localUrl}`);
    return localUrl;
  } catch (err) {
    console.warn(`  ✗ Error descargando ${firebaseUrl}: ${err.message}`);
    urlMap[firebaseUrl] = localUrl; // Mapear igual aunque falle
    return localUrl;
  }
}

/**
 * Extraer nombre de archivo desde URL Firebase Storage
 */
function extractFilename(url) {
  try {
    // URL: .../o/obras%2Ffolder%2F1.jpg?alt=media
    const pathPart = url.split('/o/')[1]?.split('?')[0];
    if (pathPart) {
      const decoded = decodeURIComponent(pathPart);
      const parts = decoded.split('/');
      return parts[parts.length - 1];
    }
  } catch {}
  // Fallback
  return url.split('/').pop()?.split('?')[0] || 'unknown.jpg';
}

/**
 * Escapar string para SQL
 */
function sqlEsc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  return "'" + String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

// ============================================================
// PROCESAR OBRAS
// ============================================================
async function processObras() {
  console.log('\n=== Procesando Obras ===');
  const obras = data.otegui_obras || [];
  const inserts = [];

  for (const obra of obras) {
    console.log(`Procesando: ${obra.nombre}`);

    // Descargar cada imagen y mapear URL
    const imagenesLocales = [];
    const imagenesArr = obra.imagenes || [];
    for (let i = 0; i < imagenesArr.length; i++) {
      const firebaseUrl = imagenesArr[i];
      const originalName = extractFilename(firebaseUrl);
      const slug = obra.nombre
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 40);
      const filename = `${slug}-${i + 1}-${originalName}`;
      await downloadImage(firebaseUrl, 'obras', filename);
      imagenesLocales.push(`/images/obras/${filename}`);
    }

    // Imagen portada
    const imagenPortada = obra.imagenPortada ?? obra.imagen_portada ?? 0;

    inserts.push(
      `INSERT INTO obras (nombre, categoria, ubicacion, anno, descripcion, imagenes, imagen_portada, metros_cuadrados, cliente, destacada, visible, orden) VALUES (` +
      `${sqlEsc(obra.nombre)}, ` +
      `${sqlEsc(obra.categoria || 'Retail / Comercial')}, ` +
      `${sqlEsc(obra.ubicacion || null)}, ` +
      `${sqlEsc(obra.año || obra.anno || null)}, ` +
      `${sqlEsc(obra.descripcion || null)}, ` +
      `${sqlEsc(JSON.stringify(imagenesLocales))}, ` +
      `${sqlEsc(imagenPortada)}, ` +
      `${sqlEsc(obra.metrosCuadrados || obra.metros_cuadrados || null)}, ` +
      `${sqlEsc(obra.cliente || null)}, ` +
      `${sqlEsc(obra.destacada ? 1 : 0)}, ` +
      `${sqlEsc(obra.visible ? 1 : 0)}, ` +
      `${sqlEsc(obra.orden || 0)}` +
      `);`
    );
  }

  return inserts;
}

// ============================================================
// PROCESAR EQUIPO
// ============================================================
async function processEquipo() {
  console.log('\n=== Procesando Equipo ===');
  const equipo = data.otegui_equipo || [];
  const inserts = [];

  for (const miembro of equipo) {
    console.log(`Procesando: ${miembro.nombre}`);

    let fotoLocal = null;
    if (miembro.foto) {
      const originalName = extractFilename(miembro.foto);
      const slug = miembro.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 30);
      const filename = `${slug}-${originalName}`;
      fotoLocal = await downloadImage(miembro.foto, 'equipo', filename);
    }

    inserts.push(
      `INSERT INTO equipo (nombre, cargo, especialidad, foto, visible, orden) VALUES (` +
      `${sqlEsc(miembro.nombre)}, ` +
      `${sqlEsc(miembro.cargo || null)}, ` +
      `${sqlEsc(miembro.especialidad || null)}, ` +
      `${sqlEsc(fotoLocal)}, ` +
      `${sqlEsc(miembro.visible ? 1 : 0)}, ` +
      `${sqlEsc(miembro.orden || 0)}` +
      `);`
    );
  }

  return inserts;
}

// ============================================================
// CONFIG DEFAULTS (desde código frontend, no en export)
// ============================================================
function processConfig() {
  console.log('\n=== Procesando Config ===');

  // Home config (default del frontend)
  const homeConfig = {
    hero: {
      heroVideoUrl: "",
      titulo: "Construimos",
      tituloDestacado: "Espacios",
      subtitulo: "Excelencia en construcción corporativa e industrial",
      posicion: "centro",
      colorTexto: "#ffffff",
      colorDestacado: "#e8b84b",
      fontSize: "normal"
    },
    metricas: {
      anos: { valor: 22, unidad: "", label: "Años de experiencia" },
      metrosConstructidos: { valor: 150000, unidad: "m²", label: "construidos" },
      proyectos: { valor: 200, unidad: "", label: "Obras realizadas" }
    }
  };

  // Clientes config
  const clientesConfig = {
    clientes: [
      { id: 1, nombre: "BBVA", logoUrl: "/logos/bbva.svg", orden: 1 },
      { id: 2, nombre: "Banco Galicia", logoUrl: "/logos/banco-galicia.svg", orden: 2 },
      { id: 3, nombre: "Isadora", logoUrl: "/logos/isadora.svg", orden: 3 },
      { id: 4, nombre: "Mercedes-Benz", logoUrl: "/logos/mercedes-benz.svg", orden: 4 },
      { id: 5, nombre: "Pfizer", logoUrl: "/logos/pfizer.svg", orden: 5 },
      { id: 6, nombre: "Samsung", logoUrl: "/logos/samsung.svg", orden: 6 }
    ]
  };

  // FAQ config
  const faqConfig = {
    preguntas: [
      { id: 1, pregunta: "¿Puedo fraccionar la obra por etapas?", respuesta: "Sí, ofrecemos la posibilidad de fraccionar tu proyecto en etapas para adaptarnos a tus necesidades y presupuesto.", orden: 1 },
      { id: 2, pregunta: "¿Cómo garantizan los tiempos de entrega?", respuesta: "Trabajamos con cronogramas detallados y un sistema de gestión de proyectos que nos permite monitorear cada etapa.", orden: 2 },
      { id: 3, pregunta: "¿Tienen casos de obras similares?", respuesta: "Contamos con un amplio portfolio de obras residenciales, comerciales e industriales.", orden: 3 },
      { id: 4, pregunta: "¿Incluyen la ingeniería y los planos?", respuesta: "Sí, contamos con un equipo de ingenieros y arquitectos que se encargan del diseño completo.", orden: 4 },
      { id: 5, pregunta: "¿Qué tipo de obras hacen?", respuesta: "Realizamos todo tipo de construcciones: viviendas unifamiliares, edificios, locales comerciales, galpones industriales.", orden: 5 }
    ]
  };

  // Obras destacadas config (default placeholders)
  const destacadasConfig = {
    obras: [
      { id: 1, titulo: "Hicimos reformas en el Secretariado Nacional de la UOM", categoria: "Retail / Comercial", descripcion: "Reforma integral del edificio emblemático de la Unión Obrera Metalúrgica", imagen: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", año: 2023, metrosCuadrados: "2,500", ubicacion: "Buenos Aires" },
      { id: 2, titulo: "Entregamos Oficinas Piso 10 MOSTAZA", categoria: "Gastronómico", descripcion: "Diseño y construcción de oficinas corporativas", imagen: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", año: 2024, metrosCuadrados: "1,800", ubicacion: "CABA" },
      { id: 3, titulo: "Construimos el nuevo Centro de Salud Integral", categoria: "Hospitalario", descripcion: "Centro médico de última generación", imagen: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80", año: 2024, metrosCuadrados: "3,200", ubicacion: "Provincia de Buenos Aires" },
      { id: 4, titulo: "Completamos Torre Residencial Solares del Río", categoria: "Inmobiliario", descripcion: "Complejo residencial premium", imagen: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80", año: 2023, metrosCuadrados: "5,400", ubicacion: "Rosario" }
    ]
  };

  return [
    `INSERT INTO config (config_key, config_value) VALUES ('home', ${sqlEsc(JSON.stringify(homeConfig))}) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);`,
    `INSERT INTO config (config_key, config_value) VALUES ('clientes', ${sqlEsc(JSON.stringify(clientesConfig))}) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);`,
    `INSERT INTO config (config_key, config_value) VALUES ('faq', ${sqlEsc(JSON.stringify(faqConfig))}) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);`,
    `INSERT INTO config (config_key, config_value) VALUES ('obras_destacadas', ${sqlEsc(JSON.stringify(destacadasConfig))}) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);`
  ];
}

// ============================================================
// ADMIN SEED
// ============================================================
function generateAdminSeed() {
  //bcrypt hash para "admin123" — cambiar al hacer deploy
  const bcryptHash = '$2y$10$dummyReplaceMeWithActualBcryptHash';
  return `-- Admin seed (cambiar password_hash por bcrypt hash real)\nINSERT INTO admins (email, password_hash) VALUES ('admin@oteguiobras.com', '${bcryptHash}') ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);`;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('🔄 Migración Firebase → MySQL + filesystem\n');
  console.log(`Directorio imágenes: ${IMAGES_DIR}`);

  const obrasInserts = await processObras();
  const equipoInserts = await processEquipo();
  const configInserts = processConfig();

  // Generar SQL completo
  const sql = [
    '-- ============================================================',
    '-- Migración Otegui Obras: Firebase → MySQL',
    '-- Generado automáticamente por migrate-to-mysql.mjs',
    `-- Fecha: ${new Date().toISOString().split('T')[0]}`,
    '-- ============================================================',
    '',
    '-- Schema (ejecutar primero si no existe)',
    'CREATE TABLE IF NOT EXISTS obras (',
    '  id INT AUTO_INCREMENT PRIMARY KEY,',
    '  nombre VARCHAR(255) NOT NULL,',
    '  categoria VARCHAR(100) DEFAULT \'Retail / Comercial\',',
    '  ubicacion VARCHAR(255),',
    '  anno INT,',
    '  descripcion TEXT,',
    '  imagenes JSON,',
    '  imagen_portada INT DEFAULT 0,',
    '  metros_cuadrados DECIMAL(10,2),',
    '  cliente VARCHAR(255),',
    '  destacada TINYINT(1) DEFAULT 0,',
    '  visible TINYINT(1) DEFAULT 1,',
    '  orden INT DEFAULT 0,',
    '  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,',
    '  fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS equipo (',
    '  id INT AUTO_INCREMENT PRIMARY KEY,',
    '  nombre VARCHAR(255) NOT NULL,',
    '  cargo VARCHAR(255),',
    '  especialidad VARCHAR(255),',
    '  foto VARCHAR(500),',
    '  visible TINYINT(1) DEFAULT 1,',
    '  orden INT DEFAULT 0,',
    '  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS contacto (',
    '  id INT AUTO_INCREMENT PRIMARY KEY,',
    '  nombre VARCHAR(255),',
    '  email VARCHAR(255),',
    '  telefono VARCHAR(100),',
    '  empresa VARCHAR(255),',
    '  mensaje TEXT,',
    '  leido TINYINT(1) DEFAULT 0,',
    '  fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS postulaciones (',
    '  id INT AUTO_INCREMENT PRIMARY KEY,',
    '  nombre VARCHAR(255),',
    '  email VARCHAR(255),',
    '  telefono VARCHAR(100),',
    '  linkedin VARCHAR(500),',
    '  cv_url VARCHAR(500),',
    '  leido TINYINT(1) DEFAULT 0,',
    '  fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS config (',
    '  config_key VARCHAR(100) PRIMARY KEY,',
    '  config_value JSON NOT NULL',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS admins (',
    '  id INT AUTO_INCREMENT PRIMARY KEY,',
    '  email VARCHAR(255) UNIQUE NOT NULL,',
    '  password_hash VARCHAR(255) NOT NULL,',
    '  creado DATETIME DEFAULT CURRENT_TIMESTAMP',
    ');',
    '',
    '-- ============================================================',
    '-- Datos migrados',
    '-- ============================================================',
    '',
    '-- Obras',
    ...obrasInserts,
    '',
    '-- Equipo',
    ...equipoInserts,
    '',
    '-- Config',
    ...configInserts,
    '',
    '-- Admin',
    generateAdminSeed(),
    ''
  ].join('\n');

  writeFileSync(SQL_FILE, sql, 'utf-8');
  writeFileSync(MAP_FILE, JSON.stringify(urlMap, null, 2), 'utf-8');

  console.log('\n=== Resumen ===');
  console.log(`Obras: ${obrasInserts.length}`);
  console.log(`Equipo: ${equipoInserts.length}`);
  console.log(`Config: ${configInserts.length} filas`);
  console.log(`URLs mapeadas: ${Object.keys(urlMap).length}`);
  console.log(`\nSQL generado: ${SQL_FILE}`);
  console.log(`Mapa URLs: ${MAP_FILE}`);
  console.log(`Imágenes: ${IMAGES_DIR}`);
  console.log('\n✅ Migración completada');
}

main().catch(err => {
  console.error('Error en migración:', err);
  process.exit(1);
});
