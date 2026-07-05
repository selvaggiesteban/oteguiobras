<?php
// ══════════════════════════════════════════════════════════════
// OTEGUI OBRAS — INSTALADOR v1.0
// Deploy one-shot vía GitHub (repo privado)
// ══════════════════════════════════════════════════════════════
// INSTRUCCIONES:
// 1. Editar la sección $CONFIG más abajo con tus datos
// 2. Subir este archivo vía FTP/FileManager a /public_html/
// 3. Abrir https://tudominio.com/install.php en el navegador
// 4. Click "Instalar" y esperar
// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
// EDITAR ANTES DE SUBIR — Datos de configuración
// ══════════════════════════════════════════════════════════════
$CONFIG = [
  // GitHub (repo privado — generar PAT con acceso de lectura al repo)
  // GitHub → Settings → Developer settings → Personal access tokens
  // → Fine-grained tokens → Generate new token
  // → Repository access: Only select repositories → selvaggiesteban/oteguiobras
  // → Permissions: Contents (Read-only)
  'github_token'  => '',                    // ← PEGAR tu GitHub PAT aquí
  'github_repo'   => 'selvaggiesteban/oteguiobras',
  'github_branch' => 'main',

  // Base de datos (DirectAdmin → MySQL Databases)
  'db_host' => 'localhost',
  'db_name' => 'oteguiobra_web',
  'db_user' => 'oteguiobra_web',
  'db_pass' => '',                          // ← PEGAR tu contraseña de BD aquí
];

// ══════════════════════════════════════════════════════════════
// NO EDITAR DEBAJO DE ESTA LÍNEA
// ══════════════════════════════════════════════════════════════

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

$log = [];
$logFile = sys_get_temp_dir() . '/oteGUI_OBRAS_install.log';

function addLog($msg, $ok = true) {
  global $log, $logFile;
  $icon = $ok ? '✓' : '✗';
  $log[] = compact('icon', 'msg');
  file_put_contents($logFile, date('[Y-m-d H:i:s] ') . "$icon $msg\n", FILE_APPEND);
}

function jsonResponse($data, $code = 200) {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data);
  exit;
}

// ─── Si es AJAX (polling de progreso) ────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action'])) {
  if ($_GET['action'] === 'log') {
    jsonResponse(['log' => $log]);
  }
}

// ─── POST: Ejecutar instalación ──────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  header('Content-Type: application/json; charset=utf-8');

  // 0. Leer valores del POST body y mergear con $CONFIG
  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  foreach ($input as $key => $value) {
    if (array_key_exists($key, $CONFIG) && $value !== '') {
      $CONFIG[$key] = $value;
    }
  }

  if (empty($CONFIG['github_token']) || empty($CONFIG['db_pass'])) {
    jsonResponse(['error' => 'Debes editar install.php y completar github_token y db_pass antes de subirlo.', 'step' => 0], 400);
  }

  // 1. Requisitos del servidor
  addLog('Verificando requisitos del servidor...');

  $phpOk = version_compare(PHP_VERSION, '7.4.0', '>=');
  addLog("PHP " . PHP_VERSION, $phpOk);

  $pdoOk = extension_loaded('pdo_mysql');
  addLog('ext-pdo_mysql', $pdoOk);

  $zipOk = class_exists('ZipArchive') || function_exists('exec');
  addLog('unzip/ZipArchive: ' . ($zipOk ? 'disponible' : 'faltan ambos'), $zipOk);

  $curlOk = function_exists('curl_init');
  addLog('ext-curl', $curlOk);

  $jsonOk = extension_loaded('json');
  addLog('ext-json', $jsonOk);

  if (!$phpOk || !$pdoOk || !$zipOk || !$curlOk || !$jsonOk) {
    jsonResponse(['error' => 'Faltan requisitos del servidor. Ver log.', 'step' => 1, 'log' => $log], 500);
  }

  // Verificar directorio actual writable
  $testFile = sys_get_temp_dir() . '/oteGUI_write_test';
  $writable = @file_put_contents($testFile, 'ok') !== false;
  if ($writable) @unlink($testFile);
  addLog('Directorio temporal writable', $writable);

  // 2. Verificar instalación previa
  addLog('Verificando instalación previa...');
  $envFile = __DIR__ . '/api/.env';
  if (file_exists($envFile)) {
    addLog('Ya existe api/.env — instalación previa detectada', false);
    addLog('Si querés reinstalar, eliminá el directorio api/ y este archivo primero', false);
    jsonResponse(['error' => 'Instalación previa detectada. Eliminá api/ y install.php primero.', 'step' => 2, 'log' => $log], 409);
  }
  addLog('No hay instalación previa');

  // 3. Descargar desde GitHub (stream directo a disco — sin cargar en memoria)
  addLog('Descargando desde GitHub...');
  $zipUrl = "https://api.github.com/repos/{$CONFIG['github_repo']}/zipball/{$CONFIG['github_branch']}";
  $tmpZip = tempnam(sys_get_temp_dir(), 'oteGUI_') . '.zip';

  $fp = fopen($tmpZip, 'wb');
  if (!$fp) {
    jsonResponse(['error' => 'No se pudo crear archivo temporal', 'step' => 3], 500);
  }

  $ch = curl_init($zipUrl);
  curl_setopt_array($ch, [
    CURLOPT_FILE => $fp,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 600,
    CURLOPT_HTTPHEADER => [
      'Authorization: Bearer ' . $CONFIG['github_token'],
      'Accept: application/vnd.github+json',
      'User-Agent: OteguiObras-Installer/1.0',
    ],
  ]);
  curl_exec($ch);
  $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $curlError = curl_error($ch);
  $bytesDownloaded = curl_getinfo($ch, CURLINFO_SIZE_DOWNLOAD);
  curl_close($ch);
  fclose($fp);

  if ($curlError) {
    addLog("Error de conexión: $curlError", false);
    jsonResponse(['error' => "Error conectando a GitHub: $curlError", 'step' => 3, 'log' => $log], 500);
  }

  if ($httpCode !== 200) {
    $msg = "HTTP $httpCode";
    if ($httpCode === 401) $msg .= ' — Token inválido o sin permisos';
    if ($httpCode === 404) $msg .= ' — Repo no encontrado';
    addLog("Error de GitHub: $msg", false);
    jsonResponse(['error' => "Error de GitHub: $msg", 'step' => 3, 'log' => $log], 500);
  }

  $zipSize = filesize($tmpZip);
  addLog("Descargado: " . number_format($zipSize / 1024 / 1024, 1) . " MB");

  // 4. Extraer archivos (usar unzip command — mínimo uso de memoria)
  addLog('Extrayendo archivos...');

  $extractDir = sys_get_temp_dir() . '/oteGUI_extract_' . uniqid();
  mkdir($extractDir, 0755, true);

  // Intentar con exec('unzip') primero (mínima memoria)
  $unzipOk = false;
  if (function_exists('exec')) {
    $cmd = sprintf('unzip -o %s -d %s 2>&1', escapeshellarg($tmpZip), escapeshellarg($extractDir));
    exec($cmd, $unzipOutput, $unzipReturn);
    $unzipOk = ($unzipReturn === 0);
    if (!$unzipOk) {
      addLog("unzip falló (código $unzipReturn), intentando ZipArchive...", false);
    }
  }

  // Fallback: ZipArchive (más memoria pero funcional)
  if (!$unzipOk) {
    if (!class_exists('ZipArchive')) {
      jsonResponse(['error' => 'No hay unzip ni ZipArchive disponible', 'step' => 4, 'log' => $log], 500);
    }
    $zip = new ZipArchive();
    if ($zip->open($tmpZip) !== true) {
      jsonResponse(['error' => 'Error abriendo archivo zip', 'step' => 4, 'log' => $log], 500);
    }
    $zip->extractTo($extractDir);
    $zip->close();
  }
  addLog('Archivos extraídos');

  // Encontrar el directorio raíz del zip (GitHub agrega un prefijo)
  $subdirs = glob("$extractDir/*", GLOB_ONLYDIR);
  if (count($subdirs) !== 1 || !is_dir($subdirs[0])) {
    addLog('Estructura de zip inesperada', false);
    jsonResponse(['error' => 'Estructura de zip inesperada', 'step' => 4, 'log' => $log], 500);
  }
  $repoDir = $subdirs[0];

  // Archivos/directorios a copiar (solo lo necesario para producción)
  // 'dist_contents' = copiar CONTENIDO de dist/ al root (no como subdirectorio)
  $includePaths = [
    'dist_contents' => 'dist',     // Built frontend → root
    'api'           => 'api',       // PHP backend
    'migration'     => 'migration', // SQL files
    'images'        => 'images',    // Static images
    'logos'         => 'logos',     // SVG logos
  ];

  // Archivos individuales a copiar al root
  $includeFiles = [
    '.htaccess',
    '.user.ini',
    'hero-video.mp4',
  ];

  // Directorios a excluir de dist/ (redundantes o sensibles)
  $distExclude = ['api', '.git', 'node_modules'];

  $totalFiles = 0;

  // Copiar contents de dist/ al root
  $distSrc = $repoDir . '/dist';
  if (is_dir($distSrc)) {
    addLog('Copiando frontend compilado al root...');
    $it = new RecursiveIteratorIterator(
      new RecursiveDirectoryIterator($distSrc, RecursiveDirectoryIterator::SKIP_DOTS),
      RecursiveIteratorIterator::SELF_FIRST
    );
    foreach ($it as $file) {
      // Obtener path relativo dentro de dist/
      $relPath = substr($file->getPathname(), strlen($distSrc) + 1);

      // Excluir directorios sensibles
      $excluded = false;
      foreach ($distExclude as $exc) {
        if (strpos($relPath, $exc . '/') === 0 || $relPath === $exc) {
          $excluded = true;
          break;
        }
      }
      if ($excluded) continue;

      $dest = __DIR__ . '/' . $relPath;
      if ($file->isDir()) {
        if (!is_dir($dest)) mkdir($dest, 0755, true);
      } else {
        $destDir = dirname($dest);
        if (!is_dir($destDir)) mkdir($destDir, 0755, true);
        copy($file->getPathname(), $dest);
        $totalFiles++;
      }
    }
    addLog("dist/ → root ($totalFiles archivos)");
  } else {
    addLog('dist/ no encontrado en repo', false);
  }

  // Copiar directorios adicionales
  foreach ($includePaths as $destName => $srcName) {
    if ($destName === 'dist_contents') continue; // Ya copiado

    $src = $repoDir . '/' . $srcName;
    if (!file_exists($src)) {
      addLog("$srcName/ (no encontrado en repo, saltando)", false);
      continue;
    }

    if (is_dir($src)) {
      $beforeCount = $totalFiles;
      $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($src, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
      );
      foreach ($it as $file) {
        $relPath = substr($file->getPathname(), strlen($repoDir) + 1);
        $dest = __DIR__ . '/' . $relPath;
        if ($file->isDir()) {
          if (!is_dir($dest)) mkdir($dest, 0755, true);
        } else {
          $destDir = dirname($dest);
          if (!is_dir($destDir)) mkdir($destDir, 0755, true);
          copy($file->getPathname(), $dest);
          $totalFiles++;
        }
      }
      addLog("$srcName/ (" . ($totalFiles - $beforeCount) . " archivos)");
    }
  }

  // Copiar archivos individuales
  foreach ($includeFiles as $file) {
    $src = $repoDir . '/' . $file;
    if (!file_exists($src)) {
      addLog("$file (no encontrado, saltando)", false);
      continue;
    }
    $dest = __DIR__ . '/' . $file;
    copy($src, $dest);
    $totalFiles++;
    $size = filesize($src);
    addLog("$file (" . ($size > 1024 ? number_format($size / 1024, 1) . ' KB' : $size . ' B') . ")");
  }

  addLog("Total: $totalFiles archivos extraídos");

  // 5. Base de datos
  addLog('Configurando base de datos...');

  try {
    $pdo = new PDO(
      "mysql:host={$CONFIG['db_host']};charset=utf8mb4",
      $CONFIG['db_user'],
      $CONFIG['db_pass'],
      [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    addLog('Conexión PDO exitosa');
  } catch (PDOException $e) {
    addLog("Error de conexión: " . $e->getMessage(), false);
    jsonResponse(['error' => "Error de conexión a MySQL: " . $e->getMessage(), 'step' => 5, 'log' => $log], 500);
  }

  // Seleccionar base de datos (debe estar pre-creada en DirectAdmin)
  $pdo->exec("USE `{$CONFIG['db_name']}`");

  // Ejecutar schema-and-seed.sql
  $schemaFile = __DIR__ . '/migration/schema-and-seed.sql';
  if (file_exists($schemaFile)) {
    $sql = file_get_contents($schemaFile);
    // Dividir por punto y coma y ejecutar cada statement
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    $executed = 0;
    foreach ($statements as $stmt) {
      if (empty($stmt) || str_starts_with($stmt, '--')) continue;
      try {
        $pdo->exec($stmt);
        $executed++;
      } catch (PDOException $e) {
        // Ignorar errores de duplicados (IF NOT EXISTS / ON DUPLICATE KEY)
        if (str_contains($e->getMessage(), 'Duplicate')) continue;
        addLog("SQL Warning: " . $e->getMessage(), false);
      }
    }
    addLog("schema-and-seed.sql ejecutado ($executed statements)");
  } else {
    addLog('schema-and-seed.sql no encontrado', false);
  }

  // Ejecutar obras-seed.sql
  $obrasFile = __DIR__ . '/migration/obras-seed.sql';
  if (file_exists($obrasFile)) {
    $sql = file_get_contents($obrasFile);
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    $executed = 0;
    foreach ($statements as $stmt) {
      if (empty($stmt) || str_starts_with($stmt, '--')) continue;
      try {
        $pdo->exec($stmt);
        $executed++;
      } catch (PDOException $e) {
        if (str_contains($e->getMessage(), 'Duplicate')) continue;
        addLog("SQL Warning: " . $e->getMessage(), false);
      }
    }
    addLog("obras-seed.sql ejecutado ($executed inserts)");
  } else {
    addLog('obras-seed.sql no encontrado', false);
  }

  // 6. Configuración
  addLog('Configurando archivos...');

  // Crear api/.env
  $envContent = "DB_HOST={$CONFIG['db_host']}\n"
    . "DB_NAME={$CONFIG['db_name']}\n"
    . "DB_USER={$CONFIG['db_user']}\n"
    . "DB_PASS={$CONFIG['db_pass']}\n";

  $envDest = __DIR__ . '/api/.env';
  file_put_contents($envDest, $envContent);
  chmod($envDest, 0640);
  addLog('api/.env creado');

  // Crear directorios necesarios
  $dirs = ['cvs', 'images/obras', 'images/logos', 'images/equipo', 'images/hero'];
  foreach ($dirs as $dir) {
    $fullPath = __DIR__ . '/' . $dir;
    if (!is_dir($fullPath)) {
      mkdir($fullPath, 0755, true);
      addLog("Directorio $dir/ creado");
    }
  }

  // Permisos de escritura
  $writableDirs = ['images', 'cvs'];
  foreach ($writableDirs as $dir) {
    $fullPath = __DIR__ . '/' . $dir;
    if (is_dir($fullPath)) {
      @chmod($fullPath, 0755);
    }
  }
  addLog('Permisos 755: images/, cvs/');

  // 7. Limpieza
  addLog('Limpiando archivos temporales...');
  // Eliminar directorio de extracción
  $it = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($extractDir, RecursiveDirectoryIterator::SKIP_DOTS),
    RecursiveIteratorIterator::CHILD_FIRST
  );
  foreach ($it as $file) {
    if ($file->isDir()) rmdir($file->getPathname());
    else unlink($file->getPathname());
  }
  rmdir($extractDir);
  @unlink($tmpZip);
  addLog('Archivos temporales eliminados');

  // 8. Éxito
  addLog('');
  addLog('═══════════════════════════════════════════════');
  addLog('✓ INSTALACIÓN COMPLETADA');
  addLog('═══════════════════════════════════════════════');

  jsonResponse([
    'success' => true,
    'step' => 7,
    'log' => $log,
    'site_url' => (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
      . '://' . $_SERVER['HTTP_HOST'],
    'admin_url' => (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
      . '://' . $_SERVER['HTTP_HOST'] . '/#/admin',
    'admin_email' => 'admin@oteguiobras.com',
    'admin_pass' => 'Otegui2026!',
  ]);
  exit;
}

// ══════════════════════════════════════════════════════════════
// HTML: Interfaz del instalador
// ══════════════════════════════════════════════════════════════
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Otegui Obras — Instalador</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .installer {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 40px;
      max-width: 600px;
      width: 100%;
    }
    .brand {
      text-align: center;
      margin-bottom: 32px;
    }
    .brand-logo {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #d4a574, #e8b84b);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 auto 16px;
    }
    .brand h1 {
      font-size: 1.5rem;
      color: #fff;
      margin-bottom: 4px;
    }
    .brand p {
      color: #94a3b8;
      font-size: 0.9rem;
    }
    .field {
      margin-bottom: 16px;
    }
    .field label {
      display: block;
      font-size: 0.8rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .field input {
      width: 100%;
      padding: 10px 14px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #e2e8f0;
      font-size: 0.95rem;
      font-family: monospace;
      outline: none;
      transition: border-color 0.2s;
    }
    .field input:focus {
      border-color: #d4a574;
    }
    .field .hint {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 4px;
    }
    .section-title {
      font-size: 0.75rem;
      color: #d4a574;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 24px 0 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #334155;
    }
    .btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #d4a574, #e8b84b);
      color: #0f172a;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 24px;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .log-panel {
      display: none;
      margin-top: 24px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 16px;
      max-height: 400px;
      overflow-y: auto;
      font-family: monospace;
      font-size: 0.8rem;
      line-height: 1.8;
    }
    .log-line { white-space: pre-wrap; }
    .log-ok { color: #22c55e; }
    .log-err { color: #ef4444; }
    .log-info { color: #94a3b8; }
    .success-panel {
      display: none;
      text-align: center;
      margin-top: 24px;
      padding: 24px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 8px;
    }
    .success-panel h2 { color: #22c55e; margin-bottom: 16px; }
    .success-panel .cred {
      display: inline-block;
      background: #0f172a;
      padding: 8px 16px;
      border-radius: 6px;
      margin: 4px;
      font-family: monospace;
      font-size: 0.85rem;
      color: #e2e8f0;
    }
    .success-panel a {
      color: #d4a574;
      text-decoration: none;
    }
    .success-panel a:hover { text-decoration: underline; }
    .warning-box {
      margin-top: 16px;
      padding: 12px;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 6px;
      color: #f59e0b;
      font-size: 0.85rem;
    }
    .error-panel {
      display: none;
      text-align: center;
      margin-top: 24px;
      padding: 16px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      color: #ef4444;
    }
    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #0f172a;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      vertical-align: middle;
      margin-right: 8px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="installer">
    <div class="brand">
      <div class="brand-logo">OO</div>
      <h1>Otegui Obras</h1>
      <p>Instalador de producción</p>
    </div>

    <form id="installForm">
      <div class="section-title">GitHub (repo privado)</div>

      <div class="field">
        <label>GitHub Personal Access Token</label>
        <input type="password" id="github_token"
          value="<?= htmlspecialchars($CONFIG['github_token']) ?>"
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" required>
        <div class="hint">
          GitHub → Settings → Developer settings → Personal access tokens → Fine-grained
          → Generate new token → Repository: oteguiobras (Read-only)
        </div>
      </div>

      <div class="section-title">Base de datos (DirectAdmin)</div>

      <div class="field">
        <label>DB Host</label>
        <input type="text" id="db_host" value="<?= htmlspecialchars($CONFIG['db_host']) ?>">
      </div>
      <div class="field">
        <label>DB Name</label>
        <input type="text" id="db_name" value="<?= htmlspecialchars($CONFIG['db_name']) ?>">
      </div>
      <div class="field">
        <label>DB User</label>
        <input type="text" id="db_user" value="<?= htmlspecialchars($CONFIG['db_user']) ?>">
      </div>
      <div class="field">
        <label>DB Password</label>
        <input type="password" id="db_pass"
          value="<?= htmlspecialchars($CONFIG['db_pass']) ?>"
          placeholder="Tu contraseña de base de datos" required>
        <div class="hint">DirectAdmin → MySQL Databases → crear BD + usuario si no existen</div>
      </div>

      <button type="submit" class="btn" id="btnInstall">
        Instalar Otegui Obras
      </button>
    </form>

    <div class="log-panel" id="logPanel"></div>
    <div class="error-panel" id="errorPanel"></div>
    <div class="success-panel" id="successPanel"></div>
  </div>

  <script>
    const form = document.getElementById('installForm');
    const logPanel = document.getElementById('logPanel');
    const errorPanel = document.getElementById('errorPanel');
    const successPanel = document.getElementById('successPanel');
    const btnInstall = document.getElementById('btnInstall');

    function appendLog(msg, type) {
      logPanel.style.display = 'block';
      const line = document.createElement('div');
      line.className = 'log-line ' + (type === 'ok' ? 'log-ok' : type === 'err' ? 'log-err' : 'log-info');
      line.textContent = msg;
      logPanel.appendChild(line);
      logPanel.scrollTop = logPanel.scrollHeight;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Disable form
      btnInstall.disabled = true;
      btnInstall.innerHTML = '<span class="spinner"></span> Instalando...';
      logPanel.innerHTML = '';
      errorPanel.style.display = 'none';
      successPanel.style.display = 'none';

      appendLog('Iniciando instalación...', 'info');

      const payload = {
        github_token: document.getElementById('github_token').value,
        github_repo: <?= json_encode($CONFIG['github_repo']) ?>,
        github_branch: <?= json_encode($CONFIG['github_branch']) ?>,
        db_host: document.getElementById('db_host').value,
        db_name: document.getElementById('db_name').value,
        db_user: document.getElementById('db_user').value,
        db_pass: document.getElementById('db_pass').value,
      };

      try {
        const res = await fetch('install.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        // Render log
        if (data.log) {
          logPanel.innerHTML = '';
          data.log.forEach(l => {
            appendLog(`  ${l.icon} ${l.msg}`, l.icon === '✓' ? 'ok' : 'err');
          });
        }

        if (data.success) {
          successPanel.style.display = 'block';
          successPanel.innerHTML = `
            <h2>✓ Instalación completada</h2>
            <p style="margin-bottom:16px;color:#94a3b8;">El sitio ya está funcionando:</p>
            <p><a href="${data.site_url}" target="_blank" class="cred">${data.site_url}</a></p>
            <p style="margin-top:12px;">Panel de administración:</p>
            <p><a href="${data.admin_url}" target="_blank" class="cred">${data.admin_url}</a></p>
            <p style="margin-top:12px;">Credenciales admin:</p>
            <p><span class="cred">${data.admin_email}</span></p>
            <p><span class="cred">${data.admin_pass}</span></p>
            <div class="warning-box">
              ⚠ No olvides subir el video hero vía FTP a:<br>
              <code>/public_html/images/hero/hero-video.mp4</code><br>
              Luego configurarlo en Admin → Home → Hero Video URL
            </div>
            <div class="warning-box" style="margin-top:8px;">
              ⚠ Por seguridad, podés eliminar install.php después de verificar que todo funciona.
            </div>
          `;
        } else {
          errorPanel.style.display = 'block';
          errorPanel.innerHTML = `<strong>Error:</strong> ${data.error}`;
        }

      } catch (err) {
        appendLog('Error de conexión: ' + err.message, 'err');
        errorPanel.style.display = 'block';
        errorPanel.innerHTML = `<strong>Error:</strong> ${err.message}`;
      }

      btnInstall.disabled = false;
      btnInstall.innerHTML = 'Instalar Otegui Obras';
    });
  </script>
</body>
</html>
